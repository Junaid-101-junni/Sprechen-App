// AI German voice conversation endpoint
// Returns structured JSON: German reply, English translation, corrections, new vocab, encouragement
import { NextRequest, NextResponse } from "next/server";
import { getZAI } from "@/lib/zai-helper";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  level: "A1" | "A2" | "B1" | "B2";
  topic?: string;
  mode?: "conversation" | "explanation" | "correction" | "roleplay";
  scenario?: string;
  persona?: string;
  tutorPersonaId?: string;
}

const LEVEL_INSTRUCTIONS: Record<string, string> = {
  A1: `You are a friendly German conversation partner for an English-speaking beginner (CEFR A1). Use only basic vocabulary and very simple sentence structures. Topics: greetings, introductions, family, food, numbers. Use present tense only. Keep sentences under 8 words. Be warm, encouraging, and patient. Ask simple questions to keep the conversation going.`,
  A2: `You are a friendly German conversation partner for an English-speaking elementary learner (CEFR A2). Use simple vocabulary about daily routines, shopping, travel, work. Use present tense and basic Perfekt. Use modal verbs. Sentences up to 12 words. Be encouraging and ask follow-up questions.`,
  B1: `You are a friendly German conversation partner for an English-speaking intermediate learner (CEFR B1). Use intermediate vocabulary about opinions, experiences, plans. Use Perfekt, Präteritum, subordinate clauses. Discuss abstract topics. Be a natural conversation partner who shares opinions and asks thoughtful questions.`,
  B2: `You are a friendly German conversation partner for an English-speaking upper-intermediate learner (CEFR B2). Use advanced vocabulary, idioms, and complex sentence structures. Use all tenses including Konjunktiv II and Passiv. Discuss politics, society, technology. Be a stimulating conversation partner who debates and challenges ideas respectfully.`,
};

const PERSONA_ADDITIONS: Record<string, string> = {
  anna: "You are Anna, a friendly and patient German tutor. You speak clearly at a moderate pace. You celebrate the user's efforts with encouraging words. You're warm like a caring teacher.",
  lukas: "You are Lukas, a professional German language coach. You're motivating and structured. You give clear, actionable feedback. You push the user to improve while staying supportive.",
  clara: "You are Clara, a fun and casual German friend. You make learning feel like hanging out with a buddy. You use natural, conversational German and occasional slang at higher levels. You're playful and relaxed.",
};

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, level, topic, mode, scenario, persona, tutorPersonaId } = body;
    if (!messages?.length) return NextResponse.json({ error: "messages array is required" }, { status: 400 });

    const levelInstruction = LEVEL_INSTRUCTIONS[level] || LEVEL_INSTRUCTIONS.A1;
    const personaAdd = PERSONA_ADDITIONS[tutorPersonaId || "anna"] || PERSONA_ADDITIONS.anna;
    const topicLine = topic ? `\nConversation topic: ${topic}.` : "";
    const scenarioLine = scenario ? `\nRoleplay scenario: ${scenario}.` : "";
    const personaLine = persona ? `\nYou are playing the role of: ${persona}. Stay in character.` : "";

    const systemPrompt = `${levelInstruction}

${personaAdd}${topicLine}${scenarioLine}${personaLine}

CRITICAL RULES FOR VOICE CONVERSATION:
1. Respond PRIMARILY in German appropriate to ${level} level.
2. Keep responses SHORT and conversational (1-3 sentences) — this is a spoken conversation.
3. If the user makes mistakes, note them for the corrections field but DON'T interrupt the flow.
4. Always end with a question or prompt to keep the conversation going.
5. If the user writes in English, gently encourage them to try German.
6. Be patient, encouraging, and corrective but not annoying. Focus on keeping the conversation flowing.

You MUST respond in this exact JSON format (no other text):
{
  "germanReply": "your German response (what will be spoken aloud)",
  "englishTranslation": "brief English translation of your reply",
  "corrections": [
    {
      "original": "what the user said wrong",
      "corrected": "the correct version",
      "explanation": "brief explanation in English"
    }
  ],
  "newVocabulary": [
    {
      "german": "a new/useful word from this exchange",
      "english": "its English meaning"
    }
  ],
  "encouragement": "a brief encouraging note in English"
}

Only include corrections if the user actually made mistakes. Only include 1-3 new vocabulary words. Keep all fields concise.`;

    const zai = getZAI();


    const completion = await zai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { germanReply: content, englishTranslation: "", corrections: [], newVocabulary: [], encouragement: "" };
    }
    return NextResponse.json({ ...parsed, level, timestamp: Date.now() });
  } catch (error) {
    console.error("Chat API error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Chat failed: ${msg}` }, { status: 500 });
  }
}
