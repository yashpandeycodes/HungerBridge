import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DonationModel from "@/model/Donation";

export async function GET() {
  try {
    await dbConnect();
    
    // Find all pending donations whose expiry time is in the past
    const now = new Date();
    
    const result = await DonationModel.updateMany(
      { 
        status: "PENDING", 
        expiryTime: { $lt: now } 
      },
      { 
        $set: { status: "EXPIRED" } 
      }
    );

    return NextResponse.json({
      success: true,
      message: `Cron job executed successfully. Expired ${result.modifiedCount} donations.`,
      expiredCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, message: "Error running auto-expire cron job" },
      { status: 500 }
    );
  }
}
