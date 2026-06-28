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
    
    if (!session || !session.user || session.user.role !== 'VOLUNTEER') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const history = await DonationModel.find({ 
      volunteerId: session.user._id,
      status: { $in: ['ASSIGNED', 'COMPLETED', 'ACCEPTED'] } 
    }).sort({ createdAt: -1 }); 

    return NextResponse.json({ success: true, data: history });
    
  } catch (error) {
    console.error("Error fetching volunteer history:", error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}