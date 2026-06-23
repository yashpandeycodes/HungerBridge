import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import CampaignModel from '@/model/Campaign';
import { campaignSchema } from '@/schemas/campaignSchema';

export async function POST(request: Request) {
  await dbConnect();

  try {
   
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'NGO') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Only NGOs can create campaigns.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedData = campaignSchema.safeParse(body);
    
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map((err) => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    const { title, description, targetMeals } = parsedData.data;

    const newCampaign = new CampaignModel({
      ngoId: session.user._id, 
      title,
      description,
      targetMeals,
      mealsCollected: 0,
      status: 'ACTIVE',
    });

    await newCampaign.save();

    return NextResponse.json(
      { success: true, message: 'Campaign created successfully', campaign: newCampaign },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while creating campaign' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    // Sirf Active campaigns fetch karo
    const campaigns = await CampaignModel.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch campaigns' }, { status: 500 });
  }
}