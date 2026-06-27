// AI endpoint that generates a contextual explanation for a German word
// Used by the vocabulary card detail view to give learners extra context

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

interface ExplainRequest {
  word: string;
  level: "A1" | "A2" | "B1" | "B2";
  context?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ExplainRequest = await req.json();
    const { word, level, context } = body;

    if (!word) {
      return NextResponse.json({ error: "word is required" }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a German language teacher for English speakers at CEFR level ${level}. For the given German word, provide:
1. A memory hook / mnemonic in English (1 sentence)
2. Two additional example sentences in German with English translations
3. A cultural note or usage tip (1-2 sentences)

Respond in JSON format:
{
  "mnemonic": "string",
  "examples": [{"de": "string", "en": "string"}, {"de": "string", "en": "string"}],
  "tip": "string"
}`,
        },
        {
          role: "user",
          content: `Word: ${word}${context ? `\nContext: ${context}` : ""}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsed: unknown = {};
    try {
      // Try to extract JSON from potential markdown fences
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    return NextResponse.json({ ...parsed, word, level });
  } catch (error) {
    console.error("Explain API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed: ${message}` },
      { status: 500 }
    );
  }
}
