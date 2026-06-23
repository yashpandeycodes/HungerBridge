import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import DonationModel from '@/model/Donation';
import { donationSchema } from '@/schemas/donationSchema';

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

    if (session.user.role !== 'DONOR') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Only donors can create donations.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedData = donationSchema.safeParse(body);
    
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map((err) => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    const { foodCategory, quantity, expiryTime, pickupLocation, isUrgent } = parsedData.data;

    const photoUrl = body.photoUrl || '';

    const newDonation = new DonationModel({
      donorId: session.user._id, 
      foodCategory,
      quantity,
      expiryTime,
      pickupLocation,
      photoUrl,
      isUrgent: isUrgent || false,
      status: 'PENDING',
    });

    await newDonation.save();

    return NextResponse.json(
      { success: true, message: 'Donation created successfully', donation: newDonation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while creating donation' },
      { status: 500 }
    );
  }
}

// Yeh function POST function ke theek neeche paste karna
export async function GET() {
  try {
    await dbConnect();
    
    // Sirf 'PENDING' donations fetch karo, aur sabse nayi pehle dikhao
    const donations = await DonationModel.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while fetching donations' },
      { status: 500 }
    );
  }
}