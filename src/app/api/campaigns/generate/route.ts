import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
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

    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Please provide a topic or short description for the campaign' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `You are an expert NGO campaign copywriter fighting hunger. 
    Write content for a food donation campaign based on this brief topic: "${topic}". 
    
    You must strictly reply with a raw JSON object containing exactly these keys:
    - "description": (A compelling, emotional, and professional 3-4 sentence description of the campaign)
    - "outreachMessage": (A short, actionable WhatsApp/SMS message to send to potential donors)
    
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
    return NextResponse.json(
      { success: false, message: 'Failed to generate campaign content using AI' },
      { status: 500 }
    );
  }
}