import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  ArrowLeft,
  Loader2,
  Users,
  AlertCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Instagram,
  Grid3X3,
  Heart,
  Image,
} from "lucide-react";

export const Route = createFileRoute("/instagram")({
  head: () => ({
    meta: [
      { title: "IG Space — Anonymous Instagram Profile Viewer" },
      {
        name: "description",
        content:
          "Browse public Instagram profiles, view photos, reels, stories and highlights anonymously. Fully secure, no login required.",
      },
    ],
  }),
  component: InstagramViewerPage,
});

interface IGUserProfile {
  name: string;
  username: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
}

function InstagramViewerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Search queries
  const [userQuery, setUserQuery] = useState("");

  // Profile state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<IGUserProfile | null>(null);

  // Timeline states
  const [iframeSrc, setIframeSrc] = useState("");
  const [iframeLoading, setIframeLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"home" | "browsing">("home");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    // Support query param direct load e.g., /instagram?user=cristiano
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      if (userParam) {
        setUserQuery(userParam);
        loadIGProfile(userParam);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const loadIGProfile = async (username: string) => {
    const clean = username
      .trim()
      .replace(/^@/, "")
      .replace(/https?:\/\/(www\.)?instagram\.com\//i, "")
      .split("/")[0]
      .split("?")[0];
    if (!clean) return;

    setProfileLoading(true);
    setIframeLoading(true);
    setProfileError(null);
    setProfileData(null);
    setViewMode("browsing");

    // 1. Fetch user metadata from our backend API
    try {
      const res = await fetch(`/api/ig/user?username=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileData(data.user);
      } else {
        setProfileError(
          data.error || "User profile not found. Make sure the username is correct."
        );
      }
    } catch {
      setProfileError("Failed to fetch profile metadata.");
    } finally {
      setProfileLoading(false);
    }

    // 2. Load gramsnap.com profile viewer in iframe with top/bottom cropping
    setIframeSrc(
      `https://gramsnap.com/en/instagram-profile-viewer/?url=${encodeURIComponent("https://www.instagram.com/" + clean + "/")}`
    );
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadIGProfile(userQuery);
  };

  const goHome = () => {
    setViewMode("home");
    setIframeSrc("");
    setProfileData(null);
    setUserQuery("");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col overflow-hidden h-screen relative">
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
            <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="size-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-black tracking-tight leading-tight">
                IG SPACE
              </h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Anonymous Profile Viewer
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "browsing" && (
            <button
              onClick={goHome}
              className="h-9 px-4 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 text-[12px] font-bold"
            >
              Back
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </div>
      </header>

      {/* ── Content Workspace ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-secondary/5 relative">
        {viewMode === "home" ? (
          /* ===== HOME PORTAL VIEW ===== */
          <div className="max-w-2xl mx-auto px-5 py-12 w-full space-y-6 animate-slide-up flex-1 flex flex-col justify-center overflow-y-auto">
            {/* Profile Lookup Input */}
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="size-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
                  <Instagram className="size-8 text-white" />
                </div>
                <h2 className="text-[26px] font-black tracking-tight">
                  Browse Instagram Profiles
                </h2>
                <p className="text-[12.5px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  View photos, reels, stories, and highlights from any public
                  Instagram profile — completely anonymous.
                </p>
              </div>

              <form onSubmit={handleUserSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter @username or Instagram profile URL..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full h-[52px] bg-background border border-border/40 rounded-[20px] pl-11 pr-24 outline-none focus:border-pink-500/50 transition-all font-bold text-[14px]"
                />
                <button
                  type="submit"
                  disabled={!userQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-[16px] bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[13px] hover:from-pink-400 hover:to-purple-500 active:scale-95 disabled:opacity-40 transition-all"
                >
                  Search
                </button>
              </form>

              {/* Popular Shortcuts */}
              <div className="space-y-2 text-center">
                <span className="text-[9.5px] font-black uppercase text-muted-foreground tracking-wider">
                  Popular Profiles
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "cristiano",
                    "leomessi",
                    "instagram",
                    "selenagomez",
                    "kyliejenner",
                    "therock",
                  ].map((username) => (
                    <button
                      key={username}
                      onClick={() => {
                        setUserQuery(username);
                        loadIGProfile(username);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-secondary/40 border border-border/20 hover:bg-secondary/70 transition-all text-[11.5px] font-bold text-muted-foreground hover:text-foreground"
                    >
                      @{username}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  {
                    icon: Grid3X3,
                    label: "Posts & Photos",
                    color: "text-pink-500",
                  },
                  {
                    icon: Heart,
                    label: "Stories & Reels",
                    color: "text-purple-500",
                  },
                  {
                    icon: Image,
                    label: "Highlights",
                    color: "text-amber-500",
                  },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    className="rounded-[16px] border border-border/20 bg-secondary/10 p-3.5 text-center space-y-1.5"
                  >
                    <feat.icon
                      className={`size-5 ${feat.color} mx-auto`}
                    />
                    <span className="text-[10.5px] font-bold text-muted-foreground block">
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ===== BROWSING WORKSPACE (NATIVE iOS PROFILE + GRAMSNAP FEED) ===== */
          <div className="flex-1 w-full h-full flex flex-col min-h-0 relative bg-background">
            {/* 1. Custom, Native iOS-Themed Instagram Profile Card */}
            <div className="w-full flex-shrink-0 bg-background border-b border-border/40 z-10">
              {profileLoading ? (
                <div className="p-8 flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="size-6 text-pink-500 animate-spin mb-2" />
                  <span className="text-[12px] font-bold text-muted-foreground">
                    Loading profile header...
                  </span>
                </div>
              ) : profileError ? (
                <div className="p-6 text-center space-y-2">
                  <AlertCircle className="size-7 text-destructive mx-auto" />
                  <p className="text-[13px] font-bold text-destructive">
                    {profileError}
                  </p>
                  <button
                    onClick={goHome}
                    className="mt-2 px-4 py-2 rounded-full border border-border text-[12px] font-bold hover:bg-secondary transition-all"
                  >
                    Try Another
                  </button>
                </div>
              ) : profileData ? (
                <div className="p-5 flex gap-5 items-start">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="size-[80px] rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600">
                      <div className="size-full rounded-full overflow-hidden bg-background border-2 border-background">
                        <img
                          src={profileData.avatar_url}
                          alt={profileData.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FhYSIgZm9udC1zaXplPSIzMCI+Pz88L3RleHQ+PC9zdmc+";
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[17px] font-black tracking-tight truncate leading-tight">
                          {profileData.name}
                        </h2>
                        <div className="size-4.5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="size-3 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-[12.5px] text-muted-foreground font-bold">
                        @{profileData.username}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-5 text-[13px] font-bold">
                      <div className="flex gap-1">
                        <span className="text-foreground">
                          {formatNumber(profileData.posts)}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          Posts
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-foreground">
                          {formatNumber(profileData.followers)}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          Followers
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-foreground">
                          {formatNumber(profileData.following)}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          Following
                        </span>
                      </div>
                    </div>

                    {profileData.bio && (
                      <p className="text-[12px] text-foreground/80 leading-relaxed font-medium">
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 2. GramSnap Feed Iframe (Cropped header/footer for seamless integration) */}
            <div className="flex-1 w-full relative overflow-hidden bg-background">
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95">
                  <Loader2 className="size-7 text-pink-500 animate-spin mb-2" />
                  <span className="text-[12.5px] font-bold text-muted-foreground">
                    Connecting to live feed...
                  </span>
                </div>
              )}

              {/* Crop top -340px (header, search, breadcrumbs) and shield bottom 75px (footer) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ bottom: "75px" }}
              >
                <iframe
                  src={iframeSrc}
                  className="absolute w-full border-0 bg-white dark:bg-[#15202b]"
                  style={{
                    top: "-340px",
                    left: "0",
                    height: "calc(100% + 340px)",
                    width: "100%",
                    pointerEvents: "auto",
                  }}
                  loading="lazy"
                  onLoad={() => setIframeLoading(false)}
                  onError={() => setIframeLoading(false)}
                />
              </div>

              {/* 3. Branded Bottom Overlay Shield Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[75px] bg-background border-t border-border/40 z-30 flex items-center justify-between px-6 select-none shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="size-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-black leading-tight tracking-tight">
                      IG SPACE DIRECT STREAM
                    </p>
                    <p className="text-[10.5px] text-muted-foreground font-bold">
                      End-to-End SSL Feed • Anonymous
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-pink-500 bg-pink-500/10 border border-pink-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    <Zap className="size-3.5 animate-pulse" />
                    <span>Scroll Feed Above</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
