"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useTTS, useSTT } from "@/lib/use-speech";
import { getApiUrl } from "@/lib/api-config";
import { getPersonaById } from "@/lib/tutor-personas";
import type { CEFRLevel } from "@/lib/german-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, Send, Loader2, CheckCircle2, AlertCircle,
  BookOpen, ChevronLeft, Settings2, Languages, Gauge, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  corrections?: { original: string; corrected: string; explanation: string }[];
  newVocab?: { german: string; english: string }[];
  encouragement?: string;
  timestamp: number;
  spoken?: boolean;
}

interface APIResponse {
  germanReply: string;
  englishTranslation: string;
  corrections: { original: string; corrected: string; explanation: string }[];
  newVocabulary: { german: string; english: string }[];
  encouragement: string;
}

const TOPICS = [
  { label: "Free Talk", value: "", emoji: "💬" },
  { label: "Introduce yourself", value: "Introducing yourself", emoji: "👋" },
  { label: "At a café", value: "Ordering at a café", emoji: "☕" },
  { label: "Travel", value: "Travel in Germany", emoji: "✈️" },
  { label: "Work", value: "Talking about work", emoji: "💼" },
  { label: "Hobbies", value: "Discussing hobbies", emoji: "🎨" },
  { label: "Family", value: "Talking about family", emoji: "👨‍👩‍👧" },
  { label: "Weekend", value: "What you did last weekend", emoji: "📅" },
  { label: "Future plans", value: "Your plans and dreams", emoji: "🔮" },
  { label: "German culture", value: "German culture and traditions", emoji: "🥨" },
];

export function VoiceChatView({
  initialTopic, initialScenario, initialPersona, initialMessage, scenarioTitle,
}: {
  initialTopic?: string;
  initialScenario?: string;
  initialPersona?: string;
  initialMessage?: string;
  scenarioTitle?: string;
}) {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const recordChatMessage = useAppStore((s) => s.recordChatMessage);
  const setView = useAppStore((s) => s.setView);
  const startConversation = useAppStore((s) => s.startConversation);
  const addMessageToConversation = useAppStore((s) => s.addMessageToConversation);
  const recordMistakes = useAppStore((s) => s.recordMistakes);
  const recordSpeaking = useAppStore((s) => s.recordSpeaking);
  const profile = useAppStore((s) => s.profile);
  const conversationIdRef = useRef<string | null>(null);
  const speakStartRef = useRef<number>(0);

  const persona = getPersonaById(profile?.tutorPersonaId || "anna");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(initialTopic || "");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [allVocab, setAllVocab] = useState<{ german: string; english: string }[]>([]);
  const [speechRate, setSpeechRate] = useState(0.9);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tts = useTTS({ lang: "de-DE", rate: speechRate });

  const [spokenText, setSpokenText] = useState("");
  const stt = useSTT({
    lang: "de-DE",
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal) setSpokenText((prev) => (prev ? prev + " " : "") + transcript.trim());
    },
    onError: (err) => {
      if (err !== "no-speech" && err !== "aborted") toast.error(`Mic error: ${err}`);
    },
    onEnd: () => {
      if (handsFree && spokenText.trim()) {
        setTimeout(() => send(spokenText, true), 300);
      }
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const aiMessage: Message = { role: "assistant", content: initialMessage, translation: "", timestamp: Date.now() };
      setMessages([aiMessage]);
      if (autoSpeak) setTimeout(() => tts.speak(initialMessage), 500);
    }
  }, [initialMessage]);

  const send = useCallback(async (text?: string, spoken = false) => {
    const content = (text ?? spokenText ?? input).trim();
    if (!content || loading) return;

    if (!conversationIdRef.current) {
      const title = scenarioTitle || topic?.split(" ")[0] || "Voice Conversation";
      conversationIdRef.current = startConversation(title, topic, initialScenario);
    }

    if (spoken) {
      // Track speaking time
      const speakDuration = (Date.now() - speakStartRef.current) / 1000;
      if (speakDuration > 0) recordSpeaking(Math.round(speakDuration));
    }

    const userMessage: Message = { role: "user", content, timestamp: Date.now(), spoken };
    setMessages((m) => [...m, userMessage]);
    addMessageToConversation(conversationIdRef.current, userMessage);
    setInput("");
    setSpokenText("");
    setLoading(true);
    recordChatMessage();

    try {
      const history = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history, level: currentLevel, topic: topic || undefined,
          mode: "conversation", scenario: initialScenario, persona: initialPersona,
          tutorPersonaId: profile?.tutorPersonaId,
        }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const data: APIResponse = await res.json();

      const assistantMessage: Message = {
        role: "assistant", content: data.germanReply, translation: data.englishTranslation,
        corrections: data.corrections || [], newVocab: data.newVocabulary || [],
        encouragement: data.encouragement, timestamp: Date.now(),
      };
      setMessages((m) => [...m, assistantMessage]);
      addMessageToConversation(conversationIdRef.current, assistantMessage);

      if (data.corrections?.length) recordMistakes(data.corrections, content, currentLevel);
      if (data.newVocabulary?.length) setAllVocab((v) => [...v, ...data.newVocabulary]);
      if (autoSpeak && data.germanReply) setTimeout(() => tts.speak(data.germanReply), 300);
    } catch {
      toast.error("Couldn't reach the AI tutor.");
    } finally {
      setLoading(false);
    }
  }, [input, spokenText, loading, messages, currentLevel, topic, initialScenario, initialPersona, autoSpeak, tts, recordChatMessage, startConversation, addMessageToConversation, recordMistakes, recordSpeaking, scenarioTitle, profile]);

  // Press-and-hold (PTT) mic handlers
  const micStartRef = useRef<boolean>(false);

  const startListening = () => {
    if (stt.listening || micStartRef.current) return;
    if (!stt.supported) { toast.error("Use Chrome or Edge for voice input."); return; }
    micStartRef.current = true;
    setSpokenText("");
    speakStartRef.current = Date.now();
    stt.start();
  };

  const stopListening = () => {
    if (!micStartRef.current) return;
    micStartRef.current = false;
    stt.stop();
  };

  // For compatibility with any existing toggle calls
  const toggleMic = () => {
    if (stt.listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearChat = () => {
    setMessages([]); setAllVocab([]); setSpokenText("");
    conversationIdRef.current = null;
    if (initialMessage) {
      const aiMessage: Message = { role: "assistant", content: initialMessage, translation: "", timestamp: Date.now() };
      setMessages([aiMessage]);
      if (autoSpeak) setTimeout(() => tts.speak(initialMessage), 300);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      {/* Header with AI Agent Avatar */}
      <div className="px-4 pt-3 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {scenarioTitle && (
              <button onClick={() => setView("home")} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {/* AI Agent Avatar */}
            <div className="relative">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${persona.avatarColor} flex items-center justify-center shadow-md transition-all ${tts.speaking ? "ring-2 ring-accent/50 scale-105" : ""}`}>
                <span className="text-white font-bold text-lg">{persona.emoji}</span>
              </div>
              {tts.speaking && (
                <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-0.5">
                  <div className="flex items-end gap-0.5 h-3">
                    <div className="w-0.5 h-1 bg-white rounded-full animate-pulse" />
                    <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                    <div className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              )}
              {loading && !tts.speaking && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Loader2 className="w-2.5 h-2.5 text-primary-foreground animate-spin" />
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-sm">{scenarioTitle || `${persona.name} · AI Tutor`}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                {tts.speaking ? (
                  <span className="text-accent flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Speaking...
                  </span>
                ) : loading ? (
                  <span className="text-primary">Thinking...</span>
                ) : stt.listening ? (
                  <span className="text-rose-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Listening...
                  </span>
                ) : (
                  <span>Level {currentLevel} · {tts.supported ? "Voice ready" : "Text only"}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={clearChat}>
                <Square className="w-3.5 h-3.5 mr-1" /> End
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(!showSettings)}>
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Speaking waveform */}
        {tts.speaking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-1 py-2 bg-accent/5 rounded-lg">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 bg-accent/60 rounded-full" style={{ height: `${8 + Math.sin(i) * 8 + Math.random() * 12}px`, animation: `pulse 0.${4 + (i % 3)}s ease-in-out infinite`, animationDelay: `${i * 0.05}s` }} />
            ))}
          </motion.div>
        )}

        {/* Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
              <div className="flex items-center justify-between bg-secondary/40 rounded-lg p-2.5">
                <div className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-primary" /><span className="text-xs font-medium">Auto-speak replies</span></div>
                <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
              </div>
              <div className="flex items-center justify-between bg-secondary/40 rounded-lg p-2.5">
                <div className="flex items-center gap-2"><Mic className="w-4 h-4 text-accent" /><span className="text-xs font-medium">Hands-free mode</span></div>
                <Switch checked={handsFree} onCheckedChange={setHandsFree} />
              </div>
              {tts.voices.length > 0 && (
                <div className="bg-secondary/40 rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center gap-2"><Languages className="w-4 h-4 text-primary" /><span className="text-xs font-medium">AI Voice</span></div>
                  <select value={tts.selectedVoiceURI || ""} onChange={(e) => tts.setSelectedVoiceURI(e.target.value)} className="w-full text-xs bg-card border border-border/60 rounded-md px-2 py-1.5">
                    {tts.voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                  </select>
                </div>
              )}
              <div className="bg-secondary/40 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /><span className="text-xs font-medium">Voice Speed</span></div>
                  <span className="text-xs font-semibold text-muted-foreground">{speechRate.toFixed(1)}x</span>
                </div>
                <div className="flex gap-1">
                  {[0.7, 0.85, 1.0, 1.15, 1.3].map((r) => (
                    <button key={r} onClick={() => setSpeechRate(r)} className={`flex-1 py-1 rounded text-[10px] font-medium ${speechRate === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{r}x</button>
                  ))}
                </div>
              </div>
              {!tts.supported && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-2.5">
                  <div className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><div className="text-[11px] text-amber-800 dark:text-amber-300"><strong>Voice not supported.</strong> Try Chrome, Edge, or Safari.</div></div>
                </div>
              )}
              {!stt.supported && tts.supported && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-2.5">
                  <div className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><div className="text-[11px] text-amber-800 dark:text-amber-300"><strong>Mic not supported.</strong> Use Chrome or Edge for voice input.</div></div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Topics — centered attractive pills */}
        {!scenarioTitle && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin mt-2 pb-1 px-1">
            {TOPICS.map((t) => (
              <button
                key={t.label}
                onClick={() => setTopic(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  topic === t.value
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Level — colorful gradient pills */}
        <div className="flex items-center gap-1.5 mt-2 px-1">
          {(["A1", "A2", "B1", "B2"] as CEFRLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentLevel === lvl
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100"
              }`}
            >
              {lvl}
            </button>
          ))}
          {messages.length > 0 && <button onClick={clearChat} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">↺ Restart</button>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${persona.avatarColor} mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                <span className="text-4xl">{persona.emoji}</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Sprechen Sie Deutsch!</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                Hi, I'm {persona.name}. Tap the mic and speak in German. I'll respond with voice and correct you along the way.
              </p>
              <div className="space-y-1.5 max-w-xs mx-auto">
                {TOPICS.slice(1, 4).map((t) => (
                  <button key={t.label} onClick={() => setTopic(t.value)} className="block w-full text-left text-sm bg-secondary/60 hover:bg-secondary border border-border/40 rounded-lg px-3 py-2 transition-colors">{t.emoji} {t.label}</button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[88%]">
                    <div className={`rounded-2xl px-3.5 py-2.5 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm flex-1 leading-relaxed">{msg.content}</span>
                        {msg.role === "assistant" && <button onClick={() => tts.speak(msg.content)} className="opacity-70 hover:opacity-100 flex-shrink-0 mt-0.5"><Volume2 className="w-3.5 h-3.5" /></button>}
                      </div>
                      {msg.translation && <div className={`text-[11px] mt-1 ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.translation}</div>}
                      {msg.spoken && <div className="text-[10px] mt-1 opacity-60">🎤 spoken</div>}
                    </div>
                    {msg.corrections?.length > 0 && (
                      <div className="mt-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg p-2.5">
                        <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Corrections</div>
                        {msg.corrections.map((c, ci) => (
                          <div key={ci} className="text-xs mb-1 last:mb-0">
                            <div className="flex items-center gap-1.5 flex-wrap"><span className="line-through text-rose-600">{c.original}</span><span className="text-muted-foreground">→</span><span className="text-accent font-medium">{c.corrected}</span></div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{c.explanation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.newVocab?.length > 0 && (
                      <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-2.5">
                        <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> New words</div>
                        <div className="flex flex-wrap gap-1">
                          {msg.newVocab.map((v, vi) => (
                            <button key={vi} onClick={() => tts.speak(v.german)} className="text-xs bg-card rounded px-1.5 py-0.5 border border-border/40 hover:border-primary/40"><span className="font-medium">{v.german}</span><span className="text-muted-foreground ml-1">— {v.english}</span></button>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.encouragement && <div className="mt-1 text-[11px] text-accent flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {msg.encouragement}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /> <span>Thinking...</span></div>
              </div>
            </motion.div>
          )}

          {stt.listening && stt.interimTranscript && (
            <div className="flex justify-end">
              <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[88%]">
                <div className="text-sm text-primary/70 italic">{stt.interimTranscript}...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vocab bar */}
      {allVocab.length > 0 && (
        <div className="px-4 py-2 border-t border-border/40 bg-secondary/20">
          <div className="flex items-center gap-1.5 mb-1"><BookOpen className="w-3 h-3 text-accent" /><span className="text-[10px] font-semibold uppercase text-muted-foreground">Vocab collected ({allVocab.length})</span></div>
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {allVocab.slice(-8).map((v, i) => <span key={i} className="text-[10px] bg-card rounded px-1.5 py-0.5 border border-border/40">{v.german}</span>)}
            {allVocab.length > 8 && <span className="text-[10px] text-muted-foreground">+{allVocab.length - 8} more</span>}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/40 p-3 bg-background/95 backdrop-blur-sm">
        {spokenText && (
          <div className="mb-2 bg-accent/10 border border-accent/30 rounded-lg p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1"><div className="text-[10px] text-accent font-semibold mb-0.5">🎤 You said:</div><div className="text-sm">{spokenText}</div></div>
              <button onClick={() => setSpokenText("")} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onPointerDown={(e) => { e.preventDefault(); startListening(); }}
            onPointerUp={(e) => { e.preventDefault(); stopListening(); }}
            onPointerLeave={() => stopListening()}
            onPointerCancel={() => stopListening()}
            disabled={!stt.supported}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 select-none touch-none ${stt.listening ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110" : "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95"} disabled:opacity-50`}
            title="Press and hold to speak"
          >
            {stt.listening && <motion.div className="absolute inset-0 rounded-full bg-rose-500/30" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} />}
            {stt.listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <Textarea value={spokenText || input} onChange={(e) => { setSpokenText(""); setInput(e.target.value); }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={stt.listening ? "Listening..." : `Sprechen oder tippen Sie auf Deutsch... (Level ${currentLevel})`} className="min-h-[48px] max-h-32 resize-none text-sm flex-1" rows={1} />
          <Button onClick={() => send(spokenText || input, !!spokenText)} disabled={(!spokenText?.trim() && !input?.trim()) || loading} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"><Send className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-[10px] text-muted-foreground">{stt.listening ? <span className="text-rose-500 font-medium">🔴 Recording... Release to send</span> : "🎤 Press & hold mic to speak · Type to write"}</div>
          {tts.speaking && <button onClick={tts.cancel} className="text-[10px] text-primary">Stop audio</button>}
        </div>
      </div>
    </div>
  );
}
