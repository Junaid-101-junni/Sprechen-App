// English → German translation with word-by-word breakdown
import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

interface TranslateRequest {
  text: string;
  level: "A1" | "A2" | "B1" | "B2";
}

export async function POST(req: NextRequest) {
  try {
    const { text, level } = await req.json() as TranslateRequest;
    if (!text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
    if (text.length > 500) return NextResponse.json({ error: "Text too long (max 500 chars)" }, { status: 400 });

    const systemPrompt = `You are a German translation tutor for an English speaker at CEFR level ${level}. The user said: "${text}"

If the user wrote in ENGLISH, translate it to natural German at the ${level} level. If GERMAN, keep it and provide English translation.

Respond in this exact JSON format:
{
  "germanSentence": "the German translation/sentence",
  "englishTranslation": "the English meaning",
  "inputLanguage": "en" | "de" | "mixed",
  "wordBreakdown": [
    {
      "word": "the German word as it appears in the sentence",
      "english": "the English meaning in context",
      "type": "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "article" | "conjunction" | "particle" | "other",
      "article": "der" | "die" | "das" (only for nouns),
      "example": "a short example sentence using this word (in German)"
    }
  ],
  "culturalNote": "optional: a brief tip about usage (1 sentence)",
  "alternativePhrasings": ["1-2 alternative ways to say the same thing"]
}

Rules:
- Word breakdown should include EVERY word in the German sentence
- For nouns, include the article (der/die/das)
- Keep example sentences short (5-8 words)
- Make word meanings context-specific`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Translate and break down: "${text}"` }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch { parsed = { raw: content }; }
    return NextResponse.json({ ...parsed, originalText: text, level });
  } catch (error) {
    console.error("Translate API error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Translation failed: ${msg}` }, { status: 500 });
  }
}
