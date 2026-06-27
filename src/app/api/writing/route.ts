// AI writing feedback endpoint
import { corsResponse, handleOptions } from "@/lib/cors";
// Analyzes user's German writing and provides feedback

import { NextRequest, NextResponse } from "next/server";
import { getZAI } from "@/lib/zai-helper";

interface WritingRequest {
  text: string;
  level: "A1" | "A2" | "B1" | "B2";
  prompt?: string;
  nativeLanguage?: string;
}

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body: WritingRequest = await req.json();
    const { text, level, prompt, nativeLanguage = "English" } = body;

    if (!text || !text.trim()) {
      return corsResponse(
        { error: "text is required" },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return corsResponse(
        { error: "Text too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a German writing tutor for ${nativeLanguage} speakers at CEFR level ${level}. Analyze the user's German text and provide detailed feedback.

The user wrote this text${prompt ? ` in response to the prompt: "${prompt}"` : ""}:
"${text}"

Provide feedback in this exact JSON structure:
{
  "overallScore": number (0-100),
  "levelAssessment": string (brief assessment if the text matches the target level),
  "corrections": [
    {
      "original": "the original phrase",
      "corrected": "the corrected phrase",
      "explanation": "why this correction (in ${nativeLanguage})"
    }
  ],
  "strengths": ["what the user did well"],
  "improvements": ["specific suggestions for improvement"],
  "rewrittenText": "the user's text rewritten with corrections applied",
  "grammarTips": ["1-2 relevant grammar tips based on errors seen"],
  "vocabularySuggestions": ["1-2 alternative/better word choices"]
}

Be specific and constructive. Focus on patterns the user can learn from. Keep explanations concise. If the text is very good, say so and suggest only minor improvements.`;

    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    return corsResponse({ ...parsed, originalText: text, level });
  } catch (error) {
    console.error("Writing API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return corsResponse(
      { error: `Writing analysis failed: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return corsResponse({
    status: "ok",
    endpoint: "/api/writing",
    description: "AI German writing analysis and feedback",
  });
}
