import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Youtube,
  ArrowLeft,
  Search,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Sparkles,
  Film,
  X,
  ExternalLink,
  Clipboard,
  Clock,
  Eye,
  Calendar,
  Volume2,
  VolumeX,
  Maximize,
  Radio,
  Tv,
  ListVideo,
  Flame,
  CheckCircle2
} from "lucide-react";

export const Route = createFileRoute("/ytstream")({
  head: () => ({
    meta: [
      { title: "YouTube Premium Stream — Unlimited High Quality Video Player" },
      { name: "description", content: "Search and stream any YouTube video directly in high quality with instant playback & direct MP4 downloads." },
    ],
  }),
  component: YouTubePremiumStreamPage,
});

interface SearchResultItem {
  title: string;
  videoId: string;
  url: string;
  thumbnail: string;
  views: number;
  duration: string;
  published: string;
}

interface StreamData {
  type: string;
  format: string;
  title: string;
  thumbnail: string;
  quality: string;
  download_url: string;
}

function formatViewsCount(num: number): string {
  if (!num) return "0 views";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B views`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`;
  return `${num.toLocaleString()} views`;
}

function YouTubePremiumStreamPage() {
  const [searchQuery, setSearchQuery] = useState("Alan Walker Faded");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [feedResults, setFeedResults] = useState<SearchResultItem[]>([]);
  
  // Player state
  const [selectedVideo, setSelectedVideo] = useState<SearchResultItem | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<"video" | "audio">("video");

  const playerRef = useRef<HTMLDivElement | null>(null);

  const sampleQueries = [
    "Alan Walker Faded",
    "Coldplay Hymn For The Weekend",
    "Imagine Dragons Believer",
    "Post Malone Circles",
    "Taylor Swift Blank Space",
    "Ed Sheeran Shape of You",
  ];

  // Perform initial search on mount
  useEffect(() => {
    handleSearch("Alan Walker Faded");
  }, []);

  const handleSearch = async (queryToSearch?: string) => {
    const query = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!query) return;

    setSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/ytstream/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Search request failed (${res.status}). Please try again.`);
      }

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setFeedResults(data.results);
        if (data.results.length === 0) {
          setSearchError("No videos found matching your query. Try another term.");
        }
      } else if (data.status === false || data.error) {
        throw new Error(data.error || "Failed to parse search results.");
      } else {
        setFeedResults([]);
        setSearchError("Unexpected response format from search service.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Failed to fetch YouTube search feed.");
      setFeedResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStreamVideo = async (item: SearchResultItem) => {
    setSelectedVideo(item);
    setStreamLoading(true);
    setStreamError(null);
    setStreamData(null);

    // Scroll player into view on mobile
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      const res = await fetch(`/api/ytdl/download?url=${encodeURIComponent(item.url)}`);
      if (!res.ok) {
        throw new Error(`Stream resolution error (${res.status}). Could not extract video stream.`);
      }

      const data = await res.json();
      if (data.success && data.result) {
        setStreamData(data.result);
      } else if (data.status === 200 && data.result) {
        setStreamData(data.result);
      } else {
        throw new Error(data.error || "Failed to retrieve stream URL for this video.");
      }
    } catch (err: any) {
      setStreamError(err.message || "Failed to load direct stream. Video may be restricted.");
    } finally {
      setStreamLoading(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSearchQuery(text);
        handleSearch(text);
      }
    } catch (e) {
      console.error("Paste error:", e);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white flex flex-col font-sans relative overflow-x-hidden select-none pb-24">
      {/* Background Red Premium Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-red-600/12 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-rose-600/8 blur-[160px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="px-5 py-4 border-b border-zinc-900/90 backdrop-blur-2xl sticky top-0 z-40 bg-[#07070a]/90 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all text-white shadow-md"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-9.5 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-pink-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Youtube className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[17px] font-black tracking-tight leading-none text-white">
                  YT PREMIUM STREAM
                </h1>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                Search Feed & High-Speed Streamer
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Radio className="size-3 text-red-500 animate-pulse" />
            <span>LIVE STREAM ENGINE</span>
          </span>
        </div>
      </header>

      {/* Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-7">

        {/* Hero Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="size-3 text-red-500" />
            <span>YouTube Search & Direct Stream</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Search YouTube & Stream Anything
          </h2>
          <p className="text-[13px] text-zinc-400 font-bold max-w-lg mx-auto leading-relaxed">
            Search videos, browse the instant feed, and stream in full high-definition video or audio with direct MP4 download links.
          </p>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3 max-w-2xl mx-auto"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 size-5 text-red-500" />
            <input
              type="text"
              placeholder="Search YouTube (e.g. Alan Walker Faded, song name, artist...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 bg-zinc-950/90 border border-zinc-800 rounded-2xl pl-12 pr-28 text-[13.5px] font-bold text-white placeholder-zinc-500 outline-none focus:border-red-500/60 transition-all shadow-2xl select-text"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="size-9 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2.5 h-8.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Paste from Clipboard"
                >
                  <Clipboard className="size-3.5" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-110 disabled:opacity-40 text-[13px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 active:scale-[0.99]"
          >
            {searching ? (
              <>
                <Loader2 className="size-4.5 animate-spin" />
                <span>Searching YouTube Feed...</span>
              </>
            ) : (
              <>
                <Flame className="size-4.5" />
                <span>Search YouTube Feed</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-zinc-500 max-w-3xl mx-auto">
          <span className="text-zinc-600 uppercase text-[9.5px] font-black tracking-wider">Quick Search:</span>
          {sampleQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(query);
                handleSearch(query);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-all active:scale-95"
            >
              {query}
            </button>
          ))}
        </div>

        {/* ACTIVE STREAM PLAYER SECTION */}
        <div ref={playerRef}>
          {selectedVideo && (
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-red-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden animate-spring-scale select-text my-4">
              <div className="absolute -top-20 -right-20 size-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red-400">
                  <Film className="size-4 text-red-500 animate-pulse" />
                  <span>Now Playing Stream</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setPlayerMode("video")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        playerMode === "video" ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Video
                    </button>
                    <button
                      onClick={() => setPlayerMode("audio")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        playerMode === "audio" ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Audio
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVideo(null);
                      setStreamData(null);
                    }}
                    className="size-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                    title="Close Player"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Stream Video Screen / Loader */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-zinc-800/90 shadow-2xl flex items-center justify-center">
                {streamLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                    <Loader2 className="size-9 animate-spin text-red-500" />
                    <div>
                      <p className="text-[13px] font-bold text-white">Extracting High Quality Stream...</p>
                      <p className="text-[10.5px] text-zinc-400 mt-0.5">Fetching 720p HD stream from YouTube servers</p>
                    </div>
                  </div>
                ) : streamError ? (
                  <div className="p-6 text-center space-y-2 max-w-md">
                    <AlertCircle className="size-8 text-rose-500 mx-auto" />
                    <p className="text-[13px] font-bold text-rose-400">{streamError}</p>
                    <button
                      onClick={() => handleStreamVideo(selectedVideo)}
                      className="px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-white hover:bg-zinc-800"
                    >
                      Retry Stream
                    </button>
                  </div>
                ) : streamData ? (
                  playerMode === "video" ? (
                    <video
                      src={streamData.download_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6 relative">
                      <img
                        src={streamData.thumbnail || selectedVideo.thumbnail}
                        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl"
                        alt="Background"
                      />
                      <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                        <img
                          src={streamData.thumbnail || selectedVideo.thumbnail}
                          className="size-28 sm:size-36 rounded-2xl object-cover shadow-2xl border border-white/10"
                          alt="Cover"
                        />
                        <audio src={streamData.download_url} controls autoPlay className="w-64 sm:w-80" />
                      </div>
                    </div>
                  )
                ) : (
                  <img
                    src={selectedVideo.thumbnail}
                    className="w-full h-full object-cover"
                    alt="Thumbnail"
                  />
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5">
                <h3 className="text-[16px] sm:text-[17px] font-black text-white leading-snug break-words">
                  {streamData?.title || selectedVideo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Eye className="size-3.5 text-red-400" />
                    {formatViewsCount(selectedVideo.views)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-zinc-400" />
                    {selectedVideo.duration}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-zinc-400" />
                    {selectedVideo.published}
                  </span>
                  {streamData && (
                    <>
                      <span>•</span>
                      <span className="text-red-400 font-black bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {streamData.quality || "720p"} MP4
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {streamData && (
                <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                  <a
                    href={streamData.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-110 text-white text-[13px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 active:scale-[0.99]"
                  >
                    <Download className="size-4.5" />
                    <span>Download MP4 Video ({streamData.quality || "720p"})</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyText(streamData.download_url, "stream_link")}
                      className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {copiedLink === "stream_link" ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span>{copiedLink === "stream_link" ? "Stream Link Copied!" : "Copy Stream Link"}</span>
                    </button>

                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ExternalLink className="size-3.5 text-red-400" />
                      <span>Open on YouTube ↗</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ERROR MESSAGE FOR SEARCH */}
        {searchError && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 text-rose-400 text-[12.5px] font-bold p-4 flex items-start gap-3 max-w-2xl mx-auto select-text">
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
            <span>{searchError}</span>
          </div>
        )}

        {/* SEARCH FEED RESULTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ListVideo className="size-4.5 text-red-500" />
              <h3 className="text-[15px] font-black text-white tracking-tight uppercase">
                Search Results Feed
              </h3>
              {feedResults.length > 0 && (
                <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  {feedResults.length} Videos
                </span>
              )}
            </div>

            {searching && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Updating feed...</span>
              </div>
            )}
          </div>

          {/* Video Grid Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {feedResults.map((item, idx) => (
              <div
                key={item.videoId || idx}
                className="group bg-zinc-950/80 border border-zinc-800/80 hover:border-red-500/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-red-600/5"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleStreamVideo(item)}
                      className="size-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform"
                      title="Stream Video Now"
                    >
                      <Play className="size-6 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Duration Badge */}
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md text-[10px] font-black text-white px-2 py-0.5 rounded-md border border-white/10">
                      {item.duration}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-[13.5px] font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10.5px] font-semibold text-zinc-400">
                      <span>{formatViewsCount(item.views)}</span>
                      <span>•</span>
                      <span>{item.published}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-zinc-900 flex items-center gap-1.5">
                    <button
                      onClick={() => handleStreamVideo(item)}
                      className="flex-1 h-9 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-110 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Play className="size-3.5 fill-white" />
                      <span>Stream Now</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(item.url, item.videoId)}
                      className="size-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                      title="Copy YouTube Link"
                    >
                      {copiedLink === item.videoId ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!searching && feedResults.length === 0 && !searchError && (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Youtube className="size-10 mx-auto text-zinc-600" />
              <p className="text-[13px] font-bold">Search any YouTube video to populate the stream feed.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
