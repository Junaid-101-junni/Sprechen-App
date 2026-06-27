"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: { length: number; [index: number]: { 0: { transcript: string; confidence: number }; isFinal: boolean } }; resultIndex: number }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseTTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { lang = "de-DE", rate = 0.9, pitch = 1, volume = 1 } = options;
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      const germanVoice = v.find((voice) => voice.lang === "de-DE");
      if (germanVoice && !selectedVoiceURI) setSelectedVoiceURI(germanVoice.voiceURI);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoiceURI]);

  const speak = useCallback((text: string, onEnd?: () => void, opts?: Partial<UseTTSOptions>) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts?.lang || lang;
    u.rate = opts?.rate ?? rate;
    u.pitch = opts?.pitch ?? pitch;
    u.volume = opts?.volume ?? volume;
    if (selectedVoiceURI) {
      const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (voice) u.voice = voice;
    }
    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); onEnd?.(); };
    u.onerror = () => { setSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(u);
  }, [lang, rate, pitch, volume, selectedVoiceURI, voices]);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const germanVoices = voices.filter((v) => v.lang.startsWith("de"));
  return { speak, cancel, speaking, supported, voices: germanVoices, selectedVoiceURI, setSelectedVoiceURI };
}

export interface UseSTTOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean, confidence: number) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function useSTT(options: UseSTTOptions = {}) {
  const { lang = "de-DE", continuous = false, interimResults = true, onResult, onError, onEnd } = options;
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);

  useEffect(() => { onResultRef.current = onResult; onErrorRef.current = onError; onEndRef.current = onEnd; });

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) { return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);
    const r = new Ctor();
    r.lang = lang; r.continuous = continuous; r.interimResults = interimResults; r.maxAlternatives = 1;
    r.onresult = (event) => {
      let interim = "", final = "", confidence = 0;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        confidence = result[0].confidence;
        if (result.isFinal) final += transcript; else interim += transcript;
      }
      if (interim) { setInterimTranscript(interim); onResultRef.current?.(interim, false, confidence); }
      if (final) { setFinalTranscript((p) => p + final); setInterimTranscript(""); onResultRef.current?.(final, true, confidence); }
    };
    r.onerror = (event) => { onErrorRef.current?.(event.error); setListening(false); };
    r.onend = () => { setListening(false); setInterimTranscript(""); onEndRef.current?.(); };
    r.onstart = () => setListening(true);
    recognitionRef.current = r;
    return () => { try { r.abort(); } catch { /* noop */ } };
  }, [lang, continuous, interimResults]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return false;
    try { recognitionRef.current.start(); setListening(true); return true; } catch { return false; }
  }, []);

  const stop = useCallback(() => { recognitionRef.current?.stop(); setListening(false); }, []);
  const reset = useCallback(() => { setFinalTranscript(""); setInterimTranscript(""); }, []);

  return { listening, supported, interimTranscript, finalTranscript, start, stop, reset };
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

export interface PronunciationScore {
  overall: number;
  accuracy: number;
  fluency: number;
  wordCount: number;
  matchedWords: string[];
  missedWords: string[];
  extraWords: string[];
  feedback: string;
}

export function scorePronunciation(spoken: string, target: string): PronunciationScore {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:()"'„"«»]/g, "").replace(/\s+/g, " ");
  const spokenWords = normalize(spoken).split(" ").filter(Boolean);
  const targetWords = normalize(target).split(" ").filter(Boolean);
  if (spokenWords.length === 0 || targetWords.length === 0) {
    return { overall: 0, accuracy: 0, fluency: 0, wordCount: 0, matchedWords: [], missedWords: targetWords, extraWords: spokenWords, feedback: "No speech detected." };
  }
  const matched: string[] = [], missed: string[] = [];
  const usedSpoken = new Set<number>();
  for (const targetWord of targetWords) {
    let bestIdx = -1, bestScore = 0;
    for (let i = 0; i < spokenWords.length; i++) {
      if (usedSpoken.has(i)) continue;
      const maxLen = Math.max(targetWord.length, spokenWords[i].length);
      const score = 1 - levenshtein(targetWord, spokenWords[i]) / maxLen;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestScore >= 0.7) { matched.push(targetWord); usedSpoken.add(bestIdx); } else { missed.push(targetWord); }
  }
  const extra = spokenWords.filter((_, i) => !usedSpoken.has(i));
  const accuracy = Math.round((matched.length / targetWords.length) * 100);
  const fluency = Math.round((matched.length / Math.max(spokenWords.length, targetWords.length)) * 100);
  const overall = Math.round(accuracy * 0.6 + fluency * 0.4);
  const feedback = overall >= 90 ? "Excellent! Native-like. 🎉" : overall >= 75 ? "Great job!" : overall >= 50 ? "Good effort!" : "Try again.";
  return { overall, accuracy, fluency, wordCount: targetWords.length, matchedWords: matched, missedWords: missed, extraWords: extra, feedback };
}
