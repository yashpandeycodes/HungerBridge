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
    const activeCampaigns = await CampaignModel.countDocuments(); 

    const campaigns = await CampaignModel.find();
    const totalMealsServed = campaigns.reduce((acc, camp) => acc + (camp.mealsCollected || 0), 0);

    const totalFoodRescuedKg = completedDeliveries * 10; 

    const volunteerHours = completedDeliveries * 2;

    return NextResponse.json({
      success: true,
      data: {
        totalDonations,
        completedDeliveries,
        activeCampaigns,
        totalMealsServed,
        totalFoodRescuedKg,
        volunteerHours
      }
    });

  } catch (error) {
    console.error("Impact API Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch impact stats' }, { status: 500 });
  }
}