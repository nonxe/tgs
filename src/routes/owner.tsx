import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Sun, 
  Moon, 
  Mail,
  Upload,
  FileText,
  Archive,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";

export const Route = createFileRoute("/owner")({
  component: OwnerPage,
});

export function OwnerPage({ embed = false }: { embed?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (embed) return;
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, [embed]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const features = [
    { icon: Upload, title: "File Cloud", desc: "Upload any file and get instant shareable links with permanent or temporary storage." },
    { icon: FileText, title: "Quick Notes", desc: "Write and publish anonymous notes with short shareable links. No sign-up needed." },
    { icon: Archive, title: "Media Convert", desc: "Convert audio and video files between formats directly in your browser." },
    { icon: Sparkles, title: "AI Assistant", desc: "Access 17+ AI models for writing, coding, and creative tasks." },
  ];

  const content = (
    <>
      <section className={`flex-1 flex flex-col w-full gap-6 ${embed ? "py-2" : "px-4 py-8 sm:py-12 max-w-3xl mx-auto"}`}>
        
        {/* Hero */}
        <div className="space-y-4 text-center">
          <h2 className="text-[36px] sm:text-[44px] md:text-[52px] font-black tracking-tighter leading-[1.05] bg-gradient-to-r from-foreground via-purple-400 to-foreground bg-clip-text text-transparent">
            CLOUD
          </h2>
          <p className="text-[14px] sm:text-[15px] leading-relaxed text-muted-foreground font-medium max-w-xl mx-auto">
            A premium Web OS for secure file sharing, anonymous note publishing, media conversion, and AI assistance — all inside a clean, minimal interface. No sign-ups, no tracking, no clutter.
          </p>
        </div>

        <div className="w-12 h-[2px] bg-purple-500 mx-auto" />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="rounded-[20px] border border-border/40 bg-secondary/10 p-5 space-y-2.5 hover:border-purple-500/30 transition-colors">
                <div className="size-10 rounded-[12px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Icon className="size-5 text-purple-500" />
                </div>
                <h4 className="text-[14px] font-black tracking-tight">{f.title}</h4>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-border/40 bg-secondary/10 p-5 flex items-start gap-3.5">
            <Shield className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[13px] font-black tracking-tight">Privacy First</h4>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">No accounts, no cookies, no analytics. Files are stored via encrypted CDN endpoints. Notes are anonymous by default.</p>
            </div>
          </div>
          <div className="rounded-[20px] border border-border/40 bg-secondary/10 p-5 flex items-start gap-3.5">
            <Zap className="size-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[13px] font-black tracking-tight">Built for Speed</h4>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Deployed on edge workers globally. Instant page loads, smooth 60fps animations, and responsive across all devices.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center pt-2 select-none space-y-3">
          <p className="text-[12px] text-muted-foreground font-bold">Built by <strong className="text-foreground">AS</strong></p>
          <a 
            href="mailto:skycho@proton.me" 
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background font-bold text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            <Mail className="size-4" />
            <span>skycho@proton.me</span>
          </a>
        </div>

      </section>
    </>
  );

  if (embed) return content;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      <header className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-2xl md:max-w-6xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
          <Link to="/" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            CLOUD
          </Link>
          <Link to="/note" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            NOTES
          </Link>
          <Link to="/convert" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            CONVERTS
          </Link>
          <Link to="/owner" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none flex-shrink-0">
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

      {content}
    </main>
  );
}
