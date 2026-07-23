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
  Feather,
  FileText,
  ExternalLink,
  BookMarked,
  Download,
  Star,
  Globe,
  Sun,
  Flame
} from "lucide-react";

export const Route = createFileRoute("/israel")({
  head: () => ({
    meta: [
      { title: "Way to Israel — History, Sacred Texts & Jewish Heritage" },
      { name: "description", content: "Comprehensive history of Israel from Biblical foundations to modern statehood, Jewish culture, Tanakh & Torah PDFs." },
    ],
  }),
  component: WayToIsraelPage,
});

function WayToIsraelPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "texts" | "culture">("history");
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
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

  const sacredTexts = [
    {
      title: "The Tanakh (Hebrew Bible)",
      subtitle: "Torah, Nevi'im (Prophets) & Ketuvim (Writings)",
      pdfUrl: "https://ferrusca.wordpress.com/wp-content/uploads/2016/11/thetanakh.pdf",
      desc: "The complete 24-book canon of the Hebrew Scriptures translated into English. Encompasses the foundational law, historical chronicles of Israel, poetic psalms, and prophetic visions.",
      pages: "Full PDF Edition",
      category: "Canonical Scripture",
      badgeColor: "bg-blue-500/20 text-sky-300 border-blue-500/30"
    },
    {
      title: "The Torah (Five Books of Moses)",
      subtitle: "Genesis, Exodus, Leviticus, Numbers & Deuteronomy",
      pdfUrl: "https://www.betemunah.org/Torah.pdf",
      desc: "The holy centerpiece of Jewish spiritual and moral law, revealed at Mount Sinai. Contains the origin of creation, the patriarchs, the Exodus from Egypt, and the 613 Mitzvot.",
      pages: "Study PDF Edition",
      category: "Foundational Law",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    }
  ];

  const historyParts = [
    {
      part: "Part I",
      period: "c. 2000 BCE – 586 BCE",
      title: "The Biblical Foundations",
      summary: "From Abraham's covenant and the Exodus out of Egypt to King David's Kingdom in Jerusalem and the Babylonian Exile.",
      sections: [
        {
          heading: "The Patriarchal Age",
          content: "History begins approximately 4,000 years ago with Abraham, Isaac, and Jacob. Abraham was summoned from Ur of the Chaldeans to Canaan to establish a monotheistic people bound by the divine Brit (Covenant). Jacob was renamed Israel ('he who strives with God') and fathered the Twelve Tribes of Israel."
        },
        {
          heading: "Exodus & Mount Sinai",
          content: "Moses led the Israelites out of 400 years of Egyptian slavery. During 40 years in the Sinai desert, the nation received the Torah and Ten Commandments at Mount Sinai—an event commemorated annually during Passover (Pesach)."
        },
        {
          heading: "United Monarchy & First Temple",
          content: "King Saul unified the tribes, followed by King David (c. 1004 BCE) who established Jerusalem as Israel's eternal capital. King Solomon built the First Temple on Mount Moriah, creating the spiritual heart of the nation."
        },
        {
          heading: "Prophetic Era & Babylonian Exile",
          content: "After Solomon, the kingdom split into Israel (North) and Judah (South). Prophets like Isaiah and Jeremiah urged spiritual fidelity. In 586 BCE, Nebuchadnezzar destroyed the First Temple and exiled the Jews to Babylon, forging synagogue prayer and resilient Jewish identity."
        }
      ]
    },
    {
      part: "Part II",
      period: "c. 538 BCE – 70 CE",
      title: "The Second Temple Period",
      summary: "Return to Zion under Cyrus the Great, the Maccabean Revolt (Hanukkah), Roman siege, and the Second Temple destruction.",
      sections: [
        {
          heading: "Return to Zion & Hasmonean Revolt",
          content: "Cyrus the Great allowed exiled Jews to rebuild the Second Temple in Jerusalem. In 165 BCE, Judah the Maccabee led the Maccabean Revolt against Greek Hellenization, recapturing the Temple and establishing the Hasmonean Kingdom—celebrated on Hanukkah."
        },
        {
          heading: "Roman Rule & Great Revolt",
          content: "Rome seized Judea in 66 BCE. Escalating oppression sparked the First Jewish-Roman War (66–70 CE). In 70 CE, Roman legions under Titus burned the Second Temple to the ground."
        },
        {
          heading: "Bar Kokhba Revolt & Great Dispersion",
          content: "Simon Bar Kokhba led a second uprising (132–135 CE). Upon crushing it, Rome renamed the province 'Syria Palaestina' and banned Jews from Jerusalem, sparking 1,900 years of international Diaspora."
        }
      ]
    },
    {
      part: "Part III",
      period: "70 CE – 19th Century",
      title: "The Long Exile & The Diaspora",
      summary: "Transformation into Rabbinic Judaism, Mishnah & Talmud compilation, Ashkenaz & Sepharad traditions, and the birth of modern Zionism.",
      sections: [
        {
          heading: "Talmudic & Rabbinic Era",
          content: "With the Temple lost, Judaism transformed around synagogues, Torah study, and the Talmud (Mishnah + Gemara), creating a portable spiritual homeland that preserved Jewish continuity everywhere."
        },
        {
          heading: "Ashkenazim & Sephardim Centers",
          content: "Jews formed vibrant cultural branches: Ashkenazim in Central/Eastern Europe (developing Yiddish), and Sephardim in Spain & Portugal (experiencing a Golden Age of poetry and philosophy under Islamic Spain)."
        },
        {
          heading: "Persecutions & Rise of Zionism",
          content: "Despite expulsions (Spain 1492) and Russian pogroms, Jewish yearning for Zion remained constant. In 1897, Theodor Herzl convened the First Zionist Congress in Basel, establishing modern political Zionism as the national liberation movement for Jewish self-determination."
        }
      ]
    },
    {
      part: "Part IV",
      period: "19th Century – 1948",
      title: "The Road to Statehood",
      summary: "Immigration waves (Aliyah), Hebrew language revival, Balfour Declaration, Holocaust trauma, and 1948 Declaration of Independence.",
      sections: [
        {
          heading: "Early Pioneers & Balfour Declaration",
          content: "Pioneers (Halutzim) returned in waves of Aliyah to drain swamps, build Kibbutzim, and revive Hebrew. In 1917, Britain issued the Balfour Declaration supporting a Jewish national home."
        },
        {
          heading: "The Holocaust & Existential Need",
          content: "The murder of six million Jews during WWII by Nazi Germany demonstrated with tragic finality the absolute necessity of a sovereign Jewish homeland where Jews control their destiny."
        },
        {
          heading: "May 14, 1948: Independence",
          content: "On May 14, 1948, David Ben-Gurion declared the establishment of the State of Israel in Tel Aviv, fulfilling 2,000 years of hope and prayer."
        }
      ]
    },
    {
      part: "Part V",
      period: "1948 – Present",
      title: "The Modern State of Israel",
      summary: "Ingathering of global exiles, defense of sovereignty, high-tech innovation, peace treaties, and vibrant cultural life.",
      sections: [
        {
          heading: "Ingathering of the Exiles",
          content: "Between 1948 and 1951, Israel's population doubled as Holocaust survivors and over 850,000 Mizrahi and Sephardi Jewish refugees from Arab nations returned to their homeland."
        },
        {
          heading: "Six-Day War & Reunification of Jerusalem",
          content: "In June 1967, Israel defeated massing Arab armies in the Six-Day War, reunifying Jerusalem and restoring Jewish access to the Kotel (Western Wall)."
        },
        {
          heading: "Start-Up Nation & Modern Heritage",
          content: "Today Israel is a global high-tech and medical superpower, preserving ancient Hebrew tradition while fostering cutting-edge innovation and art."
        }
      ]
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
      title: "Kibbutz & High-Tech Nation",
      icon: Compass,
      color: "from-amber-600/20 to-yellow-500/20 border-amber-500/30",
      desc: "From early agricultural communes to the world's leading technology 'Start-Up Nation', Israel combines ancient pioneer spirit with high-tech innovation."
    },
    {
      title: "Festivals of Remembrance",
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
              <p className="text-[9px] text-sky-400 font-black tracking-widest uppercase mt-0.5">Am Yisrael Chai • Full History & Texts</p>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-5 pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5 shadow-lg border border-sky-400/30">
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

        {/* Corrected Wavy Israeli Flag Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-br from-blue-950/70 via-slate-950/80 to-blue-950/70 border border-blue-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Corrected Real Wavy Flag Component */}
          <div className="md:col-span-5 flex justify-center py-4">
            <div className="relative w-64 sm:w-72 aspect-[3/2] rounded-2xl overflow-hidden animate-flag-wave bg-white shadow-[0_20px_50px_rgba(0,56,184,0.4)] border border-blue-300/40 flex flex-col justify-between p-3 select-none relative">
              {/* Flag Light Shimmer Overlay */}
              <div className="absolute inset-0 flag-shimmer pointer-events-none z-10" />

              {/* Top Blue Stripe */}
              <div className="h-5 bg-[#0038b8] rounded-xs shadow-inner" />

              {/* Center Star of David (Shield of David) */}
              <div className="flex items-center justify-center my-auto relative z-0 py-2">
                <svg className="w-22 h-22 text-[#0038b8] drop-shadow-md" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7">
                  <polygon points="50,8 92,80 8,80" />
                  <polygon points="50,92 92,20 8,20" />
                </svg>
              </div>

              {/* Bottom Blue Stripe */}
              <div className="h-5 bg-[#0038b8] rounded-xs shadow-inner" />
            </div>
          </div>

          {/* Flag Description & Meaning */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              <Star className="size-3 text-sky-400 fill-sky-400" />
              <span>Flag of Israel • Symbolism</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              The Flag of Israel: Banner of Hope
            </h2>

            <p className="text-[13px] font-bold text-slate-300 leading-relaxed">
              Designed in 1891 and officially adopted in 1948, the Israeli flag features two horizontal blue stripes on a white field inspired by the traditional <strong>Tallit</strong> (Jewish prayer shawl). At its heart rests the <strong>Magen David</strong> (Star of David), representing divine protection and national identity.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 px-3 py-1 rounded-xl text-[11px] font-bold text-sky-200">
                <Scroll className="size-3.5 text-sky-400" />
                <span>Tallit Prayer Shawl Stripes</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 px-3 py-1 rounded-xl text-[11px] font-bold text-sky-200">
                <Star className="size-3.5 text-amber-400" />
                <span>Magen David (Shield of David)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-blue-900/60 pb-1 pt-4">
          <div className="grid grid-cols-3 gap-2 bg-blue-950/80 p-1.5 rounded-2xl border border-blue-800/60 max-w-xl w-full">
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="size-3.5" />
              <span>5-Part History</span>
            </button>

            <button
              onClick={() => setActiveTab("texts")}
              className={`py-2.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "texts"
                  ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookMarked className="size-3.5" />
              <span>Sacred Texts (PDF)</span>
            </button>

            <button
              onClick={() => setActiveTab("culture")}
              className={`py-2.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
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

        {/* TAB 1: Complete 5-Part History of Israel */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-spring-scale select-text">
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                A Complete History of Israel (Jewish Experience)
              </h3>
              <p className="text-[12.5px] font-bold text-slate-400 max-w-2xl mx-auto">
                A vast tapestry woven over millennia—from the dawn of monotheism and covenant to exile, dispersion, and the miraculous rebirth of a sovereign state.
              </p>
            </div>

            {/* Part Selection Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {historyParts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPart(selectedPart === idx ? null : idx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedPart === idx
                      ? "bg-blue-600 text-white border-sky-300 shadow-lg shadow-blue-500/30 scale-[1.02]"
                      : "bg-blue-950/60 border-blue-900/60 hover:bg-blue-900/40 text-slate-300"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 opacity-90">{p.part}</span>
                  <span className="text-[12px] font-black leading-tight line-clamp-1 mt-1">{p.title}</span>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">{p.period}</span>
                </button>
              ))}
            </div>

            {/* Complete Detailed Parts Breakdown */}
            <div className="space-y-6 pt-2">
              {historyParts.map((p, idx) => {
                if (selectedPart !== null && selectedPart !== idx) return null;
                return (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-950/80 via-slate-950 to-blue-950/80 border border-blue-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-900/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-sky-400/40 text-sky-300 text-[10.5px] font-black uppercase tracking-widest">
                          {p.part}
                        </span>
                        <h4 className="text-xl font-black text-white">{p.title}</h4>
                      </div>
                      <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        {p.period}
                      </span>
                    </div>

                    <p className="text-[13px] font-bold text-sky-200/90 italic leading-relaxed">
                      "{p.summary}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {p.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="bg-blue-950/40 border border-blue-900/50 rounded-2xl p-4 space-y-2">
                          <h5 className="text-[14px] font-black text-sky-300 flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-blue-400" />
                            {sec.heading}
                          </h5>
                          <p className="text-[12px] font-bold text-slate-300 leading-relaxed">
                            {sec.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Sacred Texts (Tanakh & Torah PDFs) */}
        {activeTab === "texts" && (
          <div className="space-y-6 animate-spring-scale select-text">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">Sacred Jewish Scriptures & Texts</h3>
              <p className="text-[12px] font-bold text-slate-400">Read and download official PDF editions of Tanakh & Torah</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sacredTexts.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-blue-950/80 via-slate-950 to-blue-950/80 border border-blue-500/30 rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col justify-between hover:border-blue-400/60 transition-all relative overflow-hidden"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${doc.badgeColor}`}>
                        {doc.category}
                      </span>
                      <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1">
                        <FileText className="size-3.5 text-sky-400" />
                        {doc.pages}
                      </span>
                    </div>

                    <h4 className="text-xl font-black text-white">{doc.title}</h4>
                    <p className="text-[11.5px] font-bold text-sky-300">{doc.subtitle}</p>
                    <p className="text-[12.5px] font-bold text-slate-300 leading-relaxed pt-1">
                      {doc.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-blue-900/60 flex flex-wrap gap-2.5">
                    <a
                      href={doc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                    >
                      <ExternalLink className="size-4" />
                      <span>Read PDF Document</span>
                    </a>

                    <a
                      href={doc.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-4 rounded-xl bg-blue-950 border border-blue-800 hover:bg-blue-900 text-sky-300 text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      title="Download PDF"
                    >
                      <Download className="size-4" />
                      <span className="hidden sm:inline">Save</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Jewish Culture & Traditions */}
        {activeTab === "culture" && (
          <div className="space-y-6 animate-spring-scale select-text">
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
