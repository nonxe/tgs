import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Instagram,
  Mail,
  Database,
  MessageSquare
} from "lucide-react";

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
      id: "igview", 
      title: "Instagram Viewer", 
      desc: "Browse public Instagram profiles, posts, reels, and stories anonymously.", 
      icon: Instagram, 
      link: "/instagram",
      color: "text-pink-400 border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40"
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

        <button 
          onClick={toggleTheme}
          className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90 flex-shrink-0 ml-3"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
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
    </main>
  );
}
