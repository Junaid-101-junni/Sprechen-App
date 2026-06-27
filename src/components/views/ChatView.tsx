"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Mic, BookOpen, Trash2, Loader2, Lightbulb } from "lucide-react";
import type { CEFRLevel } from "@/lib/german-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api-config";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const TOPICS: { label: string; value: string; emoji: string }[] = [
  { label: "Free Talk", value: "", emoji: "💬" },
  { label: "Introduce yourself", value: "Introducing yourself - name, age, where you're from, what you do", emoji: "👋" },
  { label: "At a café", value: "Ordering food and drinks at a German café", emoji: "☕" },
  { label: "Travel in Berlin", value: "Planning a trip to Berlin - asking for directions, transportation", emoji: "✈️" },
  { label: "Work & Office", value: "Talking about your job, daily work routine, colleagues", emoji: "💼" },
  { label: "Hobbies", value: "Discussing hobbies and free time activities", emoji: "🎨" },
  { label: "Family", value: "Talking about your family and relationships", emoji: "👨‍👩‍👧" },
  { label: "Past weekend", value: "Describing what you did last weekend (past tense practice)", emoji: "📅" },
];

const STARTERS: Record<CEFRLevel, string[]> = {
  A1: [
    "Hallo! Wie heißt du?",
    "Wo wohnst du?",
    "Was machst du beruflich?",
  ],
  A2: [
    "Was hast du am Wochenende gemacht?",
    "Ich möchte nach Berlin reisen. Kannst du mir helfen?",
    "Erzähl mir von deinem Tag.",
  ],
  B1: [
    "Was hältst du von Online-Lernen?",
    "Erzähl mir von einem interessanten Erlebnis.",
    "Warum lernst du Deutsch?",
  ],
  B2: [
    "Wie siehst du die Zukunft der Technologie?",
    "Diskutieren wir über den Klimawandel.",
    "Was sind deine Gedanken zum Thema Künstliche Intelligenz?",
  ],
};

export function ChatView() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const recordChatMessage = useAppStore((s) => s.recordChatMessage);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"conversation" | "explanation" | "correction">("conversation");
  const [showStarters, setShowStarters] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset to greeting when level changes
  useEffect(() => {
    setMessages([]);
    setShowStarters(true);
  }, [currentLevel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: Message = { role: "user", content, timestamp: Date.now() };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);
    setShowStarters(false);
    recordChatMessage();

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          level: currentLevel,
          topic: topic || undefined,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, assistantMessage]);
    } catch (err) {
      toast.error("Couldn't reach the AI tutor. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowStarters(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      {/* Header with topic selector */}
      <div className="px-4 pt-2 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-sm">AI German Tutor</div>
              <div className="text-[10px] text-muted-foreground">Level {currentLevel} · Always patient</div>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8" title="Clear chat">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-secondary/60 rounded-lg p-1">
          {([
            { k: "conversation", label: "💬 Chat" },
            { k: "explanation", label: "📚 Explain" },
            { k: "correction", label: "✏️ Correct" },
          ] as const).map((m) => (
            <button
              key={m.k}
              onClick={() => setMode(m.k)}
              className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                mode === m.k ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Topic pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin mt-2 pb-1">
          {TOPICS.map((t) => (
            <button
              key={t.label}
              onClick={() => setTopic(t.value)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                topic === t.value
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/70 text-foreground/70 hover:bg-secondary"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as never}>
        <div className="space-y-3" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">Practice German with AI</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
                Your AI tutor adapts to your level ({currentLevel}) and gently corrects mistakes.
                Try one of these starters:
              </p>
              <div className="space-y-1.5">
                {STARTERS[currentLevel].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left text-sm bg-secondary/60 hover:bg-secondary border border-border/40 rounded-lg px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border/40 p-3 bg-background/95 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Schreib auf Deutsch... (Level ${currentLevel})`}
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-11 w-11 rounded-xl bg-accent hover:bg-accent/90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Lightbulb className="w-3 h-3" />
            <span>Press Enter to send · Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
