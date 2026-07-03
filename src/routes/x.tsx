import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Users,
  Download,
  ExternalLink
} from "lucide-react";

export const Route = createFileRoute("/x")({
  head: () => ({
    meta: [
      { title: "X Space — Anonymous X/Twitter Utilities" },
      {
        name: "description",
        content:
          "Browse public X/Twitter profiles and download videos anonymously. Fully secure, no login required.",
      },
    ],
  }),
  component: XViewerPage,
});

const TWV_BASE = "https://twitterwebviewer.com";

function XViewerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<"profile" | "downloader">("profile");

  // Search queries
  const [userQuery, setUserQuery] = useState("");
  const [downloadQuery, setDownloadQuery] = useState("");

  // Iframe states
  const [iframeSrc, setIframeSrc] = useState("");
  const [iframeLoading, setIframeLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"home" | "browsing">("home");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    // Support direct loading via query param e.g., /x?user=elonmusk
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      if (userParam) {
        setUserQuery(userParam);
        loadXProfile(userParam);
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

  const loadXProfile = (username: string) => {
    const clean = username.trim().replace(/^@/, "").replace(/https?:\/\/(x|twitter)\.com\//i, "").split("/")[0].split("?")[0];
    if (!clean) return;
    loadIframe(`${TWV_BASE}/?user=${encodeURIComponent(clean)}`);
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadXProfile(userQuery);
  };

  const handleDownloadSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For downloader, we load the downloader page and let users paste it there, or load it with query
    loadIframe(`${TWV_BASE}/twitter-video-downloader`);
  };

  const goHome = () => {
    setViewMode("home");
    setIframeSrc("");
    setUserQuery("");
    setDownloadQuery("");
  };

  const refreshFrame = () => {
    if (iframeRef.current && iframeSrc) {
      setIframeLoading(true);
      iframeRef.current.src = iframeSrc;
    }
  };

  const openExternal = () => {
    if (iframeSrc) {
      window.open(iframeSrc, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col overflow-hidden h-screen">
      {/* ── Header ── */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80 flex-shrink-0 select-none">
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
              <h1 className="text-[16px] font-black tracking-tight leading-tight">X SPACE</h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Anonymous Cloud Utility
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher inside header when browsing */}
        {viewMode === "browsing" && (
          <div className="flex bg-secondary/50 p-0.5 rounded-[12px] border border-border/20 select-none text-[12px] font-bold">
            <button
              onClick={() => {
                setActiveTab("profile");
                if (userQuery) loadXProfile(userQuery);
              }}
              className={`px-3 py-1.5 rounded-[10px] transition-all ${
                activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => {
                setActiveTab("downloader");
                loadIframe(`${TWV_BASE}/twitter-video-downloader`);
              }}
              className={`px-3 py-1.5 rounded-[10px] transition-all ${
                activeTab === "downloader" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Downloader
            </button>
          </div>
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
                className="h-9 px-4 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 text-[12px] font-bold"
              >
                Back
              </button>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>

      {/* ── Content Workspace ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-secondary/5 relative">
        {viewMode === "home" ? (
          /* ===== HOME PORTAL VIEW ===== */
          <div className="max-w-2xl mx-auto px-5 py-12 w-full space-y-6 animate-slide-up flex-1 flex flex-col justify-center overflow-y-auto">
            {/* iOS style Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-secondary/40 p-1 rounded-[18px] border border-border/25 select-none">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-3 rounded-[14px] text-[13px] font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="size-4" />
                Profile Viewer
              </button>
              <button
                onClick={() => setActiveTab("downloader")}
                className={`py-3 rounded-[14px] text-[13px] font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "downloader" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Download className="size-4" />
                Video Downloader
              </button>
            </div>

            {/* Profile Lookup Input */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-[24px] font-black tracking-tight">Browse Profiles</h2>
                  <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
                    View public timelines, tweets, replies, and photos anonymously.
                  </p>
                </div>

                <form onSubmit={handleUserSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter @username or profile URL..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="w-full h-[52px] bg-background border border-border/40 rounded-[20px] pl-11 pr-24 outline-none focus:border-sky-500/50 transition-all font-bold text-[14px]"
                  />
                  <button
                    type="submit"
                    disabled={!userQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-[16px] bg-sky-500 text-white font-black text-[13px] hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all"
                  >
                    Search
                  </button>
                </form>

                {/* Popular Shortcuts */}
                <div className="space-y-2 text-center">
                  <span className="text-[9.5px] font-black uppercase text-muted-foreground tracking-wider">Suggested Accounts</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["elonmusk", "NASA", "MKBHD", "Apple", "SpaceX", "Google"].map((username) => (
                      <button
                        key={username}
                        onClick={() => {
                          setUserQuery(username);
                          loadXProfile(username);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-secondary/40 border border-border/20 hover:bg-secondary/70 transition-all text-[11.5px] font-bold text-muted-foreground hover:text-foreground"
                      >
                        @{username}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Video Downloader Intro / Action */}
            {activeTab === "downloader" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-[24px] font-black tracking-tight">Video Downloader</h2>
                  <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
                    Download videos and GIFs from X/Twitter in high-quality MP4.
                  </p>
                </div>

                <button
                  onClick={() => loadIframe(`${TWV_BASE}/twitter-video-downloader`)}
                  className="w-full h-14 rounded-[20px] bg-sky-500 text-white font-black text-[14.5px] flex items-center justify-center gap-2 hover:bg-sky-400 active:scale-98 transition-all shadow-lg shadow-sky-500/15"
                >
                  <Download className="size-5" />
                  Launch Video Downloader
                </button>

                <div className="rounded-[16px] border border-border/20 bg-secondary/10 p-4 space-y-2 text-[11.5px] text-muted-foreground leading-normal">
                  <p className="font-bold text-foreground/80">How to download videos:</p>
                  <p>1. Click the button above to launch the downloader page.</p>
                  <p>2. Paste your tweet video link into the box inside the downloader.</p>
                  <p>3. Tap Fetch to download the video file directly to your device.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== BROWSING / VIEWING WORKSPACE (Iframe Masking Layout) ===== */
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
                <Loader2 className="size-8 text-sky-500 animate-spin mb-2" />
                <span className="text-[13px] font-bold text-foreground">Loading content anonymously...</span>
                <p className="text-[10.5px] text-muted-foreground">Connecting securely via local browser session</p>
              </div>
            )}

            {/* Frame Cropper Wrapper to mask the outer website header/footer */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                className="absolute w-full border-0 bg-white dark:bg-[#15202b]"
                style={{
                  top: "-70px", // Crop top header
                  left: "0",
                  height: "calc(100% + 70px)", // Compensate height for top crop
                  width: "100%",
                }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="lazy"
                onLoad={() => setIframeLoading(false)}
                onError={() => setIframeLoading(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
