"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  User,
  Send,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CyberCard } from "@/components/ui/cyber-card";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm GuardianAI Assistant. I can help you with cybersecurity questions, analyze threats, and guide you through security tools. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Extract first 2 sentences/lines for text-to-speech
  const extractFirstTwoLines = (text: string): string => {
    const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 2);
    return sentences.join(" ");
  };

  const speakMessage = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Only speak first two lines
    const textToSpeak = extractFirstTwoLines(text);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Get voice settings from localStorage
    const voiceTone =
      localStorage.getItem("guardianai_voice_tone") || "professional";
    const voices = window.speechSynthesis.getVoices();

    // Select voice based on tone preference
    let selectedVoice = voices.find((voice) => voice.lang.startsWith("en"));
    if (voiceTone === "friendly" && voices.length > 1) {
      selectedVoice =
        voices.find((voice) => voice.name.includes("Female")) || selectedVoice;
    } else if (voiceTone === "authoritative") {
      selectedVoice =
        voices.find((voice) => voice.name.includes("Male")) || selectedVoice;
    }

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch =
      voiceTone === "friendly"
        ? 1.1
        : voiceTone === "authoritative"
          ? 0.9
          : 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewportRef.current) {
        const scrollArea = scrollViewportRef.current.closest(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      }
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const voiceSetting = localStorage.getItem("guardianai_voice_enabled");
    setVoiceEnabled(voiceSetting === "true");

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsMinimized((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Chat error:", error);
      return "I'm experiencing technical difficulties. Please check your connection and try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const botResponseText = await getBotResponse(currentMessage);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      if (voiceEnabled) {
        speakMessage(botResponseText);
      }
    } catch (error) {
      setIsTyping(false);
      console.error("Error getting bot response:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    localStorage.setItem("guardianai_voice_enabled", newVoiceState.toString());

    if (!newVoiceState) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group flex items-center gap-3">
        {/* Floating Cyber Tooltip Label */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 border border-cyan-400/40 text-xs font-mono text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.25)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0">
          <Sparkles className="h-3 w-3 text-cyan-300 animate-spin" />
          <span>GuardianAI [Ctrl+J]</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* 56x56 Glowing Cyber Orb */}
        <button
          onClick={() => setIsMinimized(false)}
          className="relative h-14 w-14 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-950/90 via-slate-950 to-black border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
          title="Open GuardianAI Assistant (Ctrl+J)"
        >
          {/* Rotating Laser Halo */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-80"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(0,255,231,0.8), transparent, rgba(63,255,125,0.8), transparent, rgba(0,255,231,0.8))",
              animation: "spin 4s linear infinite",
            }}
          />

          {/* Inner Core */}
          <div className="absolute inset-[2px] rounded-full bg-slate-950/90 backdrop-blur-md flex items-center justify-center" />

          {/* Icon Center */}
          <div className="relative z-10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_8px_#00ffe7]" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-emerald-400 animate-pulse" />
          </div>

          {/* Ping Beacon Dot */}
          <div className="absolute top-1.5 right-1.5 z-20 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96">
      <CyberCard
        variant="hologram"
        className="flex flex-col shadow-2xl shadow-cyan-500/20 backdrop-blur-sm h-[400px] sm:h-[500px]"
      >
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-t-lg border-b border-cyan-500/20">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Shield className="h-5 w-5 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse">
                <Shield className="h-5 w-5 text-cyan-400/30" />
              </div>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-cyan-400 font-mono">
              GuardianAI
            </CardTitle>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium hidden sm:inline">
                ONLINE
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoice}
              className={`text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 ${voiceEnabled ? "text-cyan-400" : ""}`}
            >
              {voiceEnabled ? (
                isSpeaking ? (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 sm:p-4 bg-gray-900/50 overflow-hidden min-h-0 gap-3">
          <ScrollArea
            className="flex-1 overflow-hidden"
            onMouseEnter={(e) => {
              const scrollArea = e.currentTarget.querySelector<HTMLElement>(
                "[data-radix-scroll-area-viewport]",
              );
              if (scrollArea) scrollArea.focus();
            }}
          >
            <div
              className="space-y-3 sm:space-y-4 pr-4"
              ref={scrollViewportRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-cyan-500/20 to-cyan-400/30 text-cyan-100 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                        : "bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-gray-100 border border-gray-600/30 shadow-lg backdrop-blur-sm"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === "bot" && (
                        <div className="relative">
                          <Shield className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <div className="absolute inset-0 animate-pulse">
                            <Shield className="h-4 w-4 text-cyan-400/30 mt-0.5 flex-shrink-0" />
                          </div>
                        </div>
                      )}
                      {message.sender === "user" && (
                        <User className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-gray-100 border border-gray-600/30 p-2 sm:p-3 rounded-lg shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-cyan-400" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        AI analyzing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {messages.length <= 2 && (
            <div className="flex-shrink-0 flex flex-wrap gap-1.5 pt-1">
              {[
                "How to detect phishing URLs?",
                "Analyze APK vulnerabilities",
                "Explain network packet sniffing",
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(prompt)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 transition-all text-left truncate max-w-full cursor-pointer hover:border-cyan-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="flex-shrink-0 flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about cybersecurity..."
              className="flex-1 bg-gray-800/50 border-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300 text-gray-100 placeholder-gray-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 hover:from-cyan-500/30 hover:to-green-500/30 text-cyan-400 border border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </CyberCard>
    </div>
  );
}
