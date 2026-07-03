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
  Play,
  Video,
  AlertCircle
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

interface XVideo {
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  duration: number;
}

interface XDownloadResult {
  text: string;
  author: {
    name: string;
    screen_name: string;
    avatar_url: string;
  };
  videos: XVideo[];
}

function XViewerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<"profile" | "downloader">("profile");

  // Search query for profile lookup
  const [userQuery, setUserQuery] = useState("");

  // Iframe states for Profile Tab
  const [iframeSrc, setIframeSrc] = useState("");
  const [iframeLoading, setIframeLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"home" | "browsing">("home");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Native Video Downloader states
  const [downloadQuery, setDownloadQuery] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<XDownloadResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    // Support query param direct load e.g., /x?user=elonmusk
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

  const loadXProfile = (username: string) => {
    const clean = username.trim().replace(/^@/, "").replace(/https?:\/\/(x|twitter)\.com\//i, "").split("/")[0].split("?")[0];
    if (!clean) return;
    setIframeLoading(true);
    setIframeSrc(`${TWV_BASE}/?user=${encodeURIComponent(clean)}`);
    setViewMode("browsing");
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadXProfile(userQuery);
  };

  const handleDownloadSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = downloadQuery.trim();
    if (!cleanUrl) return;

    setDownloadLoading(true);
    setDownloadError(null);
    setDownloadResult(null);

    try {
      const res = await fetch(`/api/x/download?url=${encodeURIComponent(cleanUrl)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setDownloadResult(data);
      } else {
        setDownloadError(data.error || "Failed to process video link. Make sure the tweet is public and contains a video.");
      }
    } catch {
      setDownloadError("Connection to video processor failed.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const goHome = () => {
    setViewMode("home");
    setIframeSrc("");
    setUserQuery("");
  };

  const refreshFrame = () => {
    if (iframeRef.current && iframeSrc) {
      setIframeLoading(true);
      iframeRef.current.src = iframeSrc;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col overflow-hidden h-screen">
      {/* ── Header ── */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-45 bg-background/80 flex-shrink-0 select-none">
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
                // Stop iframe browsing mode and load native downloader tab view
                setViewMode("home");
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
          {viewMode === "browsing" && activeTab === "profile" && (
            <>
              <button
                onClick={refreshFrame}
                className="size-9 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
                title="Refresh"
              >
                <RefreshCw className="size-4" />
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

            {/* Native Video Downloader tab view (No Iframe!) */}
            {activeTab === "downloader" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-[24px] font-black tracking-tight">Video Downloader</h2>
                  <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
                    Download videos and GIFs from X/Twitter in high-quality MP4.
                  </p>
                </div>

                <form onSubmit={handleDownloadSearch} className="relative">
                  <Download className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Paste Twitter/X Tweet Link containing video..."
                    value={downloadQuery}
                    onChange={(e) => setDownloadQuery(e.target.value)}
                    className="w-full h-[52px] bg-background border border-border/40 rounded-[20px] pl-11 pr-24 outline-none focus:border-sky-500/50 transition-all font-bold text-[14px]"
                  />
                  <button
                    type="submit"
                    disabled={downloadLoading || !downloadQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-[16px] bg-sky-500 text-white font-black text-[13px] hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all"
                  >
                    {downloadLoading ? <Loader2 className="size-4 animate-spin" /> : <span>Fetch</span>}
                  </button>
                </form>

                {downloadError && (
                  <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-5 flex items-start gap-3">
                    <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-bold text-destructive">Extraction Failed</p>
                      <p className="text-[12px] text-destructive/80 mt-0.5 leading-relaxed">{downloadError}</p>
                    </div>
                  </div>
                )}

                {downloadLoading && (
                  <div className="rounded-[24px] border border-border bg-secondary/5 p-12 flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="size-8 text-sky-500 animate-spin mb-3" />
                    <p className="text-[14.5px] font-bold">Extracting media streams...</p>
                  </div>
                )}

                {downloadResult && (
                  <div className="rounded-[24px] border border-border overflow-hidden ios-glass ios-shadow p-5 space-y-4">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 border-b border-border/20 pb-3">
                      <div className="size-11 rounded-full overflow-hidden bg-secondary border border-border/10">
                        <img src={downloadResult.author.avatar_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-black leading-tight">{downloadResult.author.name}</h4>
                        <p className="text-[11.5px] text-muted-foreground font-bold">@{downloadResult.author.screen_name}</p>
                      </div>
                    </div>

                    {/* Tweet text */}
                    <p className="text-[13px] leading-relaxed text-foreground/90 font-medium">
                      {downloadResult.text}
                    </p>

                    {/* Resolutions list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Download Streams</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {downloadResult.videos.map((vid, idx) => (
                          <a
                            key={idx}
                            href={vid.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`x-video-${vid.width}x${vid.height}.mp4`}
                            className="h-11 rounded-[14px] bg-secondary/40 border border-border/30 hover:bg-sky-500/10 hover:border-sky-500/30 text-[12.5px] font-bold transition-all active:scale-[0.98] flex items-center justify-between px-4"
                          >
                            <div className="flex items-center gap-2">
                              <Video className="size-4 text-sky-500" />
                              <span>{vid.width} x {vid.height}</span>
                            </div>
                            <span className="text-[10px] text-sky-500 font-black uppercase">Download</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!downloadResult && !downloadLoading && !downloadError && (
                  <div className="rounded-[20px] border border-border/20 bg-secondary/10 p-5 space-y-4">
                    <h3 className="text-[13.5px] font-black tracking-tight uppercase text-muted-foreground">Twitter Video Downloader</h3>
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                      Paste the link of any tweet containing a video or GIF. Our cloud parser will fetch the media files in high quality (MP4) for offline downloads.
                    </p>
                    <div className="space-y-1 text-[11.5px] text-muted-foreground leading-normal">
                      <p className="font-bold text-foreground/80">How to get a tweet link:</p>
                      <p>1. Open Twitter/X app or website.</p>
                      <p>2. Click the share button underneath the tweet containing the video.</p>
                      <p>3. Choose "Copy link" and paste it here.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ===== BROWSING WORKSPACE (Iframe Masking Layout for Profile Tab) ===== */
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
                  top: "-80px", // Crop top header (logo, search bar, website name) completely
                  left: "0",
                  height: "calc(100% + 80px)", // Compensate height for top crop
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
