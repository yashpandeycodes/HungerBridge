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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze this food image for a donation platform. 
    You must strictly reply with a raw JSON object containing exactly these keys:
    - "foodCategory": (suggested category like 'Cooked Rice', 'Raw Vegetables', 'Baked Goods', etc.)
    - "estimatedQuantity": (approximate quantity based on visual scale, e.g., 'approx 2 kg', '5 servings')
    -  "suggestedSource":(MUST be EXACTLY one of these values:

- Restaurant surplus
- Events/Weddings
- Corporate cafeterias
- Households

Never return any other value.
Never abbreviate.
Never change capitalization.)

    Return ONLY valid JSON.

{
  "foodCategory": "string",
  "estimatedQuantity": "string",
  "suggestedSource": "string"
}
   Rules:

- No markdown
- No explanation
- No extra text
- No code block
- No comments

  Examples:

Image: Large trays of biryani
{
  "foodCategory":"Vegetable Biryani",
  "estimatedQuantity":"25-30 servings",
  "suggestedSource":"Events/Weddings"
}

Image: Multiple packed lunch boxes
{
  "foodCategory":"Packed Meals",
  "estimatedQuantity":"20 boxes",
  "suggestedSource":"Corporate cafeterias"
}

Image: One small bowl of cooked rice
{
  "foodCategory":"Cooked Rice",
  "estimatedQuantity":"2-3 servings",
  "suggestedSource":"Households"
}

Image: Large steel containers with cooked curry
{
  "foodCategory":"Mixed Curry",
  "estimatedQuantity":"15-20 servings",
  "suggestedSource":"Restaurant surplus"
}

    Do not wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON object.  If unsure, make your best reasonable estimate.`;

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
    console.error("AI API Error (High Demand/Fail):", error);
    
    console.log("Triggering Fallback Mock AI...");
    
    const mockData = {
      foodCategory: "Cooked Meal",
      estimatedQuantity: "Approx. 2 kg",
      suggestedSource:"Households"
    };

    return NextResponse.json({ 
      success: true, 
      data: mockData,
      message: "API high demand. Used fallback data for demo." 
    });
  }
}