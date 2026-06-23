import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import { donationSchema } from '@/schemas/donationSchema';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DONOR') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Only donors can create donations.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedData = donationSchema.safeParse(body);
    
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map((err) => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    const { foodCategory, quantity, expiryTime, pickupLocation, isUrgent } = parsedData.data;

    const photoUrl = body.photoUrl || '';

    const newDonation = new DonationModel({
      donorId: session.user._id, 
      foodCategory,
      quantity,
      expiryTime,
      pickupLocation,
      photoUrl,
      isUrgent: isUrgent || false,
      status: 'PENDING',
    });

    await newDonation.save();

    return NextResponse.json(
      { success: true, message: 'Donation created successfully', donation: newDonation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while creating donation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const donations = await DonationModel.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while fetching donations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'NGO') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only NGOs can claim donations.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json(
        { success: false, message: 'Donation ID is required' },
        { status: 400 }
      );
    }

    const updatedDonation = await DonationModel.findByIdAndUpdate(
      donationId,
      { status: 'ACCEPTED', ngoId: session.user._id }, 
      { new: true }
    );

    if (!updatedDonation) {
      return NextResponse.json(
        { success: false, message: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Donation claimed successfully', data: updatedDonation },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error claiming donation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while claiming donation' },
      { status: 500 }
    );
  }
}