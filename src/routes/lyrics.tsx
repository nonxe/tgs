import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Music2,
  Search,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Sparkles,
  Disc,
  Mic2,
  Play,
  Heart,
  Share2,
} from "lucide-react";

interface LyricsResult {
  song: string;
  artist: string;
  lyrics: string;
}

function LyricsSearchPage() {
  const [query, setQuery] = useState("faded");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LyricsResult | null>(null);
  const [error, setError] = useState("");
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [copiedLine, setCopiedLine] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  const sampleSongs = [
    "Faded - Alan Walker",
    "Perfect - Ed Sheeran",
    "Believer - Imagine Dragons",
    "Starboy - The Weeknd",
    "Shape of You",
  ];

  const fetchLyrics = async (songQuery: string) => {
    if (!songQuery.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/lyrics/search?song=${encodeURIComponent(songQuery.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || "No lyrics found for this song.");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Failed to search lyrics.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search default "faded" on initial load
  useEffect(() => {
    fetchLyrics("faded");
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLyrics(query);
  };

  const handleCopyFull = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.song} - ${result.artist}\n\n${result.lyrics}`);
    setCopiedLyrics(true);
    setTimeout(() => setCopiedLyrics(false), 2000);
  };

  const handleCopyLineText = (line: string, idx: number) => {
    if (!line.trim()) return;
    navigator.clipboard.writeText(line.trim());
    setCopiedLine(line.trim());
    setActiveLineIndex(idx);
    setTimeout(() => setCopiedLine(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#000000] text-foreground font-sans relative selection:bg-white/20 pb-24 overflow-x-hidden">
      {/* Dark Ambient Lighting Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-b from-purple-900/15 via-pink-900/10 to-transparent blur-[120px] pointer-events-none" />

      {/* iOS Translucent Sticky Header */}
      <header className="px-4 sm:px-6 md:px-8 py-4 border-b border-zinc-800/80 sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="size-9 rounded-2xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-zinc-800/80 active:scale-95"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-zinc-900 text-pink-400 border border-zinc-800">
                  <Music2 className="size-4" />
                </span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Apple Lyrics
                </h1>
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-pink-400 border border-zinc-800 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5">
            <Mic2 className="size-3" />
            <span>LYRICS ENGINE</span>
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-7 relative z-10">
        {/* iOS Search Input */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search song title or artist name (e.g. Faded)..."
              className="w-full h-13 pl-12 pr-28 rounded-2xl bg-[#09090b] border border-zinc-800 text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 outline-none focus:border-pink-500/50 transition-all shadow-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <span>Search</span>}
            </button>
          </div>

          {/* Quick Sample Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {sampleSongs.map((song, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(song.split(" - ")[0]);
                  fetchLyrics(song);
                }}
                className="px-3 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                {song}
              </button>
            ))}
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="p-8 rounded-3xl border border-zinc-800 bg-[#09090b] text-center space-y-4 shadow-2xl">
            <Loader2 className="size-8 animate-spin mx-auto text-pink-400" />
            <p className="text-xs font-mono text-zinc-400">Fetching song lyrics from Cloud Gateway...</p>
          </div>
        )}

        {/* LYRICS DISPLAY CARD (Apple Music Style) */}
        {!loading && result && (
          <div className="space-y-6">
            {/* Track Header Card */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-[#09090b] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-5 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-pink-500/5 blur-3xl pointer-events-none rounded-full" />

              {/* Glowing Disc Artwork */}
              <div className="size-20 sm:size-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 shadow-xl shadow-pink-500/20 shrink-0 relative group">
                <div className="w-full h-full rounded-2xl bg-[#09090b] flex items-center justify-center overflow-hidden">
                  <Disc className="size-10 text-pink-400 animate-spin [animation-duration:8s]" />
                </div>
              </div>

              {/* Song & Artist Meta */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                  TRACK LYRICS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
                  {result.song}
                </h2>
                <p className="text-xs font-mono text-zinc-400">{result.artist}</p>
              </div>

              {/* Copy Full Lyrics Action */}
              <button
                onClick={handleCopyFull}
                className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shrink-0"
              >
                {copiedLyrics ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                <span>{copiedLyrics ? "Copied All" : "Copy Lyrics"}</span>
              </button>
            </div>

            {/* Apple Music Style Line-by-Line Lyrics Canvas */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-[#09090b]/90 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 text-[11px] font-mono text-zinc-500">
                <span>Click any line to copy</span>
                <span>Apple Music Lyrics View</span>
              </div>

              <div className="space-y-4 text-center sm:text-left leading-loose font-sans">
                {result.lyrics.split("\n").map((line, idx) => {
                  const isBlank = !line.trim();
                  if (isBlank) {
                    return <div key={idx} className="h-4" />;
                  }

                  const isCopied = copiedLine === line.trim() && activeLineIndex === idx;

                  return (
                    <p
                      key={idx}
                      onClick={() => handleCopyLineText(line, idx)}
                      className={`text-sm sm:text-base md:text-lg font-bold transition-all duration-200 cursor-pointer px-3 py-1.5 rounded-xl ${
                        isCopied
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 scale-[1.01]"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:scale-[1.01]"
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export const Route = createFileRoute("/lyrics")({
  component: LyricsSearchPage,
  head: () => ({
    meta: [
      { title: "Apple Music Lyrics • Search Song Lyrics" },
      { name: "description", content: "Minimalist iOS Apple Music style lyrics viewer with line-by-line interactive display." },
    ],
  }),
});
