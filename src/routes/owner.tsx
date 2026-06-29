import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Sun, 
  Moon, 
  Mail,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export const Route = createFileRoute("/owner")({
  component: OwnerPage,
});

function OwnerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

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
      {/* CSS Keyframes injected dynamically */}
      <style>{`
        @keyframes triSpinCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes triSpinCCW {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes ownerPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        .tri-spin-cw-12 {
          transform-origin: 100px 100px;
          animation: triSpinCW 12s linear infinite;
        }
        .tri-spin-ccw-12 {
          transform-origin: 100px 100px;
          animation: triSpinCCW 12s linear infinite;
        }
        .tri-spin-cw-24 {
          transform-origin: 100px 100px;
          animation: triSpinCW 24s linear infinite;
        }
        .tri-spin-ccw-6 {
          transform-origin: 100px 100px;
          animation: triSpinCCW 6s linear infinite;
        }
        .owner-pulse-anim {
          animation: ownerPulse 4s ease-in-out infinite;
        }
      `}</style>

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
          <Link to="/more" className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity">
            MORE
          </Link>
          <span className="text-[20px] font-black tracking-tighter select-none">
            OWNER INFO
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
      <section className="flex-1 flex flex-col px-4 py-12 max-w-4xl mx-auto w-full gap-8 justify-center">
        {/* Owner Card Container */}
        <div className="rounded-[32px] border border-border bg-secondary/15 p-8 md:p-12 relative overflow-hidden ios-glass ios-shadow animate-spring-scale flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Left Side: Owner Information */}
          <div className="flex-1 space-y-6 text-center md:text-left z-10">
            <div>
              <span className="text-[11px] font-black tracking-[3px] uppercase text-muted-foreground">
                The Observer
              </span>
              <h2 className="text-[48px] md:text-[56px] font-black tracking-tighter leading-tight bg-gradient-to-r from-foreground to-purple-500 bg-clip-text text-transparent mt-2">
                AS
              </h2>
              <p className="text-[14px] md:text-[15px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                Founder of CLOUD
              </p>
            </div>

            <div className="w-12 h-[2px] bg-purple-500 mx-auto md:mx-0" />

            <div className="space-y-4 text-[14px] md:text-[15px] leading-relaxed text-muted-foreground font-medium max-w-lg">
              <p>
                CLOUD was built and designed by <strong className="text-foreground">AS</strong>. Driven by the goal to make digital utility tools, audio-visual converters, and note sharing premium, simple, and accessible, AS designed this platform to merge minimal aesthetics with robust tools.
              </p>
              <p>
                AS handles all core architecture, secure file storage integrations, and UI features for CLOUD. The goal remains: absolute clarity of design, seamless speed, and a modern iOS-styled user experience.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 select-none">
              <a 
                href="mailto:skycho@proton.me" 
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background font-bold text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
              >
                <Mail className="size-4" />
                <span>Contact AS</span>
              </a>
            </div>
          </div>

          {/* Right Side: Visual Spinning Triangle Animation (Exact clone of ewon's visual) */}
          <div className="flex-shrink-0 w-52 h-52 flex items-center justify-center relative z-10 select-none">
            <div className="relative w-40 h-40 flex items-center justify-center">
              
              {/* Outer Ring */}
              <svg className="absolute w-40 h-40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="triGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#a78bfa" }} />
                    <stop offset="100%" style={{ stopColor: "#f87171" }} />
                  </linearGradient>
                  <linearGradient id="triGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#c4b5fd" }} />
                    <stop offset="100%" style={{ stopColor: "#818cf8" }} />
                  </linearGradient>
                  <linearGradient id="triGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#f9a8d4" }} />
                    <stop offset="100%" style={{ stopColor: "#a78bfa" }} />
                  </linearGradient>
                  <filter id="triGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Outer ring */}
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(167,139,250,0.08)" strokeWidth="1" strokeDasharray="4 8" />
                
                {/* Triangle 1: clockwise */}
                <polygon className="tri-spin-cw-12" points="100,22 160,138 40,138" fill="none" stroke="url(#triGrad1)" strokeWidth="2" filter="url(#triGlow)" />
                
                {/* Triangle 2: counter-clockwise */}
                <polygon className="tri-spin-ccw-12" points="100,22 160,138 40,138" fill="none" stroke="url(#triGrad2)" strokeWidth="1.5" filter="url(#triGlow)" />
                
                {/* Triangle 3: slow clockwise, larger */}
                <polygon className="tri-spin-cw-24" points="100,15 170,145 30,145" fill="none" stroke="url(#triGrad3)" strokeWidth="1" opacity="0.4" />
                
                {/* Triangle 4: fast counter-clockwise, smaller */}
                <polygon className="tri-spin-ccw-6" points="100,35 145,128 55,128" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                
                {/* Center dot */}
                <circle cx="100" cy="100" r="3" fill="rgba(167,139,250,0.5)">
                  <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Orbiting dots */}
                <g style={{ transformOrigin: "100px 100px", animation: "triSpinCW 8s linear infinite" }}>
                  <circle cx="100" cy="12" r="2" fill="#a78bfa" />
                </g>
                <g style={{ transformOrigin: "100px 100px", animation: "triSpinCCW 12s linear infinite" }}>
                  <circle cx="100" cy="12" r="1.5" fill="#f87171" />
                </g>
              </svg>

              {/* Initials Text */}
              <span className="relative z-30 font-black text-[32px] tracking-[3px] bg-gradient-to-br from-purple-400 to-white bg-clip-text text-transparent select-none">
                AS
              </span>
            </div>

            {/* Glowing Backdrop */}
            <div className="absolute w-48 h-48 rounded-full bg-purple-500/10 filter blur-xl owner-pulse-anim -z-10" />
          </div>

        </div>
      </section>
    </main>
  );
}
