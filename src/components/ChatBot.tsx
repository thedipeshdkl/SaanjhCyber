import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Shield, Headphones } from "lucide-react";
import { trpc } from "@/providers/trpc";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
};

const QUICK_ACTIONS = [
  { label: "🔍 Verify a number/email", message: "I want to verify an entity" },
  { label: "📋 Track my case", message: "How do I track my case?" },
  { label: "📝 File a report", message: "How to report a cybercrime?" },
  { label: "⚠️ I got scammed", message: "I think I've been scammed, what do I do?" },
  { label: "🔒 Blackmail help", message: "Someone is blackmailing me online" },
  { label: "🚨 Emergency contacts", message: "emergency" },
];

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  content: "👋 Namaste! I'm your **SaanjhCyber Assistant**.\n\nHow can I help you today?",
  timestamp: new Date(),
  suggestions: ["🔍 Verify a number", "📋 Track case", "📝 Report crime", "🚨 Emergency"],
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      const suggestions = getSuggestions(data.intent);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          content: data.response,
          timestamp: new Date(),
          suggestions,
        },
      ]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          content: "Oops, something went wrong. Try again or type 'help' for options.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function getSuggestions(intent: string): string[] | undefined {
    switch (intent) {
      case "track_case":
      case "track_help":
        return ["📋 View my reports", "💬 Message team", "📝 File new report"];
      case "lookup_entity":
        return ["🔍 Check another", "📝 Report this", "🚨 Emergency"];
      case "tip_phishing":
      case "tip_scam":
      case "tip_blackmail":
      case "tip_security":
      case "tip_investment":
      case "tip_fake_job":
        return ["📝 File a report", "💬 Talk to agent", "🔍 Verify something"];
      case "emergency":
        return ["📝 File report now", "💬 Talk to agent"];
      case "live_agent":
        return ["📋 Track my case", "📝 File report"];
      case "greeting":
      case "about":
        return ["🔍 Verify entity", "📋 Track case", "⚠️ I got scammed"];
      default:
        return ["🔍 Verify entity", "📋 Track case", "📝 Report", "🚨 Help"];
    }
  }

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: msg, timestamp: new Date() },
    ]);
    setInput("");
    setIsTyping(true);
    setShowQuickActions(false);
    sendMutation.mutate({ message: msg });
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Map suggestion labels to actual messages
    const msgMap: Record<string, string> = {
      "🔍 Verify a number": "I want to verify a phone number or email",
      "🔍 Verify entity": "I want to verify a phone number or email",
      "🔍 Check another": "I want to check another entity",
      "📋 Track case": "How do I track my case?",
      "📋 Track my case": "How do I track my case?",
      "📋 View my reports": "How do I track my case?",
      "📝 Report": "How to report a cybercrime?",
      "📝 Report crime": "How to report a cybercrime?",
      "📝 File a report": "How to report a cybercrime?",
      "📝 File report now": "How to report a cybercrime?",
      "📝 File new report": "How to report a cybercrime?",
      "📝 Report this": "How to report a cybercrime?",
      "⚠️ I got scammed": "I think I've been scammed, what should I do?",
      "🚨 Emergency": "emergency",
      "🚨 Help": "emergency",
      "💬 Talk to agent": "I want to talk to a live agent",
      "💬 Message team": "I want to talk to a live agent",
    };
    handleSend(msgMap[suggestion] || suggestion);
  };

  function renderContent(content: string) {
    return content.split("\n").map((line, i) => {
      let rendered = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
      // Convert /path links to clickable
      rendered = rendered.replace(
        /\[([^\]]+)\]\(\/([^)]+)\)/g,
        '<a href="/$2" class="text-[var(--prayer-crimson)] underline hover:opacity-80">$1</a>'
      );
      rendered = rendered.replace(
        /(?<!\[)\/(report|track|search|login|dashboard|profile|messages|awareness)\b/g,
        '<a href="/$1" class="text-[var(--prayer-crimson)] underline hover:opacity-80">/$1</a>'
      );
      return <p key={i} className="mb-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered || "&nbsp;" }} />;
    });
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[var(--prayer-crimson)] to-[var(--lattice-wood)] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--prayer-crimson)] to-[var(--lattice-wood)] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">SaanjhCyber AI</p>
                  <p className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                    Online — Ask me anything
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="/messages"
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Talk to live agent"
                >
                  <Headphones className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-gray-50/80 to-white">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--prayer-crimson)]/10 to-[var(--prayer-crimson)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-[var(--prayer-crimson)]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--prayer-crimson)] text-white rounded-br-md"
                          : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                      }`}
                    >
                      {msg.role === "bot" ? renderContent(msg.content) : <p>{msg.content}</p>}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  {/* Suggestion chips after bot messages */}
                  {msg.role === "bot" && msg.suggestions && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-gray-50 hover:bg-[var(--prayer-crimson)]/5 hover:text-[var(--prayer-crimson)] border border-gray-150 rounded-full transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Actions on first open */}
              {showQuickActions && messages.length <= 1 && (
                <div className="space-y-1.5 ml-9">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.message)}
                      className="w-full text-left px-3 py-2.5 text-[12px] font-medium bg-white hover:bg-[var(--prayer-crimson)]/5 hover:border-[var(--prayer-crimson)]/20 border border-gray-100 rounded-xl transition-all flex items-center gap-2"
                    >
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--prayer-crimson)]/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[var(--prayer-crimson)]" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live Agent Banner */}
            <a
              href="/messages"
              className="mx-3 mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2.5 hover:bg-blue-100/70 transition-colors"
            >
              <Headphones className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-medium text-blue-700 flex-1">Need a real person? Talk to our team</span>
              <span className="text-[10px] text-blue-500">→</span>
            </a>

            {/* Input */}
            <div className="px-3 pb-3 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type or paste a number/email to check..."
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--prayer-crimson)]/20 focus:border-[var(--prayer-crimson)] outline-none bg-gray-50/50"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-[var(--prayer-crimson)] text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
