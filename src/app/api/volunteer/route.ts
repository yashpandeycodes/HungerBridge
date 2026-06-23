import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';

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
      { status: 'COMPLETED', volunteerId: session.user._id },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedDonation }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to accept mission' }, { status: 500 });
  }
}