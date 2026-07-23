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
  CheckCircle2,
  ListFilter,
  ChevronRight
} from "lucide-react";

export const Route = createFileRoute("/israel")({
  head: () => ({
    meta: [
      { title: "Way to Israel — History, Sacred Texts & Jewish Culture" },
      { name: "description", content: "Complete history of Israel through the Jewish experience, sacred Tanakh and Torah PDFs, culture and heritage." },
    ],
  }),
  component: WayToIsraelPage,
});

function WayToIsraelPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "texts" | "culture">("history");
  const [historyViewMode, setHistoryViewMode] = useState<"interactive" | "full">("interactive");
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
      desc: "The complete 24-book canon of the Hebrew Scriptures translated in English. Encompasses foundational law, historic chronicles of ancient Israel, poetic psalms, and prophetic literature.",
      pages: "Full Edition PDF",
      category: "Canonical Scripture",
      badgeColor: "bg-blue-500/20 text-sky-300 border-blue-500/30"
    },
    {
      title: "The Torah (Five Books of Moses)",
      subtitle: "Genesis, Exodus, Leviticus, Numbers & Deuteronomy",
      pdfUrl: "https://www.betemunah.org/Torah.pdf",
      desc: "The sacred centerpiece of Jewish law and spiritual guidance, revealed at Mount Sinai. Contains the origins of creation, the patriarchs, the Exodus, and the 613 Mitzvot.",
      pages: "Study Edition PDF",
      category: "Foundational Law",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    }
  ];

  const historyParts = [
    {
      part: "Part I",
      period: "c. 2000 BCE – 586 BCE",
      title: "The Biblical Foundations",
      summary: "The covenant with Abraham, enslavement and Exodus from Egypt, Sinai revelation, King David's kingdom in Jerusalem, King Solomon's First Temple, and the Babylonian Exile.",
      sections: [
        {
          heading: "The Patriarchal Age",
          content: "Jewish history begins 4,000 years ago with Abraham, Isaac, and Jacob. Summonsed from Ur of the Chaldeans to Canaan, Abraham established a monotheistic people bound by the Brit (Covenant). Jacob was renamed Israel ('he who strives with God') and fathered the Twelve Tribes of Israel."
        },
        {
          heading: "From Slavery to Nationhood: Exodus & Torah",
          content: "Multiplied and enslaved in Egypt for 400 years, the Children of Israel were liberated under Moses in the Exodus. During 40 years in the Sinai desert, they received the Torah and Ten Commandments at Mount Sinai—an event commemorated annually on Passover (Pesach)."
        },
        {
          heading: "Conquest, Judges & The United Monarchy",
          content: "After settling Canaan under Joshua and the Judges, the tribes united under King Saul (c. 1020 BCE), King David (c. 1004 BCE) who established Jerusalem as the capital, and King Solomon (c. 965 BCE) who constructed the First Temple on Mount Moriah."
        },
        {
          heading: "The Divided Kingdoms & Babylonian Exile",
          content: "The kingdom split into Israel (North) and Judah (South). Prophets like Isaiah and Jeremiah called for moral righteousness. In 586 BCE, Babylonians under Nebuchadnezzar destroyed the First Temple and exiled the Jews to Babylon for 70 years, giving birth to synagogue worship."
        }
      ]
    },
    {
      part: "Part II",
      period: "c. 538 BCE – 70 CE",
      title: "The Second Temple Period",
      summary: "Return to Zion under Persian King Cyrus, rebuilding of the Temple, Maccabean Revolt against Greek rule, Roman siege, and the tragic destruction in 70 CE.",
      sections: [
        {
          heading: "Return to Zion & Rebuilding",
          content: "In 538 BCE, Persian King Cyrus the Great issued a decree permitting exiled Jews to return to Jerusalem and rebuild the Second Temple, restoring communal spiritual life."
        },
        {
          heading: "Greek Era & Maccabean Revolt",
          content: "Alexander the Great brought Greek rule. When Hellenizing reforms tried to outlaw Jewish worship, Judah the Maccabee led the 165 BCE Maccabean Revolt, re-dedicating the Temple—a victory celebrated on Hanukkah."
        },
        {
          heading: "Roman Siege & Temple Destruction",
          content: "Roman legions occupied Judea in 66 BCE. Escalating oppression sparked the First Jewish-Roman War (66–70 CE). In 70 CE, Roman general Titus destroyed Jerusalem and burned the Second Temple."
        },
        {
          heading: "Bar Kokhba Revolt & Great Diaspora",
          content: "Simon Bar Kokhba led a desperate second revolt (132–135 CE). Upon crushing it, Rome renamed Judea 'Syria Palaestina' and banned Jews from Jerusalem, initiating 1,900 years of global exile."
        }
      ]
    },
    {
      part: "Part III",
      period: "70 CE – 19th Century",
      title: "The Long Exile: The Diaspora",
      summary: "Shift to Rabbinic Judaism, Mishnah & Talmud compilation, Ashkenaz and Sepharad cultural centers, centuries of persecution, and the birth of modern Zionism.",
      sections: [
        {
          heading: "Talmudic & Rabbinic Transformation",
          content: "With the Temple gone, rabbinic leaders centered Judaism around synagogues, Torah study, and the compilation of the Mishnah and Gemara (Talmud)—creating a portable spiritual homeland."
        },
        {
          heading: "Ashkenazim & Sephardim Flourishing",
          content: "Jewish life developed two major branches: Ashkenazim in Central/Eastern Europe (developing Yiddish) and Sephardim in Spain & Portugal (experiencing a Golden Age of poetry and philosophy)."
        },
        {
          heading: "Persecutions & Expulsions",
          content: "Diaspora life faced severe trials: Crusaders massacres, expulsions from England (1290) and Spain (1492), and Russian imperial pogroms in the Pale of Settlement."
        },
        {
          heading: "The Rise of Zionism",
          content: "Spurred by persistent antisemitism and ancient prayers for Zion, Theodor Herzl founded political Zionism, convening the First Zionist Congress in Basel (1897) to advocate for a sovereign Jewish national home."
        }
      ]
    },
    {
      part: "Part IV",
      period: "19th Century – 1948",
      title: "The Road to Statehood",
      summary: "Waves of Aliyah pioneers, Hebrew revival, Balfour Declaration (1917), British Mandate, the tragic Holocaust, UN Partition Plan, and May 14, 1948 Independence.",
      sections: [
        {
          heading: "First Aliyahs & Hebrew Revival",
          content: "Jewish pioneers (Halutzim) returned to drain swamps, build agricultural kibbutzim, and under Eliezer Ben-Yehuda, revived biblical Hebrew into a spoken living language."
        },
        {
          heading: "Balfour Declaration & British Mandate",
          content: "In 1917, Britain issued the Balfour Declaration supporting a Jewish national home in Palestine. The League of Nations later ratified the British Mandate (1920–1948)."
        },
        {
          heading: "The Holocaust (Shoah)",
          content: "The Nazi murder of six million European Jews (1939–1945) proved the absolute existential necessity of an independent Jewish state where Jews could defend themselves."
        },
        {
          heading: "May 14, 1948: Rebirth of Israel",
          content: "Following the 1947 UN Partition Plan, David Ben-Gurion proclaimed the State of Israel in Tel Aviv on May 14, 1948, fulfilling 2,000 years of collective longing."
        }
      ]
    },
    {
      part: "Part V",
      period: "1948 – Present",
      title: "The Modern State of Israel",
      summary: "1948 War of Independence, ingathering of 850,000+ Middle Eastern Jewish refugees, 1967 Six-Day War & Jerusalem reunification, Start-Up Nation innovation.",
      sections: [
        {
          heading: "War of Independence & Refugee Ingathering",
          content: "Israel survived invasion by five Arab armies in 1948. Over the next decade, Israel doubled its population by welcoming Holocaust survivors and over 850,000 Mizrahi/Sephardi refugees from Arab lands."
        },
        {
          heading: "1967 Six-Day War & Reunification",
          content: "In 1967, Israel defeated hostile Arab armies, reunifying Jerusalem and restoring Jewish access to the Western Wall (Kotel), the holiest prayer site."
        },
        {
          heading: "Modern Innovation & Global Heritage",
          content: "Today Israel is a global high-tech, medical, and scientific leader ('Start-Up Nation') while preserving its rich ancient spiritual heritage."
        }
      ]
    }
  ];

  const culturalPillars = [
    {
      title: "Shabbat (Rest & Spiritual Renewal)",
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
      title: "Kibbutz & Start-Up Nation",
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
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-blue-600/15 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] bg-sky-500/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-indigo-600/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
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
              <p className="text-[9px] text-sky-400 font-black tracking-widest uppercase mt-0.5">Am Yisrael Chai • Heritage & History</p>
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

      {/* Main Container */}
      <section className="relative max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-8">

        {/* Featured Video Section */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-blue-950/40 shadow-[0_20px_60px_rgba(0,56,184,0.25)] group">
          <video
            ref={videoRef}
            src="https://files.catbox.moe/s6mzcv.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

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

        {/* ULTRA SMOOTH & REALISTIC ISRAELI FLAG DISPLAY VIDEO */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-br from-blue-950/70 via-slate-950/90 to-blue-950/70 border border-blue-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Real High Quality Wavy Flag Video Container */}
          <div className="md:col-span-5 flex justify-center py-2">
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,56,184,0.4)] border border-blue-400/40 bg-black group">
              <video
                src="https://d34w7g4gy10iej.cloudfront.net/video/2410/DOD_110644143/DOD_110644143.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase text-sky-300 tracking-wider border border-sky-400/30 flex items-center gap-1.5">
                <Sparkles className="size-3 text-sky-400" />
                <span>Live HD Waving Flag</span>
              </div>
            </div>
          </div>

          {/* Flag Meaning Details */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              <Star className="size-3 text-sky-400 fill-sky-400" />
              <span>Flag of Israel • Symbolism</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              The Flag of Israel: Banner of Hope
            </h2>

            <p className="text-[13px] font-bold text-slate-300 leading-relaxed">
              Designed in 1891 and officially adopted in 1948, the Israeli flag features two horizontal blue stripes on a white field inspired by the traditional <strong>Tallit</strong> (Jewish prayer shawl). At its center rests the <strong>Magen David</strong> (Star of David), signifying divine protection and eternal identity.
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

        {/* Main Tab Navigation */}
        <div className="flex justify-center border-b border-blue-900/60 pb-1 pt-2">
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
              <span>History Chronicle</span>
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
              <span>Sacred Scriptures</span>
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

        {/* TAB 1: HISTORY OF ISRAEL */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-spring-scale select-text">
            {/* View Mode Toggle: Interactive vs Full Reader */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-blue-950/50 p-3 rounded-2xl border border-blue-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <BookOpen className="size-4 text-sky-400" />
                <span>Select History View Mode:</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setHistoryViewMode("interactive")}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    historyViewMode === "interactive"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-blue-950 text-slate-400 hover:text-white border border-blue-900"
                  }`}
                >
                  <ListFilter className="size-3.5" />
                  <span>5-Part Interactive</span>
                </button>
                <button
                  onClick={() => setHistoryViewMode("full")}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    historyViewMode === "full"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-blue-950 text-slate-400 hover:text-white border border-blue-900"
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Full Article Reader</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE MODE */}
            {historyViewMode === "interactive" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    History of Israel Through the Jewish Lens
                  </h3>
                  <p className="text-[12.5px] font-bold text-slate-400 max-w-2xl mx-auto">
                    Select any era below to explore specific historical sections or read all five parts chronologically.
                  </p>
                </div>

                {/* Part Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {historyParts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPart(selectedPart === idx ? null : idx)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
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

                {/* Parts Display */}
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

            {/* FULL ARTICLE READER MODE */}
            {historyViewMode === "full" && (
              <div className="bg-gradient-to-br from-blue-950/90 via-slate-950 to-blue-950/90 border border-blue-500/30 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl leading-relaxed text-slate-200">
                <div className="border-b border-blue-900/60 pb-6 text-center space-y-3">
                  <span className="px-3.5 py-1 rounded-full bg-blue-600/30 border border-sky-400/40 text-sky-300 text-[11px] font-black uppercase tracking-widest">
                    Complete Unabridged Chronicle
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    The History of Israel: Through Jewish Eyes
                  </h2>
                  <p className="text-[13.5px] font-bold text-slate-400 max-w-3xl mx-auto italic">
                    A vast and intricate tapestry woven over millennia—a spiritual, cultural, and national saga of a people, their land, and their enduring covenant.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part I: The Biblical Foundations (c. 2000 BCE – 586 BCE)
                  </h3>
                  <div className="space-y-3 text-[13px] font-medium text-slate-300">
                    <p>
                      <strong>The Patriarchal Age:</strong> History begins around 4,000 years ago with Abraham, Isaac, and Jacob. Summonsed from Ur of the Chaldeans to Canaan, Abraham established a monotheistic people bound by the <em>Brit</em> (Covenant). Jacob was renamed <strong>Israel</strong> ("he who strives with God") and fathered the Twelve Tribes of Israel.
                    </p>
                    <p>
                      <strong>Exodus & Torah:</strong> Enslaved in Egypt for 400 years, the Israelites were led by Moses out of Egypt in the Exodus. At Mount Sinai, they received the Torah and the Ten Commandments, establishing their divine moral law—commemorated annually on Passover.
                    </p>
                    <p>
                      <strong>The Monarchy & Jerusalem:</strong> King David (c. 1004 BCE) unified the nation and declared Jerusalem the eternal capital. King Solomon built the First Temple on Mount Moriah, creating the spiritual heart of Israel.
                    </p>
                    <p>
                      <strong>Exile to Babylon:</strong> In 586 BCE, King Nebuchadnezzar of Babylon destroyed Jerusalem and the First Temple, exiling the Jewish population. During 70 years in Babylon, Jewish identity was forged anew through synagogue prayer and Torah study.
                    </p>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-4 pt-4 border-t border-blue-900/40">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part II: The Second Temple Period (c. 538 BCE – 70 CE)
                  </h3>
                  <div className="space-y-3 text-[13px] font-medium text-slate-300">
                    <p>
                      <strong>Return to Zion & Maccabean Revolt:</strong> Persian King Cyrus allowed the Jews to return and rebuild the Second Temple. In 165 BCE, Judah the Maccabee defeated Greek oppressors, re-dedicating the Temple—a miracle celebrated on <strong>Hanukkah</strong>.
                    </p>
                    <p>
                      <strong>Roman Destruction (70 CE):</strong> Rome annexed Judea, culminating in the First Jewish-Roman War. In 70 CE, Roman legions burned the Second Temple. A second uprising—the <strong>Bar Kokhba Revolt</strong> (132–135 CE)—was crushed, prompting Rome to rename the land "Syria Palaestina" and disperse the Jewish people into global Diaspora.
                    </p>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-4 pt-4 border-t border-blue-900/40">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part III: The Long Exile & The Rise of Zionism
                  </h3>
                  <div className="space-y-3 text-[13px] font-medium text-slate-300">
                    <p>
                      <strong>Rabbinic Judaism & Cultural Centers:</strong> Denied a physical Temple, rabbinic leaders compiled the Mishnah and Talmud, enabling a "portable homeland" of scripture. Two major cultural centers flourished: <strong>Ashkenazim</strong> in Central/Eastern Europe and <strong>Sephardim</strong> in Spain & Portugal.
                    </p>
                    <p>
                      <strong>Political Zionism:</strong> Facing centuries of expulsions and pogroms, Theodor Herzl founded political Zionism in 1897 at the First Zionist Congress in Basel, advocating for Jewish self-determination in their ancestral land.
                    </p>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-4 pt-4 border-t border-blue-900/40">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part IV: The Road to Statehood (19th Century – 1948)
                  </h3>
                  <div className="space-y-3 text-[13px] font-medium text-slate-300">
                    <p>
                      <strong>Pioneers & Balfour Declaration:</strong> Early pioneers (Halutzim) returned in waves of Aliyah to build kibbutzim and revive Hebrew. In 1917, Britain issued the Balfour Declaration supporting a Jewish national home.
                    </p>
                    <p>
                      <strong>The Holocaust & May 14, 1948 Statehood:</strong> The Nazi genocide of six million Jews demonstrated the absolute necessity of a sovereign state. On May 14, 1948, David Ben-Gurion proclaimed the State of Israel, realizing a 2,000-year dream.
                    </p>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-4 pt-4 border-t border-blue-900/40">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part V: The Modern State of Israel (1948 – Present)
                  </h3>
                  <div className="space-y-3 text-[13px] font-medium text-slate-300">
                    <p>
                      Israel absorbed over 850,000 Mizrahi and Sephardi refugees from Arab lands alongside European survivors. Reunifying Jerusalem in the 1967 Six-Day War, modern Israel stands today as a flourishing democratic nation, high-tech global leader, and vibrant center of Jewish life.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Sacred Scriptures (Tanakh & Torah PDFs) */}
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
