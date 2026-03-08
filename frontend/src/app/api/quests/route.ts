import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client
const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_build' 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
    }

    // Combine text for moderation context
    const fullText = `Title: ${title}\nDescription: ${description}`;

    // STEP 1 & 2: Gemini Safety & Relevance Check
    const prompt = `You are the strict, automated moderator for 'BuffQuest', a college campus bounty board app.
Your job is to analyze the user's quest submission and return a strict JSON object.

RULES:
1. SAFE: It must not contain hate speech, violence, self-harm, sexual content, or illicit acts.
2. RELEVANT: It must be relevant to college students on a campus.
3. REALISTIC: It must be a realistic task a student could actually complete (No spaceships, no magic, no illegal acts).

Good Examples: "Need a tutor for Calc 2", "Bring a coffee to the library"
Bad Examples: "Build a functioning spaceship" (unrealistic), "Need someone to fight" (unsafe)

Analyze this quest:
${fullText}

Return ONLY valid JSON in this exact format:
{
  "is_approved": true/false,
  "reason": "If false, explain why it was blocked in one short user-friendly sentence. If true, leave empty."
}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.0
      }
    });

    const resultText = (response.text as string) || "{}";
    const decision = JSON.parse(resultText);

    if (decision.is_approved !== true) {
      return NextResponse.json(
        { error: decision.reason || "Quest flagged by moderation filter." },
        { status: 400 }
      );
    }

    // If approved, return success so the frontend can dispatch to the backend API
    return NextResponse.json({ success: true, moderation_passed: true }, { status: 200 });

  } catch (error: unknown) {
    console.error("API processing error:", error);
    return NextResponse.json(
      { error: "Internal server error processing quest." },
      { status: 500 }
    );
  }
}
