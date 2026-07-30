import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { 
  Upload, 
  FileText, 
  Archive, 
  Sparkles, 
  User, 
  UserPlus, 
  Sun, 
  Moon,
  ChevronRight,
  Info,
  X,
  Crown,
  Globe,
  Music,
  Mail,
  Database,
  MessageSquare,
  Youtube,
  Compass,
  Gamepad2,
  Wifi,
  MapPin,
  Clock,
  Lock,
  KeyRound,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History
} from "lucide-react";

function StarOfDavidIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="50,8 92,80 8,80" />
      <polygon points="50,92 92,20 8,20" />
    </svg>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLOUD — Home Dashboard" },
      { name: "description", content: "Secure file sharing, notes, media conversion, and AI assistance." }
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [showQueenPopup, setShowQueenPopup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [ipInfo, setIpInfo] = useState<{ ip: string; country: string; city: string } | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  // nonxe/db User Account state
  const [savedAccount, setSavedAccount] = useState<{ id: string; createdAt?: string } | null>(null);
  const [accTab, setAccTab] = useState<"create" | "login">("create");
  const [accIdInput, setAccIdInput] = useState("");
  const [accPassInput, setAccPassInput] = useState("");
  const [accLoading, setAccLoading] = useState(false);
  const [accMsg, setAccMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Activity History state (synced via nonxe/db history.txt)
  const [userHistory, setUserHistory] = useState<Array<{ action: string; detail: string; timestamp: string }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchUserHistory = useCallback(async (userId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/accounts/history?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setUserHistory(data.history.slice(0, 20)); // show last 20
      }
    } catch {}
    setHistoryLoading(false);
  }, []);

  const trackActivity = useCallback(async (action: string, detail: string) => {
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (!stored) return;
      const acc = JSON.parse(stored);
      if (!acc?.id) return;
      await fetch("/api/accounts/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: acc.id, action, detail }),
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (stored) {
        const acc = JSON.parse(stored);
        setSavedAccount(acc);
        if (acc?.id) fetchUserHistory(acc.id);
      }
    } catch {}
  }, [fetchUserHistory]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accIdInput.trim() || !accPassInput.trim()) {
      setAccMsg({ type: "error", text: "ID and Password are required." });
      return;
    }

    setAccLoading(true);
    setAccMsg(null);

    const endpoint = accTab === "create" ? "/api/accounts/create" : "/api/accounts/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: accIdInput.trim(), pass: accPassInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAccMsg({ type: "error", text: data.error || "Authentication failed." });
      } else {
        const accountData = { id: data.account.id, createdAt: data.account.createdAt };
        localStorage.setItem("cloud_user_account", JSON.stringify(accountData));
        setSavedAccount(accountData);
        setAccIdInput("");
        setAccPassInput("");
        fetchUserHistory(data.account.id);
        // Track account creation / login itself
        setTimeout(() => {
          trackActivity(
            accTab === "create" ? "Account Created" : "Login",
            accTab === "create" ? "New account registered" : "Logged in from new session"
          );
        }, 500);
        setAccMsg({
          type: "success",
          text: accTab === "create" 
            ? "Account created & synced to cloud!" 
            : "Logged in successfully!"
        });
      }
    } catch {
      setAccMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setAccLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cloud_user_account");
    setSavedAccount(null);
    setAccMsg({ type: "success", text: "Logged out successfully." });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // Track last visit
  useEffect(() => {
    const stored = localStorage.getItem("cloud_last_visit");
    if (stored) {
      setLastVisit(stored);
    }
    localStorage.setItem("cloud_last_visit", new Date().toISOString());
  }, []);

  const fetchIpInfo = useCallback(async () => {
    if (ipInfo) return; // already fetched
    setIpLoading(true);
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      setIpInfo({
        ip: data.ip || "Unknown",
        country: data.country_name || "Unknown",
        city: data.city || "Unknown",
      });
    } catch {
      setIpInfo({ ip: "Unavailable", country: "Unavailable", city: "Unavailable" });
    } finally {
      setIpLoading(false);
    }
  }, [ipInfo]);

  const handleOpenInfo = () => {
    setShowInfoModal(true);
    fetchIpInfo();
  };

  const formatLastVisit = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relative = "";
    if (diffMins < 1) relative = "Just now";
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays < 7) relative = `${diffDays}d ago`;
    else relative = date.toLocaleDateString();

    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
    return { relative, full: `${dateStr} at ${time}` };
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleRequestAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim();
    if (!cleanUsername) return;

    if (cleanUsername.toLowerCase() === "suhu") {
      setShowQueenPopup(true);
      return;
    }

    const email = "skycho@proton.me";
    const subject = encodeURIComponent(`Private Account Request: ${cleanUsername}`);
    const body = encodeURIComponent(
      `Hello AS,\n\nI would like to request a private CLOUD account with the requested username:\n\nUsername: ${cleanUsername}\n\nPlease let me know when it is ready.\n\nBest regards.`
    );
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setShowAccountModal(false);
    setUsernameInput("");
  };

  const cards = [
    { 
      id: "uploader", 
      title: "File Cloud", 
      desc: "Upload files up to 100MB with direct CDN links.", 
      icon: Upload, 
      link: "/main",
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40"
    },
    { 
      id: "notes", 
      title: "Quick Notes", 
      desc: "Create and publish anonymous notes with shortened slugs.", 
      icon: FileText, 
      link: "/note",
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40"
    },
    { 
      id: "convert", 
      title: "Media Convert", 
      desc: "Transcode images, audio, video and extract files locally.", 
      icon: Archive, 
      link: "/convert",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
    },
    { 
      id: "ai", 
      title: "AI Assistant", 
      desc: "Converse with 17+ advanced language models in real-time.", 
      icon: Sparkles, 
      link: "/more",
      color: "text-pink-400 border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40"
    },
    { 
      id: "xview", 
      title: "X Viewer", 
      desc: "Browse public X/Twitter profiles, tweets, and media anonymously.", 
      icon: Globe, 
      link: "/x",
      color: "text-sky-400 border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40"
    },
    { 
      id: "cloudify", 
      title: "Cloudify Music", 
      desc: "Premium cloud music player. Stream, search, and manage custom playlists.", 
      icon: Music, 
      link: "/cloudify",
      color: "text-pink-400 border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40"
    },
    { 
      id: "ytdl", 
      title: "YT Downloader", 
      desc: "Download high definition YouTube videos directly in MP4 format.", 
      icon: Youtube, 
      link: "/ytdl",
      color: "text-red-400 border-red-500/20 bg-red-500/5 hover:border-red-500/40"
    },
    { 
      id: "israel", 
      title: "Way to Israel", 
      desc: "Comprehensive history of Israel, Jewish culture, heritage, and Am Yisrael Chai anthem.", 
      icon: StarOfDavidIcon, 
      link: "/israel",
      color: "text-sky-400 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40"
    },
    { 
      id: "tempmail", 
      title: "Temp Mail", 
      desc: "Generate temporary anonymous disposable email addresses to prevent spam.", 
      icon: Mail, 
      link: "/tempmail",
      color: "text-violet-400 border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40"
    },
    { 
      id: "shsdb", 
      title: "shsDB Console", 
      desc: "Futuristic serverless edge JSON store API, backed by SHS Cloud node networks.", 
      icon: Database, 
      link: "/shsdb-console",
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40"
    },
    {
      id: "messenger",
      title: "SHS Messenger",
      desc: "End-to-End Encrypted private messaging system using AES-GCM & ECDH key exchange.",
      icon: MessageSquare,
      link: "/messages",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
    },
    { 
      id: "request", 
      title: "Private Space", 
      desc: "Request a custom username and register a private cloud node.", 
      icon: UserPlus, 
      action: () => setShowAccountModal(true),
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40"
    },
    { 
      id: "about", 
      title: "About System", 
      desc: "Edge architecture parameters, performance metrics, and AS profile.", 
      icon: Info, 
      link: "/owner",
      color: "text-muted-foreground border-border bg-secondary/5 hover:border-foreground/30"
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative select-text">
      
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-4xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/85 select-none">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
          <Link to="/" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none flex-shrink-0">
            CLOUD
          </Link>
          <Link to="/note" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            NOTES
          </Link>
          <Link to="/convert" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            CONVERTS
          </Link>
          <Link to="/owner" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            ABOUT
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button 
            onClick={handleOpenInfo}
            className="h-9 px-3.5 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center gap-2 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all active:scale-95 text-purple-400 hover:text-purple-300"
            aria-label="Your Info"
          >
            <User className="size-4" />
            <span className="text-[12px] font-bold tracking-tight hidden sm:inline">Your Info</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>
      </header>

      {/* Body Content */}
      <section className="flex-1 flex flex-col items-center justify-center py-10 px-4 max-w-4xl mx-auto w-full space-y-10 z-10">
        
        {/* Intro Layout */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 select-none">
          {/* Left Column: Intro Text */}
          <div className="text-center md:text-left space-y-4 max-w-xl">
            <h1 className="text-[42px] sm:text-[54px] font-black tracking-tighter leading-[1.05] bg-gradient-to-r from-foreground via-purple-400 to-foreground bg-clip-text text-transparent animate-spring-scale">
              CLOUD OS SPACE
            </h1>
            <p className="text-[14.5px] text-muted-foreground font-medium leading-relaxed">
              Choose a service to launch. Fast, edge-backed, anonymous utilities without tracking or registrations.
            </p>
          </div>
          
          {/* Right Column: Professional Futuristic CSS Glow Orb */}
          <div className="flex items-center justify-center flex-shrink-0 relative w-40 h-40 sm:w-48 sm:h-48">
            {/* Outer blur glow */}
            <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-3xl opacity-35 scale-75 pointer-events-none" />
            {/* Spinning dashed orbital rings */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/20 animate-spin" style={{ animationDuration: '25s' }} />
            <div className="absolute inset-5 rounded-full border border-dashed border-pink-500/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            
            {/* Central pulsing core node */}
            <div className="size-20 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-blue-400 p-[2px] animate-pulse shadow-xl shadow-purple-500/5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Database className="size-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full select-none">
          {cards.map((card) => {
            const Icon = card.icon;
            
            const handleCardClick = () => {
              if (card.action) card.action();
              // Track activity for logged-in user
              trackActivity(`Opened ${card.title}`, card.desc);
            };

            const CardContent = (
              <>
                <div className={`size-11 rounded-[16px] border flex items-center justify-center shadow-sm ${card.color.split(" ").slice(0,2).join(" ")}`}>
                  <Icon className="size-5.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-[15px] font-black tracking-tight text-foreground flex items-center justify-between">
                    <span>{card.title}</span>
                    <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-purple-400" />
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </>
            );

            if (card.link) {
              return (
                <Link
                  key={card.id}
                  to={card.link}
                  onClick={() => trackActivity(`Opened ${card.title}`, card.desc)}
                  className={`group flex flex-col p-5 rounded-[24px] border bg-secondary/15 hover:bg-secondary/25 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/5 gap-4 ios-glass ${card.color.split(" ").pop()}`}
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <button
                key={card.id}
                onClick={handleCardClick}
                className={`group flex flex-col p-5 rounded-[24px] border bg-secondary/15 hover:bg-secondary/25 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/5 gap-4 ios-glass ${card.color.split(" ").pop()}`}
              >
                {CardContent}
              </button>
            );
          })}
        </div>

      </section>

      {/* Styles for Cherry Blossoms */}
      <style>{`
        @keyframes blossomFall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(250px) translateX(50px) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
        .blossom-petal {
          position: absolute;
          animation: blossomFall 4s linear infinite;
          pointer-events: none;
          color: #ffb7c5;
          text-shadow: 0 0 6px rgba(255, 183, 197, 0.6);
          z-index: 100;
        }
      `}</style>

      {/* Modal: Create Private Account Request */}
      {showAccountModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-[24px] border border-border bg-secondary/95 p-6 shadow-2xl relative overflow-hidden ios-glass animate-spring-scale select-text">
            <button 
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-background/50 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-[20px] font-black tracking-tight flex items-center gap-2 text-purple-400">
              <UserPlus className="size-5" />
              <span>Request Private Account</span>
            </h3>
            <p className="text-[12.5px] text-muted-foreground mt-2 leading-relaxed">
              Choose your unique username. We will prepare an automated email request to AS to set up your account.
            </p>

            <form onSubmit={handleRequestAccount} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">Desired Username</label>
                <input
                  type="text"
                  required
                  placeholder="Enter username..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full h-11 bg-background border border-border/40 rounded-[14px] px-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-[14px] bg-purple-600 hover:bg-purple-500 text-white font-black text-[13px] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/10"
              >
                Generate Request Mail
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: reserved Queen Popup */}
      {showQueenPopup && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-[24px] border border-pink-500/40 bg-[#160b10]/95 p-6 shadow-2xl relative overflow-hidden ios-glass animate-spring-scale text-center border-t-2 border-t-pink-500 select-text">
            
            {/* Falling Cherry Blossoms */}
            {Array.from({ length: 15 }).map((_, i) => (
              <span 
                key={i} 
                className="blossom-petal"
                style={{
                  left: `${Math.random() * 85}%`,
                  top: `${-20 - Math.random() * 30}px`,
                  animationDelay: `${Math.random() * 3.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  fontSize: `${12 + Math.random() * 12}px`
                }}
              >
                🌸
              </span>
            ))}

            <div className="mx-auto size-14 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
              <Crown className="size-7 text-pink-400 animate-pulse" />
            </div>

            <h4 className="text-[17px] font-black tracking-tight text-pink-300 flex items-center justify-center gap-1.5">
              <Sparkles className="size-4 text-pink-400" />
              Reserved Username
            </h4>
            
            <p className="text-[14px] text-pink-100/90 mt-3 leading-relaxed font-bold px-2">
              This username is reserved in honor of Her Majesty the Queen. 🌸👑
            </p>

            <button
              onClick={() => {
                setShowQueenPopup(false);
                setShowAccountModal(false);
                setUsernameInput("");
              }}
              className="mt-6 w-full h-10 rounded-[14px] bg-pink-600 hover:bg-pink-500 text-white font-bold text-[12.5px] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Accept Majesty
            </button>
          </div>
        </div>
      )}

      {/* Modal: Your Info */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setShowInfoModal(false); }}
          style={{ animation: 'fadeIn 0.25s ease-out' }}
        >
          <div 
            className="w-full max-w-sm rounded-[24px] border border-purple-500/30 bg-secondary/95 p-6 shadow-2xl relative overflow-hidden ios-glass"
            style={{ animation: 'springScale 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-background/50 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-[20px] font-black tracking-tight flex items-center gap-2 text-purple-400">
              <User className="size-5" />
              <span>Your Info</span>
            </h3>
            <p className="text-[12px] text-muted-foreground mt-1">
              Your current session details.
            </p>

            <div className="mt-5 space-y-3">
              {/* IP Address */}
              <div className="flex items-center gap-3 p-3.5 rounded-[16px] bg-background/60 border border-border/30">
                <div className="size-10 rounded-[12px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Wifi className="size-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">IP Address</p>
                  {ipLoading ? (
                    <div className="h-5 w-28 mt-0.5 rounded-md bg-purple-500/10 animate-pulse" />
                  ) : (
                    <p className="text-[14px] font-black tracking-tight text-foreground truncate">{ipInfo?.ip || "—"}</p>
                  )}
                </div>
              </div>

              {/* Country & City */}
              <div className="flex items-center gap-3 p-3.5 rounded-[16px] bg-background/60 border border-border/30">
                <div className="size-10 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Location</p>
                  {ipLoading ? (
                    <div className="h-5 w-36 mt-0.5 rounded-md bg-emerald-500/10 animate-pulse" />
                  ) : (
                    <p className="text-[14px] font-black tracking-tight text-foreground truncate">
                      {ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : "—"}
                    </p>
                  )}
                </div>
              </div>

              {/* Last Visit */}
              <div className="flex items-center gap-3 p-3.5 rounded-[16px] bg-background/60 border border-border/30">
                <div className="size-10 rounded-[12px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="size-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Last Visit</p>
                  {lastVisit ? (() => {
                    const { relative, full } = formatLastVisit(lastVisit);
                    return (
                      <div>
                        <p className="text-[14px] font-black tracking-tight text-foreground">{relative}</p>
                        <p className="text-[11px] text-muted-foreground">{full}</p>
                      </div>
                    );
                  })() : (
                    <p className="text-[14px] font-black tracking-tight text-foreground">First visit! 🎉</p>
                  )}
                </div>
              </div>

              {/* Account Section */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-black text-[13px]">
                    <Lock className="size-4 text-purple-400" />
                    <span>Cloud Account System</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    Cloud Sync
                  </span>
                </div>

                {savedAccount ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-[16px] bg-purple-500/10 border border-purple-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-[13px]">
                            {savedAccount.id.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-foreground leading-none">{savedAccount.id}</p>
                            <p className="text-[10px] text-emerald-400 font-semibold mt-1">● Synced to Cloud</p>
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <LogOut className="size-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <History className="size-3.5" />
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Recent Activity</span>
                        {historyLoading && <Loader2 className="size-3 animate-spin ml-auto" />}
                      </div>

                      {userHistory.length > 0 ? (
                        <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                          {userHistory.map((entry, i) => {
                            const date = new Date(entry.timestamp);
                            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/30 group hover:border-purple-500/30 transition-colors"
                              >
                                <div className="size-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <History className="size-3 text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11.5px] font-bold text-foreground leading-tight truncate">{entry.action}</p>
                                  {entry.detail && (
                                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{entry.detail}</p>
                                  )}
                                </div>
                                <div className="text-[9px] text-muted-foreground font-mono flex-shrink-0 text-right leading-tight mt-0.5">
                                  <div>{timeStr}</div>
                                  <div>{dateStr}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/60 italic py-2">No activity recorded yet. Use any tool to start tracking.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mode Selector Tabs */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-background/80 border border-border/40">
                      <button
                        type="button"
                        onClick={() => { setAccTab("create"); setAccMsg(null); }}
                        className={`py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          accTab === "create"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <UserPlus className="size-3.5" />
                        <span>Create Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAccTab("login"); setAccMsg(null); }}
                        className={`py-1.5 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          accTab === "login"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <LogIn className="size-3.5" />
                        <span>Login</span>
                      </button>
                    </div>

                    <form onSubmit={handleAccountSubmit} className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                          Account ID / Username
                        </label>
                        <input
                          type="text"
                          value={accIdInput}
                          onChange={(e) => setAccIdInput(e.target.value)}
                          placeholder="Enter Account ID..."
                          required
                          className="w-full h-9 bg-background/80 border border-border/50 rounded-xl px-3 text-[12px] font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                          Password
                        </label>
                        <input
                          type="password"
                          value={accPassInput}
                          onChange={(e) => setAccPassInput(e.target.value)}
                          placeholder="Enter Password..."
                          required
                          className="w-full h-9 bg-background/80 border border-border/50 rounded-xl px-3 text-[12px] font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-all font-mono"
                        />
                      </div>

                      {accMsg && (
                        <div className={`p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 ${
                          accMsg.type === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                          {accMsg.type === "success" ? <CheckCircle2 className="size-4 flex-shrink-0" /> : <AlertCircle className="size-4 flex-shrink-0" />}
                          <span>{accMsg.text}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={accLoading}
                        className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[12px] font-black shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {accLoading ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Connecting to Cloud...</span>
                          </>
                        ) : accTab === "create" ? (
                          <>
                            <UserPlus className="size-3.5" />
                            <span>Create Account</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="size-3.5" />
                            <span>Login Account</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-60" />
          </div>
        </div>
      )}

      {/* Info Modal Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes springScale {
          0% { opacity: 0; transform: scale(0.85) translateY(10px); }
          60% { opacity: 1; transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </main>
  );
}
