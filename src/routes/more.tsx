import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { 
  Sun, 
  Moon, 
  Sparkles,
  MessageSquare,
  PenTool,
  Download,
  Wrench,
  Send,
  Trash2,
  Languages,
  CreditCard,
  User,
  Bot,
  Percent,
  CheckCircle,
  HelpCircle,
  Video,
  Music
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

type TabType = "chat" | "writer" | "downloader" | "utils";
type AIModel = "deepseek-v3" | "deepseek-r1";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
            External API Tools.
            <br />
            <span className="opacity-40">AI Chat, media and utilities.</span>
          </h2>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-md">
            A curated suite of high-utility tools powered by public REST APIs.
          </p>
        </div>

        {/* Responsive Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start w-full">
          {/* Left Column: Tab Selector */}
          <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full select-none">
            {[
              { id: "chat", label: "AI Chatbot", icon: MessageSquare },
              { id: "writer", label: "AI Writer Tools", icon: PenTool },
              { id: "downloader", label: "Media Downloader", icon: Download },
              { id: "utils", label: "Other Utilities", icon: Wrench }
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
            {activeTab === "utils" && <UtilsTool />}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   AI Chatbot Tool (Deepseek V3 / Deepseek R1)
   ========================================================================== */
function ChatTool() {
  const [model, setModel] = useState<AIModel>("deepseek-v3");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      
      const reply = data.response || data.reply || data.result || "No response received.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Error: Failed to connect to the AI model. Please try again or switch model." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="rounded-[24px] border border-border p-5 ios-glass ios-shadow animate-spring-scale flex flex-col h-[550px] relative overflow-hidden">
      {/* Model Control Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/20 select-none flex-shrink-0">
        <div className="flex gap-1.5 bg-secondary/40 p-1 rounded-[14px] border border-border/25">
          <button
            onClick={() => setModel("deepseek-v3")}
            className={`px-3 py-1.5 rounded-[10px] text-[12px] font-black transition-all uppercase ${
              model === "deepseek-v3" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            DeepSeek V3
          </button>
          <button
            onClick={() => setModel("deepseek-r1")}
            className={`px-3 py-1.5 rounded-[10px] text-[12px] font-black transition-all uppercase ${
              model === "deepseek-r1" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            DeepSeek R1
          </button>
        </div>

        <button 
          onClick={clearChat}
          className="size-9 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 select-none">
            <Sparkles className="size-8 text-foreground opacity-30 mb-2 animate-pulse" />
            <p className="text-[14px] font-bold">Start a conversation</p>
            <p className="text-[12px] opacity-75 mt-0.5">Send a message to {model === "deepseek-r1" ? "Deepseek R1 (Reasoning)" : "Deepseek V3 (General)"}.</p>
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
                  ? "bg-secondary/45 text-foreground border border-border/20" 
                  : "bg-secondary/20 text-foreground/90 border border-border/10"
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
          placeholder={`Message ${model === "deepseek-r1" ? "DeepSeek R1" : "DeepSeek V3"}...`}
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
   AI Writer & Assistant Tools (Humanizer & Detector)
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
        
        // Strip HTML tags from humanized text
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

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              toolMode === "humanizer"
                ? "Paste AI generated text here to make it sound human..."
                : "Paste your text here (minimum 100 words required) to detect AI probability..."
            }
            rows={6}
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

      {/* Results Rendering */}
      {humanizedText && (
        <div className="rounded-[18px] border border-border bg-secondary/20 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between select-none">
            <span className="text-[12px] font-bold text-muted-foreground">HUMANIZED TEXT</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(humanizedText);
                alert("Copied to clipboard!");
              }}
              className="text-[12px] font-bold hover:underline"
            >
              Copy
            </button>
          </div>
          <p className="text-[14px] leading-relaxed text-foreground/90 font-medium" style={{ whiteSpace: "pre-wrap" }}>
            {humanizedText}
          </p>
        </div>
      )}

      {detectorResult && (
        <div className="rounded-[18px] border border-border bg-secondary/20 p-5 space-y-4 animate-fade-in select-none">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
            <Percent className="size-4" />
            <span>PROBABILITY ANALYSIS</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[16px] border border-border bg-background p-4 text-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">AI Score</span>
              <p className="text-[32px] font-black tracking-tight mt-1 text-red-500">{detectorResult.aiScore}%</p>
            </div>
            <div className="rounded-[16px] border border-border bg-background p-4 text-center">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Human Score</span>
              <p className="text-[32px] font-black tracking-tight mt-1 text-green-500">{detectorResult.humanScore}%</p>
            </div>
          </div>

          <div className="rounded-[14px] border border-border bg-secondary/25 p-3 flex items-center gap-2">
            <CheckCircle className="size-4.5 text-foreground opacity-60" />
            <p className="text-[12px] font-bold text-muted-foreground">{detectorResult.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Universal Media Downloader Tool
   ========================================================================== */
function DownloaderTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title?: string;
    thumbnail?: string;
    downloadUrl?: string;
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

      // Unified parsing logic
      const title = data.title || data.result?.title || data.result?.caption || "Media File";
      const thumb = data.thumbnail || data.result?.thumbnail || data.result?.cover || null;
      
      let dlUrl = data.downloadUrl || data.result?.downloadUrl || data.result?.url || null;
      if (Array.isArray(data.result?.urls) && data.result.urls.length > 0) {
        dlUrl = data.result.urls[0].url || data.result.urls[0];
      } else if (data.result?.hd) {
        dlUrl = data.result.hd;
      } else if (data.result?.sd) {
        dlUrl = data.result.sd;
      }

      if (!dlUrl) throw new Error("No download URL found");

      setResult({
        title,
        thumbnail: thumb,
        downloadUrl: dlUrl,
        type: endpoint === "spotifydl" ? "audio" : "video",
        source: endpoint.replace("download/", "")
      });
    } catch (err) {
      alert("Error: Failed to fetch download details. Please verify your link.");
    } finally {
      setLoading(false);
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

      {/* Result Box */}
      {result && (
        <div className="rounded-[20px] border border-border bg-secondary/20 p-4 flex flex-col md:flex-row gap-4 items-center animate-fade-in">
          {result.thumbnail ? (
            <img 
              src={result.thumbnail} 
              alt="Thumbnail" 
              className="size-20 rounded-[12px] object-cover bg-black border border-border select-none"
            />
          ) : (
            <div className="size-20 rounded-[12px] bg-secondary flex items-center justify-center border border-border select-none">
              {result.type === "audio" ? <Music className="size-6" /> : <Video className="size-6" />}
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-1">
            <h5 className="text-[14px] font-bold line-clamp-2 pr-1">{result.title}</h5>
            <span className="inline-block text-[11px] font-black uppercase bg-foreground/10 px-2 py-0.5 rounded-full select-none">
              {result.source}
            </span>
          </div>

          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto h-11 px-5 rounded-full bg-foreground text-background font-bold text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 select-none"
          >
            <Download className="size-4" />
            <span>Download Media</span>
          </a>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Helper Utilities Tool (Translate / CC Gen)
   ========================================================================== */
function UtilsTool() {
  const [mode, setMode] = useState<"translate" | "ccgen">("translate");

  // Translate states
  const [transText, setTransText] = useState("");
  const [lang, setLang] = useState("hi"); // Hindi default
  const [transLoading, setTransLoading] = useState(false);
  const [transResult, setTransResult] = useState<string | null>(null);

  // CC Gen states
  const [bin, setBin] = useState("400011");
  const [ccLoading, setCcLoading] = useState(false);
  const [ccResults, setCcResults] = useState<string[]>([]);

  // Lang options
  const langOptions = [
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" }
  ];

  // Card BIN templates
  const binsList = [
    { name: "Visa (400011)", bin: "400011" },
    { name: "Mastercard (510510)", bin: "510510" },
    { name: "Amex (371244)", bin: "371244" },
    { name: "Discover (601100)", bin: "601100" }
  ];

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transText.trim() || transLoading) return;

    setTransLoading(true);
    setTransResult(null);

    try {
      const res = await fetch(`https://apis.davidcyril.name.ng/tools/translate?text=${encodeURIComponent(transText.trim())}&lang=${lang}`);
      if (!res.ok) throw new Error("Translate failed");
      const data = await res.json();
      
      const result = data.translated || data.result || "Translation error.";
      setTransResult(result);
    } catch (err) {
      alert("Error: Translation request failed.");
    } finally {
      setTransLoading(false);
    }
  };

  const handleCCGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bin.trim() || ccLoading) return;

    setCcLoading(true);
    setCcResults([]);

    try {
      const res = await fetch(`https://apis.davidcyril.name.ng/tools/ccgen?bin=${bin.trim()}`);
      if (!res.ok) throw new Error("CC Gen failed");
      const data = await res.json();

      if (!data.success && !data.result) {
        throw new Error(data.message || "Failed to generate");
      }

      // Parse CC cards (DavidCyril CCGen API usually returns array of cards or raw list string)
      const list = data.cards || data.result || [];
      if (Array.isArray(list)) {
        setCcResults(list.map(c => `${c.number} | ${c.expiry} | ${c.cvv}`));
      } else if (typeof list === "string") {
        setCcResults(list.split("\n").filter(Boolean));
      } else {
        setCcResults(["No cards generated. Please verify BIN."]);
      }
    } catch (err) {
      alert("Error: Failed to generate cards. Try a different BIN (e.g. 400011).");
    } finally {
      setCcLoading(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-border p-6 ios-glass ios-shadow animate-spring-scale space-y-6">
      {/* Switch modes */}
      <div className="grid grid-cols-2 gap-1 bg-secondary/40 p-1 rounded-[16px] border border-border/25 select-none">
        <button
          onClick={() => setMode("translate")}
          className={`py-3 rounded-[12px] text-[13.5px] font-bold transition-all ${
            mode === "translate" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Google Translate
        </button>
        <button
          onClick={() => setMode("ccgen")}
          className={`py-3 rounded-[12px] text-[13.5px] font-bold transition-all ${
            mode === "ccgen" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          CC Profile Generator
        </button>
      </div>

      {mode === "translate" ? (
        <div className="space-y-5">
          <form onSubmit={handleTranslate} className="space-y-4">
            <div className="flex gap-2 select-none">
              <textarea
                placeholder="Translate text..."
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
                rows={4}
                className="flex-1 bg-secondary/35 text-[14px] font-semibold border border-border/30 rounded-[18px] px-4 py-3 outline-none focus:border-foreground/50 transition-all resize-none placeholder:font-medium"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-center justify-between select-none">
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <Languages className="size-5 text-muted-foreground" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-secondary/45 border border-border rounded-[12px] px-3 py-2 text-[13px] font-bold outline-none cursor-pointer"
                >
                  {langOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={transLoading || !transText.trim()}
                className="w-full md:w-auto h-11 px-6 rounded-full bg-foreground text-background font-bold text-[13.5px] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                {transLoading ? "Translating..." : "Translate"}
              </button>
            </div>
          </form>

          {transResult && (
            <div className="rounded-[18px] border border-border bg-secondary/25 p-4 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground select-none">TRANSLATION RESULT</span>
              <p className="text-[14px] leading-relaxed font-bold">{transResult}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <form onSubmit={handleCCGen} className="space-y-4 select-none">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit BIN (e.g. 400011)"
                value={bin}
                onChange={(e) => setBin(e.target.value)}
                maxLength={6}
                className="flex-1 bg-secondary/35 text-[14px] font-bold border border-border/30 rounded-[16px] px-4 py-3 outline-none focus:border-foreground/50 transition-all"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {binsList.map((tpl) => (
                  <button
                    key={tpl.bin}
                    type="button"
                    onClick={() => setBin(tpl.bin)}
                    className="px-3 py-1.5 rounded-[10px] bg-secondary border border-border text-[11px] font-bold hover:bg-secondary/85 transition-all"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={ccLoading || !bin.trim()}
                className="w-full md:w-auto h-11 px-6 rounded-full bg-foreground text-background font-bold text-[13.5px] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                {ccLoading ? "Generating..." : "Generate Profiles"}
              </button>
            </div>
          </form>

          {ccResults.length > 0 && (
            <div className="rounded-[18px] border border-border bg-secondary/25 p-4 space-y-3">
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                  <CreditCard className="size-4" />
                  <span>GENERATED CARD NUMBERS | EXPIRY | CVV</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ccResults.join("\n"));
                    alert("Copied all profiles!");
                  }}
                  className="text-[11px] font-bold hover:underline"
                >
                  Copy All
                </button>
              </div>
              <div className="font-mono text-[12.5px] font-semibold space-y-1 max-h-40 overflow-y-auto pr-1">
                {ccResults.map((card, idx) => (
                  <div key={idx} className="p-2 border-b border-border/10 last:border-b-0 hover:bg-secondary/15 transition-all">
                    {card}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
