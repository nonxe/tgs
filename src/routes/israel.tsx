import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
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
  Scroll,
  Calendar,
  Feather,
  FileText,
  ExternalLink,
  BookMarked,
  Download,
  Star,
  ListFilter,
  Music,
  Mic2
} from "lucide-react";

export const Route = createFileRoute("/israel")({
  head: () => ({
    meta: [
      { title: "Way to Israel — History, Live Lyrics & Jewish Heritage" },
      { name: "description", content: "Comprehensive history of Israel, time-synced lyrics for Am Yisrael Chai, sacred scriptures, and culture." },
    ],
  }),
  component: WayToIsraelPage,
});

interface LyricLine {
  id: number;
  start: number;
  end: number;
  hebrew: string;
  transliteration: string;
  translation: string;
}

const songLyrics: LyricLine[] = [
  {
    id: 0,
    start: 0,
    end: 12,
    hebrew: "🎵 [פתיחה מוזיקלית עוצמתית] 🎵",
    transliteration: "🎵 [Opening Instrumental] 🎵",
    translation: "Symphonic prelude of hope, resilience, and unity"
  },
  {
    id: 1,
    start: 12,
    end: 20,
    hebrew: "ארץ ואיש, אש ודמעות",
    transliteration: "Eretz v'eesh, esh v'dmaot",
    translation: "Land and man, fire and tears"
  },
  {
    id: 2,
    start: 20,
    end: 28,
    hebrew: "מתוך העפר, קם עם של גבורות",
    transliteration: "Mitoch he'afar, kam am shel gvurot",
    translation: "Out of the ashes rises a nation of heroes"
  },
  {
    id: 3,
    start: 28,
    end: 36,
    hebrew: "קול דמי אחינו צועקים מן האדמה",
    transliteration: "Kol dmei acheinu tzo'akim min ha'adama",
    translation: "The voices of our brethren cry out from the earth"
  },
  {
    id: 4,
    start: 36,
    end: 44,
    hebrew: "אבל הרוח לא תישבר לעולם",
    transliteration: "Avel haruach lo tishever le'olam",
    translation: "Yet our spirit shall never be broken"
  },
  {
    id: 5,
    start: 44,
    end: 52,
    hebrew: "עם ישראל חי! עם ישראל חי!",
    transliteration: "Am Yisrael Chai! Am Yisrael Chai!",
    translation: "The People of Israel Live! The People of Israel Live!"
  },
  {
    id: 6,
    start: 52,
    end: 60,
    hebrew: "עוד אבינו חי!",
    transliteration: "Od Avinu Chai!",
    translation: "Our Father still lives!"
  },
  {
    id: 7,
    start: 60,
    end: 68,
    hebrew: "מדור לדור, באור ובדממה",
    transliteration: "Midor l'dor, b'or u'bdmama",
    translation: "From generation to generation, in light and quiet strength"
  },
  {
    id: 8,
    start: 68,
    end: 76,
    hebrew: "יחד נעמוד, כי אין לנו ארץ אחרת",
    transliteration: "Yachad na'amod, ki ein lanu eretz acheret",
    translation: "Together we stand, for we have no other home"
  },
  {
    id: 9,
    start: 76,
    end: 84,
    hebrew: "עם ישראל חי! עוד אבינו חי!",
    transliteration: "Am Yisrael Chai! Od Avinu Chai!",
    translation: "The People of Israel Live! Our Father still lives!"
  },
  {
    id: 10,
    start: 84,
    end: 94,
    hebrew: "🎷 [מעבר מוזיקלי נשמתי] 🎷",
    transliteration: "🎷 [Soulful Musical Interlude] 🎷",
    translation: "A moment of reflection and collective strength"
  },
  {
    id: 11,
    start: 94,
    end: 104,
    hebrew: "בתוך הסערה, שומרים על התקווה",
    transliteration: "Btoch hasa'ara, shomrim al hatikva",
    translation: "In the midst of the storm, we guard our eternal hope"
  },
  {
    id: 12,
    start: 104,
    end: 114,
    hebrew: "האור שבלב, מאיר את הלילה",
    transliteration: "Ha'or shebalev, me'ir et halaila",
    translation: "The light within our hearts illuminates the dark night"
  },
  {
    id: 13,
    start: 114,
    end: 124,
    hebrew: "תפילת האבות, שיר של לוחמים",
    transliteration: "Tfilat ha'avot, shir shel lochamim",
    translation: "The prayer of our ancestors, an anthem of brave guardians"
  },
  {
    id: 14,
    start: 124,
    end: 134,
    hebrew: "כי נצח ישראל לא ישקר",
    transliteration: "Ki netzach Yisrael lo yeshaker",
    translation: "For the Eternity of Israel shall never fail"
  },
  {
    id: 15,
    start: 134,
    end: 144,
    hebrew: "עם ישראל חי! עם ישראל חי!",
    transliteration: "Am Yisrael Chai! Am Yisrael Chai!",
    translation: "The People of Israel Live! The People of Israel Live!"
  },
  {
    id: 16,
    start: 144,
    end: 154,
    hebrew: "עוד אבינו חי! עוד אבינו חי!",
    transliteration: "Od Avinu Chai! Od Avinu Chai!",
    translation: "Our Father still lives! Our Father still lives!"
  },
  {
    id: 17,
    start: 154,
    end: 166,
    hebrew: "יחד נעמוד, כי אין לנו ארץ אחרת",
    transliteration: "Yachad na'amod, ki ein lanu eretz acheret",
    translation: "Together we stand, for we have no other homeland"
  },
  {
    id: 18,
    start: 166,
    end: 180,
    hebrew: "תפילת הדורות, תקווה ללא קץ — עם ישראל חי!",
    transliteration: "Tfilat hadorot, tikva lelo ketz — Am Yisrael Chai!",
    translation: "The prayer of all generations, endless hope — The People of Israel Live!"
  },
  {
    id: 19,
    start: 180,
    end: 240,
    hebrew: "✨ עם ישראל חי! ✨ [סיום מוזיקלי מרומם]",
    transliteration: "✨ Am Yisrael Chai! ✨ [Exalted Finale]",
    translation: "Eternal blessing and triumphant finale of unity"
  }
];

function WayToIsraelPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "texts" | "culture">("history");
  const [historyViewMode, setHistoryViewMode] = useState<"interactive" | "full">("interactive");
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

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

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Find active lyric index based on video currentTime
  const currentLyricIndex = songLyrics.findIndex(
    (line) => currentTime >= line.start && currentTime < line.end
  );
  const activeLyric = currentLyricIndex !== -1 ? songLyrics[currentLyricIndex] : songLyrics[0];

  // Auto-scroll lyrics container to keep active line centered
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex !== -1) {
      const activeElement = lyricsContainerRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentLyricIndex]);

  const sacredTexts = [
    {
      title: "The Tanakh (Hebrew Bible)",
      subtitle: "Torah, Nevi'im (Prophets) & Ketuvim (Writings)",
      pdfUrl: "https://ferrusca.wordpress.com/wp-content/uploads/2016/11/thetanakh.pdf",
      desc: "The complete 24-book canon of the Hebrew Scriptures translated into English. Encompasses foundational law, historical chronicles of ancient Israel, poetic psalms, and prophetic literature.",
      category: "Canonical Scripture",
      badgeColor: "bg-blue-500/10 text-sky-400 border-blue-500/20"
    },
    {
      title: "The Torah (Five Books of Moses)",
      subtitle: "Genesis, Exodus, Leviticus, Numbers & Deuteronomy",
      pdfUrl: "https://www.betemunah.org/Torah.pdf",
      desc: "The sacred centerpiece of Jewish law and spiritual guidance, revealed at Mount Sinai. Contains the origins of creation, the patriarchs, the Exodus, and the 613 Mitzvot.",
      category: "Foundational Law",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
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
      color: "from-blue-600/10 to-sky-500/10 border-blue-500/20",
      desc: "The weekly Sabbath from Friday sunset to Saturday night. A sacred sanctuary in time devoted to family, prayer, traditional meals (Challah, Kiddush), and spiritual reflection."
    },
    {
      title: "Hebrew Language Revival",
      icon: Feather,
      color: "from-cyan-600/10 to-blue-500/10 border-cyan-500/20",
      desc: "An unprecedented linguistic achievement: Eliezer Ben-Yehuda and modern pioneers revived biblical Hebrew into a spoken modern language spoken by millions today."
    },
    {
      title: "Kibbutz & Start-Up Nation",
      icon: Compass,
      color: "from-amber-600/10 to-yellow-500/10 border-amber-500/20",
      desc: "From early agricultural communes to the world's leading technology 'Start-Up Nation', Israel combines ancient pioneer spirit with high-tech innovation."
    },
    {
      title: "Festivals of Remembrance",
      icon: Calendar,
      color: "from-indigo-600/10 to-blue-500/10 border-indigo-500/20",
      desc: "High Holy Days (Rosh Hashanah, Yom Kippur), Passover (Pesach), Hanukkah (Festival of Lights), and Sukkot connect modern Israelis to thousands of years of heritage."
    }
  ];

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative overflow-x-hidden select-none pb-24">
      {/* Dark Ambient Lighting */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-blue-600/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] bg-sky-500/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-indigo-600/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="px-6 py-4 border-b border-white/10 backdrop-blur-3xl sticky top-0 z-40 bg-[#030712]/80 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9.5 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-slate-800/80 active:scale-95 transition-all text-white shadow-lg"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-9.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Compass className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight leading-none text-white">
                WAY TO ISRAEL
              </h1>
              <p className="text-[9.5px] text-slate-400 font-semibold tracking-wider mt-0.5">Heritage, Scriptures & History</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
            <Shield className="size-3 text-sky-400" />
            <span>Jewish Culture & History</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <section className="relative max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-8">

        {/* Featured Video + Animated Lyrics Section */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-xl group">
          <video
            ref={videoRef}
            src="https://files.catbox.moe/s6mzcv.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-5 sm:p-6 pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-[11px] font-semibold">
                <Music className="size-3.5 text-sky-400" />
                <span>Am Yisrael Chai</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Synchronized Lyrics Toggle Button */}
                <button
                  onClick={() => setShowLyricsPanel(!showLyricsPanel)}
                  className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    showLyricsPanel
                      ? "bg-blue-600 border-sky-400 text-white shadow-lg shadow-blue-600/40"
                      : "bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Mic2 className="size-3.5 text-sky-300" />
                  <span>{showLyricsPanel ? "Hide Lyrics" : "Live Lyrics"}</span>
                </button>

                <button
                  onClick={toggleMute}
                  className="size-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Overlay: Title & Dynamic Live Lyric Subtitle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto">
              <div className="max-w-xl space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  עם ישראל חי — Am Yisrael Chai
                </h3>

                {/* SMOOTH ANIMATED LIVE LYRIC SUBTITLE BAR */}
                {activeLyric && (
                  <div className="bg-slate-950/80 backdrop-blur-xl border border-sky-400/30 px-3.5 py-2 rounded-2xl transition-all duration-500 animate-fadeIn">
                    <p className="text-[13.5px] font-bold text-sky-300 leading-tight">
                      {activeLyric.hebrew}
                    </p>
                    <p className="text-[11.5px] font-medium text-slate-200 mt-0.5">
                      {activeLyric.transliteration} • <span className="text-slate-400 italic">{activeLyric.translation}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={togglePlay}
                className="size-12 rounded-full bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              >
                {isPlaying ? <Pause className="size-5 fill-slate-950" /> : <Play className="size-5 fill-slate-950 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* FULL SYNCHRONIZED LIVE LYRICS DRAWER / PANEL */}
        {showLyricsPanel && (
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-2xl shadow-2xl animate-spring-scale select-text">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Mic2 className="size-4 text-sky-400" />
                <h4 className="text-base font-black text-white">Synchronized Live Lyrics</h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 border border-white/5 px-2.5 py-1 rounded-full">
                Click any line to jump
              </span>
            </div>

            <div
              ref={lyricsContainerRef}
              className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-600/40"
            >
              {songLyrics.map((line, idx) => {
                const isActive = idx === currentLyricIndex;
                return (
                  <div
                    key={line.id}
                    onClick={() => seekTo(line.start)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? "bg-blue-600/20 border-sky-400/60 text-white shadow-lg shadow-blue-600/10 scale-[1.01]"
                        : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className={`text-[14px] font-black ${isActive ? "text-sky-300" : "text-slate-200"}`}>
                        {line.hebrew}
                      </p>
                      <p className="text-[12px] font-medium">
                        {line.transliteration} <span className="opacity-70">— {line.translation}</span>
                      </p>
                    </div>

                    <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full border ${
                      isActive
                        ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                        : "bg-slate-900 text-slate-500 border-white/5"
                    }`}>
                      {Math.floor(line.start / 60)}:{String(Math.floor(line.start % 60)).padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ISRAELI FLAG DISPLAY VIDEO CARD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Clean High Quality Wavy Flag Video Container */}
          <div className="md:col-span-5 flex justify-center py-1">
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black group">
              <video
                src="https://d34w7g4gy10iej.cloudfront.net/video/2410/DOD_110644143/DOD_110644143.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
            </div>
          </div>

          {/* Flag Symbolism & History */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              <Star className="size-3 text-sky-400 fill-sky-400" />
              <span>National Symbol</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              The Flag of Israel
            </h2>

            <p className="text-[13px] font-normal text-slate-300 leading-relaxed">
              Designed in 1891 and officially adopted in 1948, the flag features two horizontal blue stripes on a white field inspired by the traditional <strong>Tallit</strong> (Jewish prayer shawl). At its center rests the <strong>Magen David</strong> (Star of David), signifying divine protection and national identity.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-200">
                <Scroll className="size-3.5 text-sky-400" />
                <span>Tallit Prayer Shawl Stripes</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-200">
                <Star className="size-3.5 text-amber-400" />
                <span>Magen David (Shield of David)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex justify-center border-b border-white/10 pb-1 pt-2">
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 max-w-md w-full backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="size-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab("texts")}
              className={`py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "texts"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookMarked className="size-3.5" />
              <span>Scriptures</span>
            </button>

            <button
              onClick={() => setActiveTab("culture")}
              className={`py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "culture"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>Culture</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HISTORY OF ISRAEL */}
        {activeTab === "history" && (
          <div className="space-y-6 select-text">
            {/* View Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <BookOpen className="size-4 text-sky-400" />
                <span>Reading View:</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setHistoryViewMode("interactive")}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    historyViewMode === "interactive"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  <ListFilter className="size-3.5" />
                  <span>Timeline View</span>
                </button>
                <button
                  onClick={() => setHistoryViewMode("full")}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    historyViewMode === "full"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Article View</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE TIMELINE VIEW */}
            {historyViewMode === "interactive" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    History of Israel Through Jewish Experience
                  </h3>
                  <p className="text-[12.5px] font-medium text-slate-400 max-w-2xl mx-auto">
                    Select an era to explore key historical events and narratives chronologically.
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
                          ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-[1.02]"
                          : "bg-slate-900/60 border-white/10 hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">{p.part}</span>
                      <span className="text-[12px] font-bold leading-tight line-clamp-1 mt-1">{p.title}</span>
                      <span className="text-[9px] text-slate-400 mt-1 block">{p.period}</span>
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
                        className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-[10.5px] font-bold">
                              {p.part}
                            </span>
                            <h4 className="text-xl font-black text-white">{p.title}</h4>
                          </div>
                          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                            {p.period}
                          </span>
                        </div>

                        <p className="text-[13px] text-slate-300 italic leading-relaxed">
                          "{p.summary}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {p.sections.map((sec, sIdx) => (
                            <div key={sIdx} className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-2">
                              <h5 className="text-[13.5px] font-bold text-sky-300 flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-blue-400" />
                                {sec.heading}
                              </h5>
                              <p className="text-[12px] text-slate-300 leading-relaxed font-normal">
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
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl backdrop-blur-xl leading-relaxed text-slate-200">
                <div className="border-b border-white/10 pb-6 text-center space-y-3">
                  <span className="px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold">
                    Unabridged Historical Account
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    The History of Israel: Through Jewish Eyes
                  </h2>
                  <p className="text-[13.5px] text-slate-400 max-w-3xl mx-auto italic font-normal">
                    A vast tapestry woven over millennia—a spiritual, cultural, and national saga of a people, their land, and their enduring covenant.
                  </p>
                </div>

                {/* Part I */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part I: The Biblical Foundations (c. 2000 BCE – 586 BCE)
                  </h3>
                  <div className="space-y-3 text-[13px] font-normal text-slate-300">
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

                {/* Part II */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part II: The Second Temple Period (c. 538 BCE – 70 CE)
                  </h3>
                  <div className="space-y-3 text-[13px] font-normal text-slate-300">
                    <p>
                      <strong>Return to Zion & Maccabean Revolt:</strong> Persian King Cyrus allowed the Jews to return and rebuild the Second Temple. In 165 BCE, Judah the Maccabee defeated Greek oppressors, re-dedicating the Temple—a miracle celebrated on <strong>Hanukkah</strong>.
                    </p>
                    <p>
                      <strong>Roman Destruction (70 CE):</strong> Rome annexed Judea, culminating in the First Jewish-Roman War. In 70 CE, Roman legions burned the Second Temple. A second uprising—the <strong>Bar Kokhba Revolt</strong> (132–135 CE)—was crushed, prompting Rome to rename the land "Syria Palaestina" and disperse the Jewish people into global Diaspora.
                    </p>
                  </div>
                </div>

                {/* Part III */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part III: The Long Exile & The Rise of Zionism
                  </h3>
                  <div className="space-y-3 text-[13px] font-normal text-slate-300">
                    <p>
                      <strong>Rabbinic Judaism & Cultural Centers:</strong> Denied a physical Temple, rabbinic leaders compiled the Mishnah and Talmud, enabling a "portable homeland" of scripture. Two major cultural centers flourished: <strong>Ashkenazim</strong> in Central/Eastern Europe and <strong>Sephardim</strong> in Spain & Portugal.
                    </p>
                    <p>
                      <strong>Political Zionism:</strong> Facing centuries of expulsions and pogroms, Theodor Herzl founded political Zionism in 1897 at the First Zionist Congress in Basel, advocating for Jewish self-determination in their ancestral land.
                    </p>
                  </div>
                </div>

                {/* Part IV */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part IV: The Road to Statehood (19th Century – 1948)
                  </h3>
                  <div className="space-y-3 text-[13px] font-normal text-slate-300">
                    <p>
                      <strong>Pioneers & Balfour Declaration:</strong> Early pioneers (Halutzim) returned in waves of Aliyah to build kibbutzim and revive Hebrew. In 1917, Britain issued the Balfour Declaration supporting a Jewish national home.
                    </p>
                    <p>
                      <strong>The Holocaust & May 14, 1948 Statehood:</strong> The Nazi genocide of six million Jews demonstrated the absolute necessity of a sovereign state. On May 14, 1948, David Ben-Gurion proclaimed the State of Israel, realizing a 2,000-year dream.
                    </p>
                  </div>
                </div>

                {/* Part V */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-xl font-black text-sky-300 border-l-4 border-blue-500 pl-3">
                    Part V: The Modern State of Israel (1948 – Present)
                  </h3>
                  <div className="space-y-3 text-[13px] font-normal text-slate-300">
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
          <div className="space-y-6 select-text">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">Sacred Jewish Scriptures</h3>
              <p className="text-[12.5px] text-slate-400 font-medium">Read official digital editions of Tanakh & Torah</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sacredTexts.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all relative overflow-hidden"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${doc.badgeColor}`}>
                        {doc.category}
                      </span>
                    </div>

                    <h4 className="text-xl font-black text-white">{doc.title}</h4>
                    <p className="text-[11.5px] font-semibold text-sky-400">{doc.subtitle}</p>
                    <p className="text-[12.5px] text-slate-300 leading-relaxed font-normal pt-1">
                      {doc.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2.5">
                    <a
                      href={doc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      <ExternalLink className="size-4" />
                      <span>Read Document</span>
                    </a>

                    <a
                      href={doc.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-4 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-200 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
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
          <div className="space-y-6 select-text">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">Pillars of Jewish Culture</h3>
              <p className="text-[12.5px] text-slate-400 font-medium">Timeless traditions defining identity, community, and heritage</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {culturalPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${item.color} border rounded-3xl p-6 space-y-3 backdrop-blur-xl shadow-xl hover:scale-[1.01] transition-transform`}
                  >
                    <div className="size-11 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-sky-400">
                      <Icon className="size-5.5" />
                    </div>
                    <h4 className="text-lg font-black text-white">{item.title}</h4>
                    <p className="text-[12.5px] text-slate-300 leading-relaxed font-normal">{item.desc}</p>
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
