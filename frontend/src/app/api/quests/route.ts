import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pool } from 'pg';

// Initialize Neon Client (deferred initialization to ensure env vars are loaded)
let pool: Pool | null = null;
const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error("DATABASE_URL is missing");
      return null;
    }
    pool = new Pool({ connectionString });
  }
  return pool;
};

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, buildingId, rewardCredits, creatorId, skipDb } = body;

    // Basic Validation
    if (!title || !description || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and creatorId are mandatory.' },
        { status: 400 }
      );
    }

    // 1. AI Moderation Check
    const genAI = getGeminiClient();
    if (!genAI) {
      return NextResponse.json({ error: "AI Moderation service unavailable (Missing API Key)." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const prompt = `You are the automated moderator for 'BuffQuest'. 
Analyze this quest submission:
Title: ${title}
Description: ${description}

Return ONLY valid JSON in this exact format:
{
  "is_approved": true/false,
  "reason": "If false, one short user-friendly reason why."
}`;

    // Standard contents format: pass prompt directly or as a Content object
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const decision = JSON.parse(responseText || "{}");

    if (decision.is_approved !== true) {
      return NextResponse.json(
        { error: decision.reason || "Quest flagged by moderation filter." },
        { status: 400 }
      );
    }

    // 2. Database Insertion (Neon)
    if (skipDb) {
      return NextResponse.json({ success: true, quest: { id: "mock-123", title, status: 'open' } }, { status: 201 });
    }

    const dbPool = getPool();
    if (!dbPool) {
      return NextResponse.json({ error: "Database connection error (Missing URL)." }, { status: 500 });
    }

    // NOTE: In our schema, the column is 'building_zone_id', NOT 'building_id'
    const query = `
      INSERT INTO quests (title, description, building_zone_id, reward_credits, creator_id, status)
      VALUES ($1, $2, $3, $4, $5, 'open')
      RETURNING *
    `;
    const params = [title, description, buildingId, rewardCredits || 0, creatorId];

    const { rows } = await dbPool.query(query, params);

    return NextResponse.json({ success: true, quest: rows[0] }, { status: 201 });

  } catch (error: any) {
    console.error("Critical API Error in /api/quests:", error);
    return NextResponse.json(
      {
        error: "Internal server error processing quest.",
        detail: error.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}
