import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import UserModel from "@/model/User";
import { sendEventEmail } from '@/helpers/sendEventEmail'; 

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
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
        status: 'ASSIGNED', 
        volunteerId: session.user._id 
      },
      { new: true }
    );

    if (!updatedDonation) {
      return NextResponse.json({ success: false, message: 'Donation not found' }, { status: 404 });
    }

    const donor = await UserModel.findById(updatedDonation.donorId); 

    if (donor && donor.email) {
      sendEventEmail(
        donor.email,
        donor.name || "Generous Donor", 
        "Volunteer Assigned",
        `Good news! A volunteer has been assigned to pick up your donation. They are on their way to collect the food. Thank you for your patience!`
      ).catch(err => console.error("Email sending failed:", err)); 
    }

    return NextResponse.json({ success: true, data: updatedDonation }, { status: 200 });
  } catch (error) {
    console.error("Mission Accept Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to assign mission' }, { status: 500 });
  }
}