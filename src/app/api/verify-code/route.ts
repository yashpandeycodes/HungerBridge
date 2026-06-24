import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Connect to database
  await dbConnect();

  try {
    const { email, code } = await request.json();

    const decodedEmail = decodeURIComponent(email);

    // Find the user by email
    const user = await UserModel.findOne({ email: decodedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update user as verified
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        { success: true, message: "Account verified successfully!" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code expired
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return NextResponse.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}