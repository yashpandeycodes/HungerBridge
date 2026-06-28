import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User'; 
import { signUpSchema } from '@/schemas/signUpSchema';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

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

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = crypto.randomInt(100000, 999999).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        );
      } else {

        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        existingUserByEmail.name = name;
        existingUserByEmail.role = role;
        existingUserByEmail.phone = phone || '';
        
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        name,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        role,
        phone: phone || '',
        isVerified: false, 
      });

      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      name,
      verifyCode
    );

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Please verify your email.' }, 
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