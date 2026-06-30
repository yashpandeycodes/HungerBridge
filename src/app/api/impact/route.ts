import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import CampaignModel from '@/model/Campaign';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const totalDonations = await DonationModel.countDocuments();

    const completedDeliveries = await DonationModel.countDocuments({ status: 'COMPLETED' });

    // 3. Active Campaigns count
    const activeCampaigns = await CampaignModel.countDocuments({ status: 'ACTIVE' }); 

    const campaigns = await CampaignModel.find();
    const totalMealsServed = campaigns.reduce((acc, camp) => acc + (camp.mealsCollected || 0), 0);

    const totalFoodRescuedKg = completedDeliveries * 10; 

    const volunteerHours = completedDeliveries * 2;

    // Advanced Analytics
    const acceptedDonations = await DonationModel.countDocuments({ status: { $in: ['ACCEPTED', 'ASSIGNED', 'COMPLETED'] } });
    const acceptanceRate = totalDonations > 0 ? parseFloat(((acceptedDonations / totalDonations) * 100).toFixed(1)) : 0;

    // Avg pickup time
    const donationsWithTime = await DonationModel.find({ 
      acceptedAt: { $exists: true }, 
      createdAt: { $exists: true } 
    }).limit(100);

    let avgPickupTimeMins = 0;
    if (donationsWithTime.length > 0) {
      const totalMins = donationsWithTime.reduce((acc, d) => {
        const diffMs = new Date(d.acceptedAt).getTime() - new Date(d.createdAt).getTime();
        return acc + diffMs / 60000;
      }, 0);
      avgPickupTimeMins = Math.round(totalMins / donationsWithTime.length);
    } else {
      // Mock average if no real data yet
      avgPickupTimeMins = 42; 
    }

    return NextResponse.json({
      success: true,
      data: {
        totalDonations,
        completedDeliveries,
        activeCampaigns,
        totalMealsServed,
        totalFoodRescuedKg,
        volunteerHours,
        acceptanceRate,
        avgPickupTimeMins
      }
    });

  } catch (error) {
    console.error("Impact API Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch impact stats' }, { status: 500 });
  }
}