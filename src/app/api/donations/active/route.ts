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
    
    if (!session || !session.user || session.user.role !== 'NGO') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Only fetch orders for this NGO that are in ACCEPTED or ASSIGNED status
    const activeDeliveries = await DonationModel.find({ 
      ngoId: session.user._id,
      status: { $in: ['ACCEPTED', 'ASSIGNED'] } 
    })
    .populate('volunteerId', 'name')
    .sort({ updatedAt: -1 })
    .lean();

    return NextResponse.json({ success: true, data: activeDeliveries });
  } catch (error) {
    console.error('Error fetching active deliveries:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}