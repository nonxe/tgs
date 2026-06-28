import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { 
  Sun, 
  Moon, 
  Sparkles,
  MessageSquare,
  PenTool,
  Download,
  Send,
  Trash2,
  User,
  Bot,
  Percent,
  CheckCircle,
  HelpCircle,
  Video,
  Music,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Info
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

type TabType = "chat" | "writer" | "downloader";

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

function MorePage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  // Global theme sync
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

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
          <span className="text-[20px] font-black tracking-tighter select-none">
            MORE
          </span>
        </div>

        <button 
          onClick={toggleTheme}
          className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </header>

      {/* Workspace */}
      <section className="flex-1 flex flex-col px-4 py-8 max-w-2xl md:max-w-6xl mx-auto w-full gap-8">
        {/* Intro */}
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

        {/* Responsive Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start w-full">
          {/* Left Column: Tab Selector */}
          <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full select-none">
            {[
              { id: "chat", label: "AI Chatbot", icon: MessageSquare },
              { id: "writer", label: "AI Writing Tools", icon: PenTool },
              { id: "downloader", label: "Media Downloader", icon: Download }
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
            {activeTab === "writer" && <WriterTool />}
            {activeTab === "downloader" && <DownloaderTool />}
          </div>
        </div>
      </section>
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
    <div className="rounded-[24px] border border-border p-5 ios-glass ios-shadow animate-spring-scale flex flex-col h-[580px] relative overflow-hidden">
      {/* Model Selector Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/20 select-none flex-shrink-0 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModelsList(!showModelsList)}
            className="flex items-center gap-2 px-3 py-2 rounded-[14px] bg-secondary/60 border border-border hover:bg-secondary transition-all text-left"
          >
            <div>
              <p className="text-[12px] font-bold text-muted-foreground leading-tight">ACTIVE MODEL</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[14px] font-black tracking-tight">{activeModel.name}</span>
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
            <Sparkles className="size-9 text-foreground opacity-30 mb-2 animate-pulse" />
            <p className="text-[15px] font-bold">Start a conversation</p>
            <p className="text-[12px] opacity-75 mt-0.5">Select from 17 external API models to get answers.</p>
            <div className="mt-4 p-3 rounded-[16px] bg-secondary/20 border border-border/20 max-w-xs text-left flex gap-2">
              <Info className="size-4.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                <strong>Model Note:</strong> DeepSeek V3 and Gemini usually offer the fastest responses.
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
   AI Writer & Assistant Tools (Split View Layout)
   ========================================================================== */
function WriterTool() {
  const [toolMode, setToolMode] = useState<"humanizer" | "detector">("humanizer");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Results
  const [humanizedText, setHumanizedText] = useState<string | null>(null);
  const [detectorResult, setDetectorResult] = useState<{
    aiScore: string;
    humanScore: string;
    message: string;
  } | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const handleProcess = async () => {
    if (!text.trim() || loading) return;

    if (toolMode === "detector" && wordCount < 100) {
      alert("AI Text Detector requires at least 100 words.");
      return;
    }

    setLoading(true);
    setHumanizedText(null);
    setDetectorResult(null);

    try {
      if (toolMode === "humanizer") {
        const res = await fetch(`https://apis.davidcyril.name.ng/tools/humanize?text=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        
        const cleanText = (data.humanized || "")
          .replace(/<\/?[^>]+(>|$)/g, "")
          .replace(/&nbsp;/g, " ");
        setHumanizedText(cleanText || "Successfully humanized.");
      } else {
        const res = await fetch(`https://apis.davidcyril.name.ng/api/detect?text=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        
        if (data.error) {
          alert(data.error);
          return;
        }

        const score = data.result || {};
        setDetectorResult({
          aiScore: score.ai_score || "0",
          humanScore: score.human_score || "100",
          message: data.message || "Detection complete."
        });
      }
    } catch (err) {
      alert("Failed to connect to API endpoint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-border p-6 ios-glass ios-shadow animate-spring-scale space-y-6">
      {/* Switch mode */}
      <div className="grid grid-cols-2 gap-1 bg-secondary/40 p-1 rounded-[16px] border border-border/25 select-none">
        <button
          onClick={() => {
            setToolMode("humanizer");
            setHumanizedText(null);
            setDetectorResult(null);
          }}
          className={`py-3 rounded-[12px] text-[13.5px] font-bold transition-all ${
            toolMode === "humanizer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          AI Humanizer
        </button>
        <button
          onClick={() => {
            setToolMode("detector");
            setHumanizedText(null);
            setDetectorResult(null);
          }}
          className={`py-3 rounded-[12px] text-[13.5px] font-bold transition-all ${
            toolMode === "detector" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          AI Text Detector
        </button>
      </div>

      {/* Split pane workspace layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Side: Input Form */}
        <div className="md:col-span-3 space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                toolMode === "humanizer"
                  ? "Paste AI generated text here to make it sound human..."
                  : "Paste your text here (minimum 100 words required) to detect AI probability..."
              }
              rows={8}
              className="w-full bg-secondary/35 text-[14px] font-medium border border-border/30 rounded-[18px] px-4 py-3.5 outline-none focus:border-foreground/50 transition-all resize-none placeholder:font-medium"
            />
            <span className="absolute bottom-3 right-3 text-[11px] font-bold text-muted-foreground select-none">
              {wordCount} words
            </span>
          </div>

          <button
            onClick={handleProcess}
            disabled={loading || !text.trim() || (toolMode === "detector" && wordCount < 100)}
            className="w-full h-12 rounded-[16px] bg-foreground text-background font-bold text-[14px] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:scale-100 select-none"
          >
            {loading ? "Processing..." : toolMode === "humanizer" ? "Humanize Text" : "Analyze AI Probability"}
          </button>
        </div>

        {/* Right Side: Output Results */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="h-full min-h-[220px] rounded-[18px] border border-dashed border-border flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
              <Sparkles className="size-6 text-foreground/40 mb-1.5" />
              <p className="text-[13px] font-bold">API processing active</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Parsing AI structures client-side...</p>
            </div>
          ) : !humanizedText && !detectorResult ? (
            <div className="h-full min-h-[220px] rounded-[18px] border border-dashed border-border flex flex-col items-center justify-center text-center p-6 select-none text-muted-foreground">
              <Info className="size-6 text-foreground/20 mb-1.5" />
              <p className="text-[13px] font-bold">Result Panel</p>
              <p className="text-[11px] opacity-75 mt-0.5">Your processed results will be rendered here.</p>
            </div>
          ) : (
            <div className="space-y-4 h-full">
              {humanizedText && (
                <div className="rounded-[18px] border border-border bg-secondary/20 p-4 space-y-3 animate-fade-in flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground select-none">HUMANIZED RESULT</span>
                    <p className="text-[13px] leading-relaxed text-foreground/90 font-medium mt-2 max-h-52 overflow-y-auto pr-1">
                      {humanizedText}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(humanizedText);
                      alert("Copied to clipboard!");
                    }}
                    className="w-full mt-3 h-10 rounded-[12px] bg-secondary border border-border text-[12.5px] font-bold hover:bg-secondary/80 transition-all select-none"
                  >
                    Copy Text
                  </button>
                </div>
              )}

              {detectorResult && (
                <div className="rounded-[18px] border border-border bg-secondary/20 p-5 space-y-4 animate-fade-in select-none">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <Percent className="size-4" />
                    <span>PROBABILITY GRAPH</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[16px] border border-border bg-background p-3.5 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">AI Content</span>
                      <p className="text-[28px] font-black tracking-tight mt-1 text-red-500">{detectorResult.aiScore}%</p>
                    </div>
                    <div className="rounded-[16px] border border-border bg-background p-3.5 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Human content</span>
                      <p className="text-[28px] font-black tracking-tight mt-1 text-green-500">{detectorResult.humanScore}%</p>
                    </div>
                  </div>

                  <div className="rounded-[12px] border border-border bg-secondary/25 p-3 flex items-start gap-2">
                    <CheckCircle className="size-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-muted-foreground leading-normal">{detectorResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Universal Media Downloader Tool (Upgraded Media Card UI)
   ========================================================================== */
function DownloaderTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title?: string;
    thumbnail?: string;
    links: { label: string; url: string }[];
    type?: "video" | "audio" | "image";
    source?: string;
  } | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setResult(null);

    // Platform matcher
    let endpoint = "download/aio";
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      endpoint = "download/yt";
    } else if (lowerUrl.includes("tiktok.com")) {
      endpoint = "download/tiktok";
    } else if (lowerUrl.includes("instagram.com")) {
      endpoint = "instagram";
    } else if (lowerUrl.includes("facebook.com")) {
      endpoint = "facebook";
    } else if (lowerUrl.includes("spotify.com")) {
      endpoint = "spotifydl";
    }

    try {
      const res = await fetch(`https://apis.davidcyril.name.ng/${endpoint}?url=${encodeURIComponent(url.trim())}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();

      if (!data.success && !data.result) {
        throw new Error(data.message || "Failed to download");
      }

      const title = data.title || data.result?.title || data.result?.caption || "Media File";
      const thumb = data.thumbnail || data.result?.thumbnail || data.result?.cover || null;
      
      const linksList: { label: string; url: string }[] = [];
      const resData = data.result || {};

      if (endpoint === "download/tiktok") {
        if (resData.video) linksList.push({ label: "Download Video", url: resData.video });
        if (resData.music) linksList.push({ label: "Download Audio Track", url: resData.music });
      } else if (endpoint === "facebook") {
        if (resData.downloads?.hd?.url) linksList.push({ label: "Download HD Video", url: resData.downloads.hd.url });
        if (resData.downloads?.sd?.url) linksList.push({ label: "Download SD Video", url: resData.downloads.sd.url });
      } else {
        // Fallback for YouTube, Instagram, Spotify, etc.
        const singleUrl = 
          data.downloadUrl || 
          data.download_url || 
          resData.download_url || 
          resData.downloadUrl || 
          resData.url || 
          resData.link || 
          null;

        if (singleUrl) {
          linksList.push({ label: "Download Media", url: singleUrl });
        }
      }

      if (linksList.length === 0) throw new Error("No download URL found");

      setResult({
        title,
        thumbnail: thumb,
        links: linksList,
        type: endpoint === "spotifydl" ? "audio" : "video",
        source: endpoint.replace("download/", "")
      });
    } catch (err) {
      alert("Error: Failed to fetch download details. Please verify that your link is correct and public.");
    } finally {
      setLoading(false);
    }
  };

  // Badge styles
  const getBadgeStyle = (source: string) => {
    switch (source) {
      case "yt":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "tiktok":
        return "bg-neutral-900 text-white border-neutral-800 dark:bg-white/10 dark:text-white";
      case "instagram":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      case "facebook":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "spotifydl":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-foreground/10 text-foreground border-foreground/20";
    }
  };

  return (
    <div className="rounded-[24px] border border-border p-6 ios-glass ios-shadow animate-spring-scale space-y-6">
      <div className="space-y-2 select-none">
        <h4 className="text-[16px] font-bold">Universal Downloader</h4>
        <p className="text-[12px] text-muted-foreground">
          Download videos, images, or audio tracks from YouTube, TikTok, Instagram, Facebook, and Spotify.
        </p>
      </div>

      <form onSubmit={handleDownload} className="flex gap-2 select-none">
        <input
          type="url"
          required
          placeholder="Paste URL link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 bg-secondary/35 text-[14px] font-bold border border-border/30 rounded-[16px] px-4 py-3 outline-none focus:border-foreground/50 transition-all placeholder:font-medium"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 px-6 rounded-[16px] bg-foreground text-background font-bold text-[14px] active:scale-[0.98] transition-all flex items-center gap-1.5 select-none"
        >
          {loading ? "Resolving..." : "Resolve"}
        </button>
      </form>

      {/* Upgraded Media Result Card */}
      {result && (
        <div className="rounded-[20px] border border-border bg-secondary/10 p-5 flex flex-col md:flex-row gap-5 items-center relative overflow-hidden animate-fade-in">
          {/* Blurred thumbnail background effect */}
          {result.thumbnail && (
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-[0.06] pointer-events-none select-none scale-110"
              style={{ backgroundImage: `url(${result.thumbnail})` }}
            />
          )}

          {result.thumbnail ? (
            <img 
              src={result.thumbnail} 
              alt="Thumbnail" 
              className="size-24 rounded-[14px] object-cover bg-black border border-border select-none shadow-md z-10"
            />
          ) : (
            <div className="size-24 rounded-[14px] bg-secondary flex items-center justify-center border border-border select-none z-10">
              {result.type === "audio" ? <Music className="size-7" /> : <Video className="size-7" />}
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-2 z-10">
            <h5 className="text-[15px] font-black line-clamp-2 leading-snug">{result.title}</h5>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`text-[10px] font-black uppercase border px-2.5 py-0.5 rounded-full select-none ${getBadgeStyle(result.source || "")}`}>
                {result.source === "spotifydl" ? "Spotify" : result.source}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                {result.type} file
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto z-10">
            {result.links.map((linkItem, lIdx) => (
              <a
                key={lIdx}
                href={linkItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-full bg-foreground text-background font-black text-[12.5px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 select-none shadow-lg whitespace-nowrap"
              >
                <Download className="size-4" />
                <span>{linkItem.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
