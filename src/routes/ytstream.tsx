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
  Radio,
  ListVideo,
  Flame,
  Music2,
  Tv,
  Share2
} from "lucide-react";

export const Route = createFileRoute("/ytstream")({
  head: () => ({
    meta: [
      { title: "YouTube Stream — Minimal iOS Media Player" },
      { name: "description", content: "Minimalist iOS-styled YouTube video search feed, direct high-speed video streaming & MP4 downloads." },
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
          setSearchError("No videos found matching your query. Try another search term.");
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

    // Smoothly scroll player into view
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
    <main className="min-h-screen bg-[#050508] text-white flex flex-col font-sans relative overflow-x-hidden select-none pb-28 antialiased">
      {/* Subtle Ambient iOS Red Glow */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-red-600/8 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-[45%] right-[-10%] w-[450px] h-[450px] bg-rose-600/5 blur-[160px] pointer-events-none rounded-full" />

      {/* iOS Minimal Translucent Header */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-40 bg-[#050508]/80 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-8.5 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/20">
              <Youtube className="size-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[15px] font-bold tracking-tight text-white">
                  YouTube Stream
                </h1>
                <span className="bg-red-500/15 text-red-400 border border-red-500/20 text-[9.5px] font-medium px-2 py-0.5 rounded-full">
                  Minimal
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-normal tracking-wide">
                iOS Media Feed & Streamer
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>High Speed Stream</span>
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-7">

        {/* Minimal Hero Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-medium backdrop-blur-md">
            <Sparkles className="size-3.5 text-red-400" />
            <span>Clean iOS Video Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Stream YouTube Feed
          </h2>
          <p className="text-[13px] text-zinc-400 font-normal leading-relaxed">
            Search videos, stream directly in 720p HD, or download MP4 files without ads or limits.
          </p>
        </div>

        {/* iOS Minimal Translucent Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3 max-w-2xl mx-auto"
        >
          <div className="relative flex items-center bg-zinc-900/60 border border-white/10 rounded-2xl sm:rounded-full p-1.5 backdrop-blur-xl transition-all focus-within:border-red-500/40 focus-within:ring-2 focus-within:ring-red-500/20 shadow-xl">
            <Search className="ml-3.5 size-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search YouTube (e.g., Alan Walker Faded, song name...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 text-[13.5px] font-normal text-white placeholder:text-zinc-500 outline-none select-text"
            />
            <div className="flex items-center gap-1.5 pr-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="size-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-3 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                  title="Paste from Clipboard"
                >
                  <Clipboard className="size-3" />
                  <span>Paste</span>
                </button>
              )}

              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-4.5 h-9 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-md active:scale-95 flex-shrink-0"
              >
                {searching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Minimal iOS Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11.5px] max-w-3xl mx-auto">
          <span className="text-zinc-500 text-[11px] font-medium mr-1">Trending:</span>
          {sampleQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(query);
                handleSearch(query);
              }}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900/60 border border-white/5 hover:border-white/20 text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all text-xs font-normal active:scale-95"
            >
              {query}
            </button>
          ))}
        </div>

        {/* ACTIVE STREAM PLAYER SHEET */}
        <div ref={playerRef}>
          {selectedVideo && (
            <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden animate-spring-scale select-text my-4">
              {/* Header inside player sheet */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Now Streaming</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Segmented control for Video / Audio */}
                  <div className="flex items-center gap-1 bg-zinc-950/80 border border-white/10 rounded-full p-1 text-xs">
                    <button
                      onClick={() => setPlayerMode("video")}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        playerMode === "video"
                          ? "bg-white/15 text-white shadow-sm font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Tv className="size-3 inline mr-1" />
                      Video
                    </button>
                    <button
                      onClick={() => setPlayerMode("audio")}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        playerMode === "audio"
                          ? "bg-white/15 text-white shadow-sm font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Music2 className="size-3 inline mr-1" />
                      Audio
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVideo(null);
                      setStreamData(null);
                    }}
                    className="size-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                    title="Close Player"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Player Viewport */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 shadow-2xl flex items-center justify-center">
                {streamLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                    <Loader2 className="size-8 animate-spin text-red-500" />
                    <div>
                      <p className="text-xs font-semibold text-white">Extracting HD Stream...</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Resolving YouTube video source</p>
                    </div>
                  </div>
                ) : streamError ? (
                  <div className="p-6 text-center space-y-2 max-w-md">
                    <AlertCircle className="size-7 text-rose-400 mx-auto" />
                    <p className="text-xs font-medium text-rose-300">{streamError}</p>
                    <button
                      onClick={() => handleStreamVideo(selectedVideo)}
                      className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white hover:bg-white/20"
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
                        className="absolute inset-0 w-full h-full object-cover opacity-15 blur-2xl"
                        alt="Background"
                      />
                      <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                        <img
                          src={streamData.thumbnail || selectedVideo.thumbnail}
                          className="size-32 rounded-2xl object-cover shadow-2xl border border-white/10"
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
                <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug break-words">
                  {streamData?.title || selectedVideo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-normal text-zinc-400">
                  <span>{formatViewsCount(selectedVideo.views)}</span>
                  <span>•</span>
                  <span>{selectedVideo.duration}</span>
                  <span>•</span>
                  <span>{selectedVideo.published}</span>
                  {streamData && (
                    <>
                      <span>•</span>
                      <span className="text-red-400 font-medium bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 text-[11px]">
                        {streamData.quality || "720p"} HD MP4
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {streamData && (
                <div className="pt-2 border-t border-white/5 space-y-2.5">
                  <a
                    href={streamData.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="w-full h-11 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.99]"
                  >
                    <Download className="size-4" />
                    <span>Download MP4 ({streamData.quality || "720p HD"})</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyText(streamData.download_url, "stream_link")}
                      className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {copiedLink === "stream_link" ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span>{copiedLink === "stream_link" ? "Link Copied!" : "Copy Stream Link"}</span>
                    </button>

                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ExternalLink className="size-3.5 text-zinc-400" />
                      <span>Open YouTube</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Notification */}
        {searchError && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-300 text-xs font-medium p-4 flex items-start gap-3 max-w-2xl mx-auto backdrop-blur-md">
            <AlertCircle className="size-4.5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{searchError}</span>
          </div>
        )}

        {/* MINIMAL SEARCH RESULTS FEED */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Video Feed
              </h3>
              {feedResults.length > 0 && (
                <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-0.5 rounded-full font-medium">
                  {feedResults.length} Results
                </span>
              )}
            </div>

            {searching && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <Loader2 className="size-3.5 animate-spin text-red-500" />
                <span>Updating feed...</span>
              </div>
            )}
          </div>

          {/* Minimal Grid Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedResults.map((item, idx) => (
              <div
                key={item.videoId || idx}
                className="group bg-zinc-900/40 border border-white/5 hover:border-white/15 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.015] backdrop-blur-md"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={item.title}
                    loading="lazy"
                  />
                  
                  {/* Floating Play Icon Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleStreamVideo(item)}
                      className="size-11 rounded-full bg-red-600/95 text-white backdrop-blur-md flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform"
                      title="Stream Video"
                    >
                      <Play className="size-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Duration Badge */}
                  {item.duration && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-[10.5px] font-medium text-zinc-200 px-2 py-0.5 rounded-md border border-white/10">
                      {item.duration}
                    </div>
                  )}
                </div>

                {/* Card Info & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-[13.5px] font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-normal">
                      <span>{formatViewsCount(item.views)}</span>
                      <span>•</span>
                      <span>{item.published}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => handleStreamVideo(item)}
                      className="flex-1 h-9 rounded-full bg-white/5 hover:bg-red-600 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Play className="size-3.5 fill-white" />
                      <span>Stream</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(item.url, item.videoId)}
                      className="size-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                      title="Copy YouTube Link"
                    >
                      {copiedLink === item.videoId ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!searching && feedResults.length === 0 && !searchError && (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Youtube className="size-8 mx-auto text-zinc-600" />
              <p className="text-xs font-medium">Search any YouTube video to populate the stream feed.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
