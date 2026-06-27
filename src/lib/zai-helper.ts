// Groq AI Helper — Free, fast, works globally
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateAIResponse(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Groq API error:", errorData);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No response from AI");
  return text;
}

export function getZAI() {
  return {
    chat: {
      completions: {
        create: async (params: { messages: Array<{ role: string; content: string }>; temperature?: number; max_tokens?: number }) => {
          const systemMsg = params.messages.find(m => m.role === "system")?.content || "";
          const userMsgs = params.messages.filter(m => m.role !== "system").map(m => m.content).join("\n");
          const text = await generateAIResponse(systemMsg, userMsgs);
          return { choices: [{ message: { content: text } }] };
        }
      }
    }
  };
}
