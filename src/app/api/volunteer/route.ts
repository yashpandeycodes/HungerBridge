import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import CampaignModel from '@/model/Campaign';
import UserModel from "@/model/User";

export async function GET() {
  try {
    await dbConnect();
    const missions = await DonationModel.find({ status: 'ACCEPTED' }).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: missions });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch missions' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'VOLUNTEER') {
      return NextResponse.json({ success: false, message: 'Only volunteers can accept missions' }, { status: 403 });
    }

    const { donationId } = await request.json();

    const updatedDonation = await DonationModel.findByIdAndUpdate(
      donationId,
      { 
        status: 'COMPLETED', 
        volunteerId: session.user._id 
      },
      { new: true }
    );

    if (!updatedDonation) {
      return NextResponse.json({ success: false, message: 'Donation not found' }, { status: 404 });
    }

    if (updatedDonation.campaignId) {
      const parsedQuantity = parseInt(updatedDonation.quantity.replace(/\D/g, '')) || 20; 
      
      await CampaignModel.findByIdAndUpdate(
        updatedDonation.campaignId,
        { $inc: { mealsCollected: parsedQuantity } } 
      );
    }

    await UserModel.findByIdAndUpdate(
      session.user._id,
      { 
        $inc: { 
          karma: 50, 
          deliveries: 1 
        } 
      }
    );

    return NextResponse.json({ success: true, data: updatedDonation }, { status: 200 });
  } catch (error) {
    console.error("Mission Complete Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to complete mission' }, { status: 500 });
  }
}