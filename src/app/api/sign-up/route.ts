import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { signUpSchema } from '@/schemas/signUpSchema';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const parsedData = signUpSchema.safeParse(body);
    if (!parsedData.success) {
      const errors = parsedData.error.issues.map((err) => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone } = parsedData.data;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || '',
      isVerified: true, 
    });

    await newUser.save();

    return NextResponse.json(
      { success: true, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while registering user' },
      { status: 500 }
    );
  }
}