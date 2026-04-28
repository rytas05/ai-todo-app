"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useEffect, useRef, useState } from "react";

interface Props {
  onTranscript: (text: string) => void;
  onEnd?: () => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscript, onEnd, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onEndRef = useRef(onEnd);

  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.lang = "ja-JP";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      onTranscriptRef.current(transcript);
    };

    rec.onend = () => {
      setListening(false);
      onEndRef.current?.();
    };
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
  }, []);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
        listening
          ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      } disabled:opacity-40`}
      title={listening ? "録音停止" : "音声入力"}
    >
      {listening ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 15.93V20H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 11h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93z" />
        </svg>
      )}
    </button>
  );
}
