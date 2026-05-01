"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/Button";
import { Message } from "@/lib/types";
import { Send, Bot, User, Zap, AlertCircle } from "lucide-react";

const QUICK_ACTIONS = [
  "Am I eligible to vote?",
  "Where is my polling place?",
  "What are the registration deadlines?",
  "What do I need to bring to the polls?",
  "Can I vote by mail?",
  "How do I check my registration?",
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "I'm having trouble connecting right now. Please try again in a moment.";
}

function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
          isUser ? "bg-[#e41d35]" : "bg-[#002855]"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`px-4 py-3 text-sm leading-relaxed ${isUser ? "bubble-user" : "bubble-assistant"}`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-[#747780] px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-[#002855] flex-shrink-0 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bubble-assistant px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#747780] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const { messages, addMessage, isTyping, setIsTyping, voterState } = useUserStore();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u_${crypto.randomUUID()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput("");
    setSuggestions([]);
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
          userState: voterState,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request");
      const assistantMsg: Message = {
        id: `a_${crypto.randomUUID()}`,
        role: "assistant",
        content: data.reply ?? "I apologize, I could not process that request.",
        timestamp: new Date(),
      };
      addMessage(assistantMsg);
      setSuggestions(data.suggestions ?? []);
    } catch (error) {
      addMessage({
        id: `err_${crypto.randomUUID()}`,
        role: "assistant",
        content: getErrorMessage(error),
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#ebeef0]">
        <div className="w-10 h-10 rounded-full bg-[#002855] flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#181c1e]">Election Assistant</h1>
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            Online &amp; Ready to Help
          </div>
        </div>
        <div className="ml-auto">
          <span className="flex items-center gap-1 text-xs text-[#43474f] bg-[#ebeef0] px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3 text-[#e41d35]" /> Powered by Gemini
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {!hasMessages && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#d6e3ff] flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-[#002855]" />
            </div>
            <h2 className="text-lg font-semibold text-[#181c1e] mb-1">Welcome to CivicPulse Assistant</h2>
            <p className="text-sm text-[#43474f] max-w-sm mx-auto mb-6">
              Ask me anything about voter eligibility, registration, polling places, or election deadlines.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="text-left text-xs border border-[#c4c6d0] rounded px-3 py-2.5 bg-white hover:border-[#002855] hover:bg-[#f7fafc] transition-colors text-[#43474f] hover:text-[#002855] font-medium"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {/* Suggestions */}
        {!isTyping && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in pl-11">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs border border-[#aac7fd] text-[#002855] bg-[#d6e3ff]/50 hover:bg-[#d6e3ff] rounded-full px-3 py-1.5 font-medium transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-1.5 py-2 border-t border-[#ebeef0] text-[10px] text-[#747780]">
        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
        AI can make mistakes. Verify important information with official government sources.
      </div>

      {/* Input */}
      <div className="pb-2">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2 bg-white border border-[#c4c6d0] rounded-lg p-2 focus-within:border-[#002855] transition-colors"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about voting, eligibility, polling places..."
            className="flex-1 text-sm bg-transparent outline-none px-2 text-[#181c1e] placeholder:text-[#747780]"
            disabled={isTyping}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || isTyping}
            className="aspect-square p-0 w-9 h-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
