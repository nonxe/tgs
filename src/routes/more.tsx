import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { 
  Sun, 
  Moon, 
  Sparkles,
  MessageSquare,
  Send,
  Trash2,
  User,
  Bot,
  ChevronRight,
  Info,
  Globe
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

type TabType = "chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Full list of AI Models
const AI_MODELS = [
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", desc: "Fast general-purpose model", badgeColor: "bg-green-500/10 text-green-500 border-green-500/20" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", desc: "Advanced reasoning & logic", badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "gpt4", name: "ChatGPT (GPT-4)", provider: "OpenAI", desc: "High-quality general reasoning", badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "claude", name: "Claude", provider: "Anthropic", desc: "Nuanced writing & synthesis", badgeColor: "bg-amber-600/10 text-amber-600 border-amber-600/20" },
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic", desc: "Premium analysis & coding", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "gemini", name: "Google Gemini", provider: "Google", desc: "Creative & multimodal tasks", badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "llama3", name: "Llama 3", provider: "Meta", desc: "Open-source general chat", badgeColor: "bg-blue-600/10 text-blue-600 border-blue-600/20" },
  { id: "blackbox", name: "Blackbox AI", provider: "Blackbox", desc: "Excellent coding assistant", badgeColor: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" },
  { id: "meta", name: "Meta AI", provider: "Meta", desc: "Social search companion", badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "copilot", name: "MS Copilot", provider: "Microsoft", desc: "Web search integrated chat", badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { id: "mixtral", name: "Mixtral 8x7B", provider: "Mistral", desc: "High-speed open models", badgeColor: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
  { id: "dolphin", name: "Dolphin AI", provider: "Cognitive", desc: "Uncensored assistant chat", badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { id: "unlimited-ai", name: "Unlimited AI", provider: "Public", desc: "No rate limits chatbot", badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { id: "perplexity", name: "Perplexity", provider: "Perplexity", desc: "Real-time answers & search", badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  { id: "searchgpt", name: "SearchGPT", provider: "OpenAI", desc: "Dynamic web search companion", badgeColor: "bg-orange-600/10 text-orange-600 border-orange-600/20" },
  { id: "turboseek", name: "TurboSeek", provider: "Turbo", desc: "Blazing fast internet queries", badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { id: "writecream", name: "Writecream", provider: "Writecream", desc: "Copywriting & helper tasks", badgeColor: "bg-yellow-600/10 text-yellow-600 border-yellow-600/20" }
];

export function MorePage({ embed = false }: { embed?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  // Global theme sync
  useEffect(() => {
    if (embed) return;
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, [embed]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const content = (
    <section className={`flex-1 flex flex-col w-full gap-6 ${embed ? "py-2" : "px-4 py-8 max-w-2xl md:max-w-6xl mx-auto"}`}>
      {/* Intro */}
      {!embed && (
        <div className="text-center md:text-left">
          <h2 className="text-[34px] md:text-[44px] font-black tracking-tight leading-[1.1] select-none">
            Premium External APIs.
            <br />
            <span className="opacity-40">Dynamic chatbot & tools.</span>
          </h2>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-md">
            Interactive, fully integrated external micro-services loaded dynamically inside your browser.
          </p>
        </div>
      )}

      {/* Responsive Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start w-full">
        {/* Left Column: Tab Selector */}
        <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full select-none">
          {[
            { id: "chat", label: "AI Chatbot", icon: MessageSquare },
            { id: "xview", label: "X Viewer", icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "xview") {
                    window.open("/x", "_blank");
                  } else {
                    setActiveTab(tab.id as TabType);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[16px] border font-bold text-[14px] whitespace-nowrap transition-all ios-tap-active ${
                  isActive 
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Tool Workspace */}
        <div className="md:col-span-4 w-full">
          {activeTab === "chat" && <ChatTool />}
        </div>
      </div>
    </section>
  );

  if (embed) return content;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-2xl md:max-w-6xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity">
            CLOUD
          </Link>
          <Link to="/note" className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity">
            NOTES
          </Link>
          <Link to="/convert" className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity">
            CONVERTS
          </Link>
          <Link to="/more" className="text-[20px] font-black tracking-tighter select-none">
            MORE
          </Link>
          <Link to="/owner" className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity">
            OWNER INFO
          </Link>
        </div>

        <button 
          onClick={toggleTheme}
          className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </header>

      {content}
    </main>
  );
}

/* ==========================================================================
   AI Chatbot Tool (With Custom Models List)
   ========================================================================== */
function ChatTool() {
  const [model, setModel] = useState("deepseek-v3");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModelsList, setShowModelsList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeModel = AI_MODELS.find(m => m.id === model) || AI_MODELS[0];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`https://apis.davidcyril.name.ng/ai/${model}?text=${encodeURIComponent(userMessage)}`);
      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      
      const reply = data.response || data.message || data.reply || data.result || "No response received.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: `Error: Failed to fetch response from ${activeModel.name}. This model may be undergoing maintenance. Please choose another model from the selection list.` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="rounded-[24px] border border-border p-5 ios-glass ios-shadow flex flex-col h-[520px] relative overflow-hidden">
      {/* Model Selector Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/20 select-none flex-shrink-0 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModelsList(!showModelsList)}
            className="flex items-center gap-2 px-3 py-2 rounded-[14px] bg-secondary/60 border border-border hover:bg-secondary transition-all text-left"
          >
            <div>
              <p className="text-[10px] font-bold text-muted-foreground leading-tight">ACTIVE MODEL</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[13px] font-black tracking-tight">{activeModel.name}</span>
                <ChevronRight className={`size-3.5 text-muted-foreground transition-transform ${showModelsList ? "rotate-90" : ""}`} />
              </div>
            </div>
          </button>
        </div>

        <button 
          onClick={clearChat}
          className="size-9 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
        >
          <Trash2 className="size-4" />
        </button>

        {/* Dropdown Models Drawer overlay */}
        {showModelsList && (
          <div className="absolute top-[52px] left-0 w-72 max-h-72 overflow-y-auto bg-background/95 backdrop-blur-xl border border-border rounded-[20px] shadow-2xl p-2.5 z-50 animate-spring-scale">
            <p className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider px-2.5 py-1">Select AI Model</p>
            <div className="space-y-1 mt-1.5">
              {AI_MODELS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setModel(item.id);
                    setShowModelsList(false);
                  }}
                  className={`w-full text-left p-2 rounded-[12px] transition-all hover:bg-secondary flex flex-col gap-0.5 ${
                    model === item.id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[13px] font-black">{item.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.provider}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 select-none">
            <Sparkles className="size-8 text-foreground opacity-30 mb-2 animate-pulse" />
            <p className="text-[14px] font-bold">Start a conversation</p>
            <p className="text-[11px] opacity-75 mt-0.5">Select from 17 external AI models to get answers.</p>
            <div className="mt-4 p-3 rounded-[16px] bg-secondary/20 border border-border/20 max-w-xs text-left flex gap-2">
              <Info className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                DeepSeek V3 and Gemini usually offer the fastest responses.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`size-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-foreground border-foreground text-background" : "bg-secondary border-border"
              }`}>
                {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={`max-w-[75%] rounded-[18px] px-4 py-2.5 text-[14px] leading-relaxed ${
                msg.role === "user" 
                  ? "bg-secondary/45 text-foreground border border-border/20 animate-fade-in" 
                  : "bg-secondary/20 text-foreground/90 border border-border/10 animate-fade-in"
              }`} style={{ whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full border bg-secondary border-border flex items-center justify-center">
              <Bot className="size-4" />
            </div>
            <div className="bg-secondary/25 border border-border/10 rounded-[18px] px-4 py-3 flex items-center gap-1.5">
              <span className="size-2 bg-foreground/40 rounded-full animate-bounce" />
              <span className="size-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="size-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-3 border-t border-border/20 flex gap-2 flex-shrink-0 select-none">
        <input
          type="text"
          placeholder={`Ask ${activeModel.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-secondary/35 text-[14px] font-bold border border-border/30 rounded-[16px] px-4 py-3 outline-none focus:border-foreground/50 transition-all placeholder:font-medium"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="size-11 rounded-[16px] bg-foreground text-background flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
