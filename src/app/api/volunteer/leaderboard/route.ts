import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const topVolunteers = await UserModel.find(
      { role: 'VOLUNTEER', isVerified: true },
      { _id: 1, name: 1, karma: 1, deliveries: 1 }
    )
    .sort({ karma: -1 })
    .limit(10)
    .lean();

    const withBadges = topVolunteers.map(vol => ({
      _id: vol._id.toString(),
      name: vol.name,
      karma: vol.karma || 0,
      deliveries: vol.deliveries || 0,
      badge: (vol.karma || 0) >= 1000
        ? 'Food Savior'
        : (vol.karma || 0) >= 500
          ? 'Community Hero'
          : (vol.karma || 0) >= 200
            ? 'Rising Hero'
            : 'Newcomer',
      isCurrentUser: vol._id.toString() === session.user._id,
    }));

    return NextResponse.json({ success: true, data: withBadges });
  } catch (error) {
    console.error("Failed to fetch leaderboard", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
