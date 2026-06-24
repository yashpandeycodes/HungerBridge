import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

interface CampaignRequestBody {
  foodDetails?: {
    category?: string;
    quantity?: string;
    location?: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
   let body: CampaignRequestBody | null = null;

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
        { success: false, message: 'Forbidden. Only NGOs can use the AI Campaign Assistant.' },
        { status: 403 }
      );
    }

     body = await req.json();

     if (!body || !body.foodDetails) {
      return NextResponse.json(
        { success: false, message: 'Please provide food details for the campaign' },
        { status: 400 }
      );
    }
    const { foodDetails } = body;

    if (!foodDetails) {
      return NextResponse.json(
        { success: false, message: 'Please provide food details for the campaign' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert NGO campaign copywriter fighting hunger. 
    Write a short, engaging, and urgent social media appeal (WhatsApp/Twitter) to gather volunteers.
    We have received a donation of ${foodDetails.quantity} of ${foodDetails.category} at ${foodDetails.location}.
    Include emojis and relevant hashtags like #EndHunger. Keep it under 4-5 sentences.
    Length: 80-120 words

Tone:
- Compassionate
- Professional
- Action-oriented

Return plain text only.
No markdown.
No heading.
No bullet points.
    You must strictly reply with a raw JSON object containing exactly ONE key:
    - "campaignContent": (The text of the social media appeal)
    
    Do not wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON object.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(cleanJsonString);

    return NextResponse.json(
      { success: true, message: 'Campaign content generated successfully', data: aiData },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('AI Campaign Generation Error:', error);
    
    const fallbackText = `🚨 URGENT: We just received a fresh donation of ${body?.foodDetails?.category || "food"}! We need volunteers for immediate distribution at ${body?.foodDetails?.location || "our center"}. Please DM us to help. Let's #EndHunger together! 🙌`;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Used fallback content due to high AI demand.', 
        data: { campaignContent: fallbackText } 
      },
      { status: 200 } 
    );
  }
}