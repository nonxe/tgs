import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Compass,
  History,
  Shield,
  Heart,
  Scroll,
  Crown,
  MapPin,
  Calendar,
  Feather
} from "lucide-react";

export const Route = createFileRoute("/israel")({
  head: () => ({
    meta: [
      { title: "Way to Israel — History, Heritage & Jewish Culture" },
      { name: "description", content: "Explore the comprehensive history of Israel, Jewish heritage, ancient traditions, and culture." },
    ],
  }),
  component: WayToIsraelPage,
});

function WayToIsraelPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "culture" | "symbols">("history");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const timelineEvents = [
    {
      period: "c. 2000 BCE",
      title: "Patriarchal Era & Covenant",
      desc: "The origins of the Jewish nation begin with Abraham, Isaac, and Jacob in the Land of Canaan. The covenant forms the spiritual cornerstone of Jewish identity."
    },
    {
      period: "c. 1250 BCE",
      title: "The Exodus & Mt. Sinai",
      desc: "Moses leads the Children of Israel out of slavery in Egypt. At Mount Sinai, they receive the Torah, establishing their legal, moral, and spiritual foundation."
    },
    {
      period: "c. 1000 BCE",
      title: "Kingdom of Israel & Davidic Era",
      desc: "King David establishes Jerusalem as the capital of Israel. His son, King Solomon, builds the First Temple on Mount Moriah."
    },
    {
      period: "586 BCE - 70 CE",
      title: "Temple Eras & Roman Siege",
      desc: "Babylonians destroy the First Temple (586 BCE). Rebuilt 70 years later, the Second Temple stands until Roman forces destroy Jerusalem in 70 CE, beginning the Great Diaspora."
    },
    {
      period: "1897 CE",
      title: "Modern Zionist Movement",
      desc: "The First Zionist Congress convened by Theodor Herzl in Basel, Switzerland, organizing the political movement for Jewish self-determination in their ancestral homeland."
    },
    {
      period: "May 14, 1948",
      title: "Declaration of Statehood",
      desc: "David Ben-Gurion reads the Declaration of Independence in Tel Aviv, establishing the modern State of Israel as a Jewish & Democratic nation."
    }
  ];

  const culturalPillars = [
    {
      title: "Shabbat (Rest & Renewal)",
      icon: Scroll,
      color: "from-blue-600/20 to-sky-500/20 border-blue-500/30",
      desc: "The weekly Sabbath from Friday sunset to Saturday night. A sacred sanctuary in time devoted to family, prayer, traditional meals (Challah, Kiddush), and spiritual reflection."
    },
    {
      title: "Hebrew Language Revival",
      icon: Feather,
      color: "from-cyan-600/20 to-blue-500/20 border-cyan-500/30",
      desc: "An unprecedented linguistic achievement: Eliezer Ben-Yehuda and modern pioneers revived biblical Hebrew into a spoken modern language spoken by millions today."
    },
    {
      title: "Kibbutz & Innovation",
      icon: Compass,
      color: "from-amber-600/20 to-yellow-500/20 border-amber-500/30",
      desc: "From early agricultural communes to the world's leading technology 'Start-Up Nation', Israel combines ancient pioneer spirit with high-tech innovation."
    },
    {
      title: "Jewish Festivals",
      icon: Calendar,
      color: "from-indigo-600/20 to-blue-500/20 border-indigo-500/30",
      desc: "High Holy Days (Rosh Hashanah, Yom Kippur), Passover (Pesach), Hanukkah (Festival of Lights), and Sukkot connect modern Israelis to thousands of years of heritage."
    }
  ];

  return (
    <main className="min-h-screen bg-[#030614] text-white flex flex-col font-sans relative overflow-x-hidden select-none pb-24">
      {/* Blue Ambient Glow Orbs */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="px-5 py-4 border-b border-blue-900/40 backdrop-blur-2xl sticky top-0 z-40 bg-[#030614]/85 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9.5 rounded-full bg-blue-950/70 border border-blue-800/60 flex items-center justify-center hover:bg-blue-900/60 active:scale-95 transition-all text-white shadow-md"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-9.5 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Compass className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17.5px] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-blue-300">
                WAY TO ISRAEL
              </h1>
              <p className="text-[9px] text-sky-400 font-black tracking-widest uppercase mt-0.5">Am Yisrael Chai • History & Culture</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-black text-sky-300 bg-blue-500/15 border border-blue-400/30 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Shield className="size-3 text-sky-400" />
            <span>Land of Heritage</span>
          </span>
        </div>
      </header>

      {/* Hero Section with Video */}
      <section className="relative max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">

        {/* Featured Song Video Container */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-blue-950/40 shadow-[0_20px_60px_rgba(0,56,184,0.25)] group">
          <video
            ref={videoRef}
            src="https://files.catbox.moe/s6mzcv.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Video Control Overlay Bar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-5 pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5 shadow-lg">
                <Sparkles className="size-3 text-sky-200" />
                Featured Song: Am Yisrael Chai
              </span>

              <button
                onClick={toggleMute}
                className="size-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all active:scale-95"
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
            </div>

            <div className="flex items-end justify-between pointer-events-auto">
              <div className="max-w-md">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  עם ישראל חי — Am Yisrael Chai
                </h3>
                <p className="text-[12px] font-bold text-sky-200/90 mt-1 drop-shadow-sm">
                  "The People of Israel Live" — The eternal anthem of Jewish resilience, unity, and hope.
                </p>
              </div>

              <button
                onClick={togglePlay}
                className="size-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 border border-sky-400/40 flex-shrink-0"
              >
                {isPlaying ? <Pause className="size-6 fill-white" /> : <Play className="size-6 fill-white ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Waving Flag & Introduction Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-br from-blue-950/60 via-slate-950/80 to-blue-950/60 border border-blue-500/25 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Waving Israeli Flag Display */}
          <div className="md:col-span-5 flex justify-center py-4">
            <div className="relative w-64 sm:w-72 aspect-[3/2] rounded-xl overflow-hidden animate-flag-wave bg-white shadow-2xl border border-blue-400/40 flex flex-col justify-between p-3 select-none">
              {/* Top Blue Stripe */}
              <div className="h-4.5 bg-[#0038b8] rounded-xs" />

              {/* Center Star of David */}
              <div className="flex items-center justify-center my-auto">
                <svg className="w-20 h-20 text-[#0038b8]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7.5">
                  <polygon points="50,10 90,80 10,80" />
                  <polygon points="50,90 90,20 10,20" />
                </svg>
              </div>

              {/* Bottom Blue Stripe */}
              <div className="h-4.5 bg-[#0038b8] rounded-xs" />
            </div>
          </div>

          {/* Intro Description */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              <Heart className="size-3.5 text-blue-400 fill-blue-400" />
              <span>Way to Israel • Zion Heritage</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              A 4,000-Year Journey of Faith, Resilience & Rebirth
            </h2>

            <p className="text-[13px] font-bold text-slate-300 leading-relaxed">
              The Land of Israel (Eretz Yisrael) represents one of humanity's most historic cultural and spiritual epicenters. From ancient kingdom roots in Jerusalem to modern scientific breakthroughs, Jewish culture is rooted in education, tradition, family values, and unwavering hope.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 px-3.5 py-1.5 rounded-xl text-[11.5px] font-bold text-sky-200">
                <MapPin className="size-3.5 text-sky-400" />
                <span>Capital: Jerusalem</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 px-3.5 py-1.5 rounded-xl text-[11.5px] font-bold text-sky-200">
                <Crown className="size-3.5 text-amber-400" />
                <span>Heritage: 40+ Centuries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-blue-900/60 pb-1 pt-4">
          <div className="flex gap-2 bg-blue-950/80 p-1.5 rounded-2xl border border-blue-800/60 max-w-md w-full">
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="size-3.5" />
              <span>History Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab("culture")}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "culture"
                  ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>Jewish Culture</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Detailed History Timeline */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-spring-scale">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">Chronological History of Israel</h3>
              <p className="text-[12px] font-bold text-slate-400">Key epochs from antiquity to modern statehood</p>
            </div>

            <div className="relative border-l-2 border-blue-500/40 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8 py-2">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 size-5 rounded-full bg-blue-600 border-4 border-[#030614] group-hover:scale-125 transition-transform shadow-md shadow-blue-500/50" />

                  <div className="bg-gradient-to-br from-blue-950/70 to-slate-950/70 border border-blue-500/20 hover:border-blue-400/50 rounded-2xl p-5 space-y-2 transition-all shadow-xl">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md">
                      {evt.period}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white">{evt.title}</h4>
                    <p className="text-[12.5px] font-bold text-slate-300 leading-relaxed">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Jewish Culture & Traditions */}
        {activeTab === "culture" && (
          <div className="space-y-6 animate-spring-scale">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">Pillars of Jewish Culture & Values</h3>
              <p className="text-[12px] font-bold text-slate-400">Timeless traditions that define identity and community</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {culturalPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${item.color} border rounded-3xl p-6 space-y-3 backdrop-blur-md shadow-xl hover:scale-[1.01] transition-transform`}
                  >
                    <div className="size-11 rounded-2xl bg-blue-600/30 border border-sky-400/30 flex items-center justify-center text-sky-300">
                      <Icon className="size-5.5" />
                    </div>
                    <h4 className="text-lg font-black text-white">{item.title}</h4>
                    <p className="text-[12.5px] font-bold text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
