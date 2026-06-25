import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import CampaignModel from '@/model/Campaign';
import UserModel from "@/model/User";
import { sendEventEmail } from '@/helpers/sendEventEmail';

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    // Sirf NGO hi confirm kar sakta hai ki khana mil gaya
    if (!session || !session.user || session.user.role !== 'NGO') {
      return NextResponse.json({ success: false, message: 'Only NGOs can complete a donation' }, { status: 403 });
    }

    const { donationId } = await request.json();

    // 1. Status ko 'COMPLETED' kar diya
    const completedDonation = await DonationModel.findOneAndUpdate(
      { _id: donationId, status: 'ASSIGNED', ngoId: session.user._id },
      { status: 'COMPLETED' },
      { new: true }
    );

    if (!completedDonation) {
      return NextResponse.json({ success: false, message: 'Donation not found or not assigned yet.' }, { status: 404 });
    }

    // 2. Campaign me meals update 
    if (completedDonation.campaignId) {
      const parsedQuantity = parseInt(completedDonation.quantity.replace(/\D/g, '')) || 20; 
      await CampaignModel.findByIdAndUpdate(
        completedDonation.campaignId,
        { $inc: { mealsCollected: parsedQuantity } } 
      );
    }

    // 3. Volunteer ko uski mehnat ke Karma points aur delivery count dunga
    if (completedDonation.volunteerId) {
      await UserModel.findByIdAndUpdate(
        completedDonation.volunteerId,
        { 
          $inc: { karma: 50, deliveries: 1 } 
        }
      );
    }

    // 4. Donor ko FINAL "Delivery Completed" mail 
    const donor = await UserModel.findById(completedDonation.donorId); 
    if (donor && donor.email) {
      sendEventEmail(
        donor.email,
        donor.username || "Generous Donor", 
        "Delivery Completed",
        `Amazing news! Your food has been successfully received by the NGO and has reached those in need. You just fed empty stomachs today. Thank you for your kindness!`
      ).catch(err => console.error("Email sending failed:", err)); 
    }

    return NextResponse.json({ success: true, message: 'Donation cycle completed successfully!', data: completedDonation }, { status: 200 });
  } catch (error) {
    console.error("Completion Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to complete donation' }, { status: 500 });
  }
}