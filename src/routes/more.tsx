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
  Search,
  TrendingUp,
  Download,
  Users,
  FileText,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Globe,
  Twitter,
  Hash,
  Video
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

type TabType = "chat" | "xview";

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
            Premium Tools.
            <br />
            <span className="opacity-40">AI + Social Explorer.</span>
          </h2>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-md">
            Interactive AI chatbot and anonymous X/Twitter viewer loaded directly inside your browser.
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
                onClick={() => setActiveTab(tab.id as TabType)}
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
          {activeTab === "xview" && <XViewerTool />}
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

/* ==========================================================================
   X / Twitter Viewer Tool (Client-side, user's IP)
   ========================================================================== */
type XViewMode = "home" | "browsing";
type XSearchType = "user" | "tweet";

const TWV_BASE = "https://twitterwebviewer.com";

function XViewerTool() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<XSearchType>("user");
  const [viewMode, setViewMode] = useState<XViewMode>("home");
  const [iframeSrc, setIframeSrc] = useState("");
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateTo = (url: string) => {
    setIframeSrc(url);
    setViewMode("browsing");
    setIframeLoading(true);
    setIframeError(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // If input starts with @ or looks like a username, go to profile directly
    if (q.startsWith("@") || (!q.includes(" ") && !q.startsWith("#"))) {
      const username = q.replace(/^@/, "");
      navigateTo(`${TWV_BASE}/${username}`);
    } else {
      navigateTo(`${TWV_BASE}/search?q=${encodeURIComponent(q)}&type=${searchType}`);
    }
  };

  const goToProfile = (username: string) => {
    setQuery(`@${username}`);
    navigateTo(`${TWV_BASE}/${username}`);
  };

  const goToTrending = () => {
    setQuery("");
    navigateTo(`${TWV_BASE}/trending`);
  };

  const goToHashtag = (tag: string) => {
    setQuery(`#${tag}`);
    navigateTo(`${TWV_BASE}/search?q=${encodeURIComponent(`#${tag}`)}&type=tweet`);
  };

  const goHome = () => {
    setViewMode("home");
    setIframeSrc("");
    setQuery("");
    setIframeError(false);
  };

  const openExternal = () => {
    if (iframeSrc) {
      window.open(iframeSrc, "_blank", "noopener,noreferrer");
    }
  };

  const refreshFrame = () => {
    if (iframeRef.current && iframeSrc) {
      setIframeLoading(true);
      setIframeError(false);
      iframeRef.current.src = iframeSrc;
    }
  };

  return (
    <div className="rounded-[24px] border border-border ios-glass ios-shadow flex flex-col overflow-hidden" style={{ minHeight: "580px" }}>
      
      {/* Branded Header Bar */}
      <div className="px-5 pt-5 pb-4 border-b border-border/20 space-y-4 select-none flex-shrink-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-4.5 text-sky-500 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-black tracking-tight leading-tight">X Viewer</h3>
              <p className="text-[10px] text-muted-foreground font-bold">Anonymous • No Login Required</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {viewMode === "browsing" && (
              <>
                <button
                  onClick={refreshFrame}
                  className="size-8 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
                  title="Refresh"
                >
                  <RefreshCw className="size-3.5" />
                </button>
                <button
                  onClick={openExternal}
                  className="size-8 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
                  title="Open in new tab"
                >
                  <ExternalLink className="size-3.5" />
                </button>
                <button
                  onClick={goHome}
                  className="h-8 px-3 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 text-[11px] font-bold gap-1"
                >
                  <ArrowRight className="size-3 rotate-180" />
                  Back
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search @username, keywords, or #hashtag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 bg-secondary/35 text-[13.5px] font-bold border border-border/30 rounded-[14px] pl-10 pr-4 outline-none focus:border-sky-500/50 transition-all placeholder:font-medium"
            />
          </div>

          {/* Search Type Toggle */}
          <div className="flex bg-secondary/40 rounded-[12px] border border-border/25 p-0.5 gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSearchType("user")}
              className={`px-2.5 py-2 rounded-[10px] text-[11px] font-bold transition-all ${
                searchType === "user" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Users className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSearchType("tweet")}
              className={`px-2.5 py-2 rounded-[10px] text-[11px] font-bold transition-all ${
                searchType === "tweet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <FileText className="size-3.5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!query.trim()}
            className="h-11 px-4 rounded-[14px] bg-sky-500 text-white font-black text-[13px] flex items-center gap-1.5 hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Search className="size-3.5" />
            <span className="hidden sm:inline">Go</span>
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative" style={{ minHeight: "420px" }}>
        {viewMode === "home" ? (
          /* ===== HOME VIEW: Quick Actions & Featured ===== */
          <div className="p-5 space-y-5 animate-slide-up">
            
            {/* Quick Actions Grid */}
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { 
                    label: "Trending", 
                    desc: "Hot topics now",
                    icon: TrendingUp,
                    color: "text-orange-500 bg-orange-500/8 border-orange-500/15 hover:border-orange-500/30",
                    onClick: goToTrending
                  },
                  { 
                    label: "Download Video", 
                    desc: "Save X videos",
                    icon: Download,
                    color: "text-emerald-500 bg-emerald-500/8 border-emerald-500/15 hover:border-emerald-500/30",
                    onClick: () => navigateTo(`${TWV_BASE}/download`)
                  },
                  { 
                    label: "Browse Users", 
                    desc: "Search profiles",
                    icon: Users,
                    color: "text-violet-500 bg-violet-500/8 border-violet-500/15 hover:border-violet-500/30",
                    onClick: () => { setSearchType("user"); document.querySelector<HTMLInputElement>('input[placeholder*="Search @"]')?.focus(); }
                  },
                  { 
                    label: "Search Posts", 
                    desc: "Find tweets",
                    icon: FileText,
                    color: "text-sky-500 bg-sky-500/8 border-sky-500/15 hover:border-sky-500/30",
                    onClick: () => { setSearchType("tweet"); document.querySelector<HTMLInputElement>('input[placeholder*="Search @"]')?.focus(); }
                  }
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={`flex flex-col gap-2 p-4 rounded-[18px] border transition-all active:scale-[0.97] text-left ${action.color}`}
                    >
                      <Icon className="size-5" />
                      <div>
                        <p className="text-[12.5px] font-black leading-tight">{action.label}</p>
                        <p className="text-[10px] opacity-60 font-medium mt-0.5">{action.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Profiles */}
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-3">Popular Profiles</p>
              <div className="flex flex-wrap gap-2">
                {["elonmusk", "NASA", "MKBHD", "Apple", "Google", "SpaceX", "tsaborern", "veraborisova"].map((username) => (
                  <button
                    key={username}
                    onClick={() => goToProfile(username)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary/30 border border-border/20 hover:bg-secondary/60 hover:border-border/40 transition-all active:scale-95 text-[12px] font-bold text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-sky-500">@</span>
                    {username}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-3">Explore Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {["technology", "AI", "crypto", "sports", "gaming", "music"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => goToHashtag(tag)}
                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-sky-500/5 border border-sky-500/15 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all active:scale-95 text-[12px] font-bold text-sky-500/80 hover:text-sky-500"
                  >
                    <Hash className="size-3" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="rounded-[16px] border border-border/20 bg-secondary/10 p-4 flex gap-3 items-start">
              <Info className="size-4.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[12px] font-bold text-foreground/80">Anonymous Viewer</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Browse public X/Twitter profiles, tweets, trending topics, and download videos — completely anonymous, no login required. All requests are handled directly from your browser.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ===== BROWSING VIEW: iFrame ===== */
          <div className="w-full h-full relative" style={{ minHeight: "420px" }}>
            {/* Loading Overlay */}
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="size-5 text-sky-500 animate-spin" />
                  <span className="text-[13px] font-bold text-foreground">Loading content...</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Fetching from X via your network</p>
              </div>
            )}

            {/* Error Fallback */}
            {iframeError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-8 text-center">
                <div className="size-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                  <Info className="size-6 text-orange-500" />
                </div>
                <h4 className="text-[15px] font-black mb-1">Content Blocked</h4>
                <p className="text-[12px] text-muted-foreground max-w-xs mb-4 leading-relaxed">
                  This site prevents embedding in iframes. You can still view the content by opening it directly in a new tab.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={openExternal}
                    className="h-10 px-5 rounded-[14px] bg-sky-500 text-white font-bold text-[12.5px] flex items-center gap-1.5 hover:bg-sky-400 active:scale-95 transition-all"
                  >
                    <ExternalLink className="size-3.5" />
                    Open in New Tab
                  </button>
                  <button
                    onClick={goHome}
                    className="h-10 px-4 rounded-[14px] border border-border font-bold text-[12.5px] hover:bg-secondary active:scale-95 transition-all"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full border-0 bg-white rounded-b-[24px]"
              style={{ height: "480px", minHeight: "420px" }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
              onLoad={() => {
                setIframeLoading(false);
                // Check if iframe loaded properly (if accessible)
                try {
                  const doc = iframeRef.current?.contentDocument;
                  if (doc && doc.body && doc.body.innerHTML.length < 50) {
                    setIframeError(true);
                  }
                } catch {
                  // Cross-origin — can't access, but that means it loaded
                }
              }}
              onError={() => {
                setIframeLoading(false);
                setIframeError(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
