import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  ExternalLink,
  MapPin,
  CalendarDays,
  Link2,
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  Download,
  BadgeCheck,
  Video,
  Play,
  Share2,
  FileText
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

/* ──────────────────── Types ──────────────────── */
interface XUser {
  screen_name: string;
  name: string;
  description: string;
  avatar_url: string;
  banner_url: string;
  followers: number;
  following: number;
  tweets: number;
  likes: number;
  media_count: number;
  location: string;
  joined: string;
  protected: boolean;
  website: string | null;
  url: string;
  verification: {
    verified: boolean;
    type: string;
  };
}

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

const fmtNum = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
};

const fmtDate = (raw: string): string => {
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
};

const getHiResAvatar = (url: string) =>
  url?.replace("_normal.", "_400x400.") ?? "";

function XViewerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<"profile" | "downloader">("profile");

  // Profile Lookup State
  const [userQuery, setUserQuery] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [profile, setProfile] = useState<XUser | null>(null);

  // Video Downloader State
  const [downloadQuery, setDownloadQuery] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<XDownloadResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // Profile lookup via local backend
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = userQuery.trim().replace(/^@/, "").replace(/https?:\/\/(x|twitter)\.com\//i, "").split("/")[0].split("?")[0];
    if (!clean) return;

    setUserLoading(true);
    setUserError(null);
    setProfile(null);

    try {
      const res = await fetch(`/api/x/user?username=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setProfile(data.user);
      } else {
        setUserError(data.error || "User not found or account is private.");
      }
    } catch {
      setUserError("Failed to connect to the lookup service.");
    } finally {
      setUserLoading(false);
    }
  };

  // Video downloader lookup via local backend
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
        setDownloadError(data.error || "Failed to process video link.");
      }
    } catch {
      setDownloadError("Connection to video processor failed.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* ── Header ── */}
      <header className="px-5 py-5 flex items-center justify-between max-w-2xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80">
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

        <button
          onClick={toggleTheme}
          className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </header>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        
        {/* iOS style Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-secondary/40 p-1 rounded-[18px] border border-border/25 select-none">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3.5 rounded-[14px] text-[13.5px] font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-4.5" />
            Profile Viewer
          </button>
          <button
            onClick={() => setActiveTab("downloader")}
            className={`py-3.5 rounded-[14px] text-[13.5px] font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "downloader" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Download className="size-4.5" />
            Video Downloader
          </button>
        </div>

        {/* Tab 1: Profile Viewer */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-slide-up">
            <form onSubmit={handleUserSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Enter @username or profile URL..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full h-[52px] bg-secondary/30 text-[14.5px] font-bold border border-border/40 rounded-[20px] pl-11 pr-24 outline-none focus:border-sky-500/50 focus:bg-secondary/10 transition-all placeholder:font-medium placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                disabled={userLoading || !userQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-[16px] bg-sky-500 text-white font-black text-[13px] flex items-center gap-1.5 hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all"
              >
                {userLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-3.5" />}
                <span>Go</span>
              </button>
            </form>

            {userError && (
              <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-5 flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-destructive">User not found</p>
                  <p className="text-[12px] text-destructive/80 mt-0.5 leading-relaxed">{userError}</p>
                </div>
              </div>
            )}

            {userLoading && (
              <div className="rounded-[24px] border border-border bg-secondary/5 p-12 flex flex-col items-center justify-center animate-pulse">
                <Loader2 className="size-8 text-sky-500 animate-spin mb-3" />
                <p className="text-[14.5px] font-bold">Querying Profile...</p>
              </div>
            )}

            {profile && <ProfileCard user={profile} />}

            {!profile && !userLoading && !userError && (
              <div className="rounded-[20px] border border-border/20 bg-secondary/10 p-5 space-y-3">
                <h3 className="text-[13.5px] font-black tracking-tight uppercase text-muted-foreground">Browse Profiles Anonymously</h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  View any public profile timeline, followers count, banner, joined date, location, and bio instantly. No tracing, completely untracked.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Video Downloader */}
        {activeTab === "downloader" && (
          <div className="space-y-6 animate-slide-up">
            <form onSubmit={handleDownloadSearch} className="relative">
              <Download className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Paste Twitter/X Tweet Link containing video..."
                value={downloadQuery}
                onChange={(e) => setDownloadQuery(e.target.value)}
                className="w-full h-[52px] bg-secondary/30 text-[14.5px] font-bold border border-border/40 rounded-[20px] pl-11 pr-24 outline-none focus:border-sky-500/50 focus:bg-secondary/10 transition-all placeholder:font-medium placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                disabled={downloadLoading || !downloadQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-[16px] bg-sky-500 text-white font-black text-[13px] flex items-center gap-1.5 hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all"
              >
                {downloadLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-3.5" />}
                <span>Fetch</span>
              </button>
            </form>

            {downloadError && (
              <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-5 flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-destructive">Download failed</p>
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

            {downloadResult && <DownloadResultCard result={downloadResult} />}

            {!downloadResult && !downloadLoading && !downloadError && (
              <div className="rounded-[20px] border border-border/20 bg-secondary/10 p-5 space-y-4">
                <h3 className="text-[13.5px] font-black tracking-tight uppercase text-muted-foreground">Twitter Video Downloader</h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  Paste the link of any tweet containing a video or GIF. Our cloud parser will fetch the media files in high quality (MP4) for offline downloads.
                </p>
                <div className="space-y-1 text-[11px] text-muted-foreground leading-normal">
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
    </main>
  );
}

/* ──────────────────── Profile Card Component ──────────────────── */
function ProfileCard({ user }: { user: XUser }) {
  return (
    <div className="rounded-[24px] border border-border overflow-hidden ios-glass ios-shadow">
      {/* Banner */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 overflow-hidden">
        {user.banner_url && (
          <img
            src={user.banner_url}
            alt=""
            className="w-full h-full object-cover animate-fade-in"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        <a
          href={user.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 h-8 px-3 rounded-full bg-background/60 backdrop-blur-md border border-border/30 text-[11px] font-bold flex items-center gap-1.5 hover:bg-background/85 transition-all active:scale-95"
        >
          <ExternalLink className="size-3" />
          Open X Profile
        </a>
      </div>

      {/* Info Body */}
      <div className="px-5 pb-6 -mt-12 relative z-10">
        <div className="size-[88px] rounded-full border-4 border-background overflow-hidden bg-secondary shadow-lg">
          <img
            src={getHiResAvatar(user.avatar_url)}
            alt={user.name}
            className="w-full h-full object-cover animate-fade-in"
            loading="lazy"
          />
        </div>

        <div className="space-y-0.5 mt-3 mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
              {user.name}
            </h2>
            {user.verification?.verified && (
              <BadgeCheck className="size-5 text-sky-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-[13.5px] text-muted-foreground font-bold">
            @{user.screen_name}
          </p>
        </div>

        {user.description && (
          <p className="text-[13.5px] leading-relaxed text-foreground/85 mb-4 whitespace-pre-line">
            {user.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground mb-5">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {user.location}
            </span>
          )}
          {user.joined && (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              Joined {fmtDate(user.joined)}
            </span>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-500 hover:underline"
            >
              <Link2 className="size-3.5" />
              {user.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Followers", value: user.followers, color: "text-sky-500" },
            { label: "Following", value: user.following, color: "text-emerald-500" },
            { label: "Posts", value: user.tweets, color: "text-purple-500" },
            { label: "Likes", value: user.likes, color: "text-pink-500" },
            { label: "Media", value: user.media_count, color: "text-amber-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[16px] border border-border/30 bg-secondary/15 p-2.5 text-center"
            >
              <p className={`text-[17px] font-black tracking-tight ${stat.color}`}>
                {fmtNum(stat.value)}
              </p>
              <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Downloader Result Card ──────────────────── */
function DownloadResultCard({ result }: { result: XDownloadResult }) {
  // Find highest resolution video
  const bestVideo = [...result.videos].sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];

  return (
    <div className="rounded-[24px] border border-border overflow-hidden ios-glass ios-shadow p-5 space-y-4">
      
      {/* Author Info */}
      <div className="flex items-center gap-3 border-b border-border/20 pb-3">
        <div className="size-11 rounded-full overflow-hidden bg-secondary border border-border/10">
          <img src={result.author.avatar_url} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-[13.5px] font-black leading-tight">{result.author.name}</h4>
          <p className="text-[11.5px] text-muted-foreground font-bold">@{result.author.screen_name}</p>
        </div>
      </div>

      {/* Tweet text */}
      <p className="text-[13px] leading-relaxed text-foreground/90 font-medium">
        {result.text}
      </p>

      {/* Video Preview Frame */}
      {bestVideo && (
        <div className="relative rounded-[16px] overflow-hidden border border-border/10 bg-black aspect-video max-h-72">
          {bestVideo.thumbnail_url ? (
            <img
              src={bestVideo.thumbnail_url}
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={bestVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="size-14 rounded-full bg-sky-500/90 text-white flex items-center justify-center hover:bg-sky-400 hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              <Play className="size-6 fill-current translate-x-0.5" />
            </a>
          </div>
          {bestVideo.duration > 0 && (
            <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded text-white select-none">
              {Math.floor(bestVideo.duration / 60)}:{(bestVideo.duration % 60).toFixed(0).padStart(2, "0")}
            </span>
          )}
        </div>
      )}

      {/* Video Resolutions / Download Links */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Available Qualities</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {result.videos.map((vid, idx) => (
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
  );
}
