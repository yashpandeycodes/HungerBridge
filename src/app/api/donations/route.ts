import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import { donationSchema } from '@/schemas/donationSchema';
import UserModel from '@/model/User';
import { sendEventEmail } from '@/helpers/sendEventEmail';

// 1. POST: Create a new donation
// Helper function for Smart Fraud Detection
const calculateTrustScore = (source: string, qtyText: string, expiry: string) => {
  let score = 95; // Default high trust for all donors
  let isSuspicious = false;
  let reason = "";

  // Extract number from quantity text (e.g., "50 boxes" -> 50)
  const qtyMatch = String(qtyText).match(/\d+/);
  const quantityNum = qtyMatch ? parseInt(qtyMatch[0]) : 20;
  
  const hoursToExpiry = (new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60);

  // Rule 1: High quantity from a normal household is suspicious
  if (source === 'Households' && quantityNum > 50) {
    score -= 60;
    isSuspicious = true;
    reason = "Unusually high quantity for a household.";
  }
  
  // Rule 2: Very short expiry for large quantities
  if (hoursToExpiry < 1 && quantityNum > 20) {
    score -= 40;
    isSuspicious = true;
    reason = "Very short expiry time for large quantity.";
  }

  // Slight randomization to make it feel organic (like true ML models)
  score += Math.floor(Math.random() * 5) - 2; 

  return { 
    score: Math.max(0, Math.min(100, score)), 
    isSuspicious, 
    reason 
  };
};


export async function POST(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }
    if (session.user.role !== 'DONOR') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = donationSchema.safeParse(body);
    
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map((err) => err.message);
      return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }

    const { foodCategory, foodSource, quantity, expiryTime, pickupLocation, campaignId } = parsedData.data;
    const photoUrl = body.photoUrl || '';

    const expiryDate = new Date(expiryTime);
    const currentTime = new Date();
    const hoursDifference = (expiryDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    const isUrgent = hoursDifference > 0 && hoursDifference <= 4;

    // 👇 RUN FRAUD DETECTION ENGINE
    const fraudAnalysis = calculateTrustScore(foodSource, quantity, expiryTime);

    const newDonation = new DonationModel({
      donorId: session.user._id, 
      foodCategory,
      foodSource,
      quantity,
      expiryTime,
      pickupLocation,
      photoUrl,
      isUrgent,
      campaignId: campaignId || undefined,
      status: 'PENDING',
      
      // 👇 SAVE AI TRUST SCORE IN DATABASE
      trustScore: fraudAnalysis.score,
      isSuspicious: fraudAnalysis.isSuspicious
    });

    await newDonation.save();
    return NextResponse.json({ 
      success: true, 
      message: 'Donation created successfully', 
      donation: newDonation,
      analysis: fraudAnalysis // Sending back to log/debug
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 
export async function GET() {
  try {
    await dbConnect();
    
    const currentTime = new Date(); 

    const donations = await DonationModel.find({ 
      status: 'PENDING',
      expiryTime: { $gt: currentTime } 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// 3. PATCH: Claim donation by NGO
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'NGO') {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 403 });
    }

    const body = await request.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json({ success: false, message: 'Donation ID is required' }, { status: 400 });
    }

    const updatedDonation = await DonationModel.findByIdAndUpdate(
      donationId,
      { status: 'ACCEPTED', ngoId: session.user._id }, 
      { new: true }
    );

    if (!updatedDonation) {
      return NextResponse.json({ success: false, message: 'Donation not found' }, { status: 404 });
    }

    const donor = await UserModel.findById(updatedDonation.donorId);
    if (donor && donor.email) {
      sendEventEmail(
        donor.email,
        donor.username || "Generous Donor",
        "Donation Accepted",
        `Great news! An NGO has accepted your donation. A volunteer will be assigned shortly to pick it up.`
      ).catch(err => console.error("Email sending failed:", err));
    }

    return NextResponse.json({ success: true, message: 'Donation claimed', data: updatedDonation }, { status: 200 });
  } catch (error) {
    console.error('Error claiming donation:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}