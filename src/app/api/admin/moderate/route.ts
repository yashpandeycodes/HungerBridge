import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';

export async function GET() {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    // For hackathon simplicity, we allow NGO or any logged-in user to see this, or restrict to a specific admin email.
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch suspicious donations
    const suspiciousDonations = await DonationModel.find({ isSuspicious: true })
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: suspiciousDonations });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { donationId, action } = await request.json();

    if (action === 'APPROVE') {
      await DonationModel.findByIdAndUpdate(donationId, { isSuspicious: false, trustScore: 100 });
    } else if (action === 'DELETE') {
      await DonationModel.findByIdAndDelete(donationId);
    } else {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Donation ${action.toLowerCase()}d successfully` });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
