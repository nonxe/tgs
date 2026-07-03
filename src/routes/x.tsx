import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  ExternalLink,
  ArrowLeft,
  Loader2,
  RefreshCw,
  TrendingUp,
  Download,
  Users,
  Compass,
  FileText,
  Globe
} from "lucide-react";

export const Route = createFileRoute("/x")({
  head: () => ({
    meta: [
      { title: "X Viewer — Anonymous Twitter/X Browser" },
      {
        name: "description",
        content:
          "Browse public X/Twitter profiles, tweets, and media anonymously using twitterwebviewer format.",
      },
    ],
  }),
  component: XViewerPage,
});

const TWV_BASE = "https://twitterwebviewer.com";

function XViewerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [query, setQuery] = useState("");
  const [iframeSrc, setIframeSrc] = useState(TWV_BASE);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"home" | "browsing">("home");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    // Support query param direct load e.g., /x?user=elonmusk or /x?q=text
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      const searchParam = params.get("q");
      if (userParam) {
        setQuery(userParam);
        loadIframe(`${TWV_BASE}/?user=${encodeURIComponent(userParam)}`);
      } else if (searchParam) {
        setQuery(searchParam);
        loadIframe(`${TWV_BASE}/search?q=${encodeURIComponent(searchParam)}`);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const loadIframe = (url: string) => {
    setIframeLoading(true);
    setIframeSrc(url);
    setViewMode("browsing");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Check if user is searching for a username (starts with @ or has no spaces/hashtags)
    if (q.startsWith("@") || (!q.includes(" ") && !q.startsWith("#") && !q.includes("/"))) {
      const username = q.replace(/^@/, "");
      loadIframe(`${TWV_BASE}/?user=${encodeURIComponent(username)}`);
    } else if (q.includes("twitter.com/") || q.includes("x.com/")) {
      // If it's a full URL, extract the username or path
      try {
        const urlObj = new URL(q.startsWith("http") ? q : `https://${q}`);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length === 1) {
          loadIframe(`${TWV_BASE}/?user=${encodeURIComponent(pathParts[0])}`);
        } else {
          // Fallback to direct search if it's a complex URL
          loadIframe(`${TWV_BASE}/search?q=${encodeURIComponent(q)}`);
        }
      } catch {
        loadIframe(`${TWV_BASE}/search?q=${encodeURIComponent(q)}`);
      }
    } else {
      loadIframe(`${TWV_BASE}/search?q=${encodeURIComponent(q)}`);
    }
  };

  const goHome = () => {
    setViewMode("home");
    setIframeSrc(TWV_BASE);
    setQuery("");
  };

  const refreshFrame = () => {
    if (iframeRef.current) {
      setIframeLoading(true);
      iframeRef.current.src = iframeSrc;
    }
  };

  const openExternal = () => {
    window.open(iframeSrc, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col">
      {/* iOS Style Browser Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80 flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-4.5 text-sky-500 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-black tracking-tight leading-tight">CLOUD X</h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Anonymous Viewer
              </p>
            </div>
          </div>
        </div>

        {/* Address/Search bar inside Header if browsing */}
        {viewMode === "browsing" && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md w-96 relative mx-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user or tweet..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 bg-secondary/50 text-[13px] font-bold border border-border/30 rounded-full pl-9 pr-4 outline-none focus:border-sky-500/50 transition-all"
            />
          </form>
        )}

        <div className="flex items-center gap-2">
          {viewMode === "browsing" && (
            <>
              <button
                onClick={refreshFrame}
                className="size-9 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
                title="Refresh"
              >
                <RefreshCw className="size-4" />
              </button>
              <button
                onClick={openExternal}
                className="size-9 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
                title="Open in new tab"
              >
                <ExternalLink className="size-4" />
              </button>
              <button
                onClick={goHome}
                className="h-9 px-4 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 text-[12px] font-bold gap-1"
              >
                Home
              </button>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          >
            {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col w-full min-h-0 bg-secondary/5">
        {viewMode === "home" ? (
          /* ===== HOME VIEW: Beautiful iOS style portal copy of twitterwebviewer.com ===== */
          <div className="max-w-2xl mx-auto px-5 py-12 w-full space-y-8 animate-slide-up flex-1 flex flex-col justify-center">
            <div className="text-center space-y-3">
              <div className="size-16 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto shadow-sm">
                <svg viewBox="0 0 24 24" className="size-8 text-sky-500 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h2 className="text-[28px] font-black tracking-tight leading-none">CLOUD X</h2>
              <p className="text-[13px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Browse public profiles, search keywords, and download media anonymously. No login required.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Enter @username, keyword, or tweet URL..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-[56px] bg-background border border-border/40 rounded-[22px] pl-12 pr-24 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/10 transition-all font-bold text-[14.5px] placeholder:font-medium placeholder:text-muted-foreground/60 shadow-lg shadow-black/5 dark:shadow-none"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-[42px] px-6 rounded-[16px] bg-sky-500 text-white font-black text-[13px] flex items-center gap-1.5 hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all shadow-md shadow-sky-500/15"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => loadIframe(`${TWV_BASE}/trending`)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] border border-border/30 bg-background/50 hover:bg-secondary/40 transition-all active:scale-95"
              >
                <TrendingUp className="size-5 text-orange-500" />
                <span className="text-[11.5px] font-black">Trending</span>
              </button>

              <button
                onClick={() => loadIframe(`${TWV_BASE}/download`)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] border border-border/30 bg-background/50 hover:bg-secondary/40 transition-all active:scale-95"
              >
                <Download className="size-5 text-emerald-500" />
                <span className="text-[11.5px] font-black">Downloader</span>
              </button>

              <button
                onClick={() => {
                  setQuery("");
                  loadIframe(TWV_BASE);
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] border border-border/30 bg-background/50 hover:bg-secondary/40 transition-all active:scale-95"
              >
                <Compass className="size-5 text-sky-500" />
                <span className="text-[11.5px] font-black">Explore</span>
              </button>
            </div>

            {/* Suggested Searches */}
            <div className="space-y-2.5 text-center">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Suggested Profiles</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {["elonmusk", "NASA", "MKBHD", "Apple", "SpaceX", "Google"].map((username) => (
                  <button
                    key={username}
                    onClick={() => {
                      setQuery(username);
                      loadIframe(`${TWV_BASE}/?user=${encodeURIComponent(username)}`);
                    }}
                    className="px-3.5 py-2 rounded-full bg-secondary/35 border border-border/20 hover:bg-secondary/60 transition-all text-[12px] font-bold text-muted-foreground hover:text-foreground active:scale-95"
                  >
                    @{username}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ===== BROWSING VIEW: Rich Iframe Display ===== */
          <div className="flex-1 w-full h-full relative">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader2 className="size-8 text-sky-500 animate-spin mb-2" />
                <span className="text-[13px] font-bold text-foreground">Loading content anonymously...</span>
                <p className="text-[10.5px] text-muted-foreground mt-1">Connecting to twitterwebviewer</p>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-0 bg-white dark:bg-[#15202b]"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
              onLoad={() => setIframeLoading(false)}
              onError={() => setIframeLoading(false)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
