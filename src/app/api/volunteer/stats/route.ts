import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Tumhara auth config
import dbConnect from "@/lib/dbConnect"; 
import User from "@/model/User"; 

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const karma = user.karma || 0;
    const deliveries = user.deliveries || 0;

    return NextResponse.json({
      success: true,
      data: {
        karma,
        deliveries,
      },
    });
    
  } catch (error) {
    console.error("Error fetching volunteer stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}