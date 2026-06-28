import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'DONOR') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all donor history, newest first
    const myDonations = await DonationModel.find({ 
      donorId: session.user._id 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: myDonations });
  } catch (error) {
    console.error('Error fetching my donations:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}