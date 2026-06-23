import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, message: 'Image is required for AI analysis' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this food image for a donation platform. 
    You must strictly reply with a raw JSON object containing exactly these keys:
    - "foodCategory": (suggested category like 'Cooked Rice', 'Raw Vegetables', 'Baked Goods', etc.)
    - "estimatedQuantity": (approximate quantity based on visual scale, e.g., 'approx 2 kg', '5 servings')
    Do not wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON object.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg', 
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(cleanJsonString);

    return NextResponse.json(
      { success: true, message: 'AI Analysis successful', data: aiData },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to analyze image using AI' },
      { status: 500 }
    );
  }
}