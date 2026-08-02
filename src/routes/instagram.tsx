import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Instagram,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Sparkles,
  Play,
  Heart,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Video,
  Film,
} from "lucide-react";

interface InstagramResult {
  video: string | null;
  thumbnail: string | null;
  title: string;
  quality?: string;
  likeCount?: number | null;
  commentCount?: number | null;
  format?: string;
}

function InstagramDownloaderPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleReelUrl = "https://www.instagram.com/reel/DD6q97IuzxD/?igsh=YzljYTk1ODg3Zg==";

  const handleFetchReel = async (targetUrl?: string) => {
    const inputUrl = (targetUrl || url).trim();
    if (!inputUrl) {
      setError("Please paste a valid Instagram Reel or Video URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/instagram/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || "Failed to download Instagram reel.");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Unable to download this reel. Ensure the account is public.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSample = () => {
    setUrl(sampleReelUrl);
    handleFetchReel(sampleReelUrl);
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-[#030712] text-foreground font-sans relative selection:bg-rose-500/30 overflow-x-hidden">
      {/* Background Neon Ambient Orbs */}
      <div className="fixed top-0 left-1/3 size-96 rounded-full bg-rose-500/5 blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-1/4 size-96 rounded-full bg-purple-500/5 blur-[160px] pointer-events-none z-0" />

      {/* Header Banner */}
      <header className="px-4 sm:px-6 md:px-8 py-4 border-b border-white/10 backdrop-blur-2xl sticky top-0 z-40 bg-[#030712]/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="size-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-white/10"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Instagram className="size-4.5" />
                </span>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Instagram Downloader
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase font-mono tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-400" />
                  BETA FEATURE
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Download Reels, Posts & Videos with high quality thumbnail preview
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handlePasteSample}
              className="px-3.5 py-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Film className="size-3.5" />
              <span>Try Sample Reel</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-7 relative z-10">
        {/* BETA Warning Banner */}
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium flex items-center gap-3 backdrop-blur-xl">
          <AlertTriangle className="size-5 flex-shrink-0 text-amber-400" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-200">BETA Notice:</span> This Instagram Reel Downloader is currently in <strong>BETA</strong>. Private reels or region-locked posts may require public access.
          </div>
        </div>

        {/* Search & Download Input Box */}
        <div className="p-6 sm:p-8 rounded-[32px] border border-white/10 bg-[#090d16]/90 backdrop-blur-3xl space-y-4 shadow-2xl">
          <label className="text-xs font-black uppercase text-rose-400 font-mono tracking-wider flex items-center gap-2">
            <Instagram className="size-4" />
            <span>Paste Instagram Reel or Post Link</span>
          </label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchReel();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/DD6q97IuzxD/..."
                className="w-full h-13 px-4 sm:px-5 rounded-2xl bg-[#030712] border border-white/10 text-xs sm:text-sm font-mono font-bold text-white placeholder:text-muted-foreground/30 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all"
                required
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-13 px-7 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Fetch Reel</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 px-1">
            <span>Supported: Reels, IGTV, Video Posts, Carousel Videos</span>
            <button
              onClick={handlePasteSample}
              className="text-rose-400 hover:underline font-mono font-bold flex items-center gap-1 sm:hidden"
            >
              <span>Try Sample</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 text-center space-y-4 rounded-[32px] border border-white/10 bg-[#090d16]/50">
            <Loader2 className="size-10 animate-spin mx-auto text-rose-400" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Fetching Reel Metadata...</h3>
              <p className="text-xs text-muted-foreground font-mono">Extracting HD video stream & thumbnail preview</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-5 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold text-center space-y-2 animate-shiver">
            <p>{error}</p>
            <p className="text-[11px] text-muted-foreground font-normal">
              Note: Make sure the Instagram link is publicly accessible.
            </p>
          </div>
        )}

        {/* Result Card: Thumbnail, Title, Download Button */}
        {result && (
          <div className="p-6 sm:p-8 rounded-[32px] border border-rose-500/30 bg-[#090d16]/90 backdrop-blur-3xl space-y-6 shadow-2xl animate-spring-scale relative overflow-hidden">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono">
                  Reel Ready to Download
                </span>
              </div>
              {result.quality && (
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-black uppercase">
                  {result.quality} MP4
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Thumbnail / Video Preview */}
              <div className="md:col-span-5 relative group rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[9/16] max-h-[380px] mx-auto w-full flex items-center justify-center">
                {result.video ? (
                  <video
                    src={result.video}
                    poster={result.thumbnail || undefined}
                    controls
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : result.thumbnail ? (
                  <div className="relative size-full">
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="size-14 rounded-full bg-rose-500/80 text-white flex items-center justify-center shadow-xl">
                        <Play className="size-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Video className="size-10 mx-auto mb-2 text-rose-400 opacity-60" />
                    <p className="text-xs">No preview available</p>
                  </div>
                )}
              </div>

              {/* Right Column: Title / Caption & Download Actions */}
              <div className="md:col-span-7 space-y-5">
                {/* Title / Caption */}
                <div className="space-y-2">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-muted-foreground tracking-wider">
                    Reel Caption / Title
                  </span>
                  <div className="p-4 rounded-2xl bg-[#030712] border border-white/10 text-xs text-white leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                    {result.title}
                  </div>
                </div>

                {/* Metrics: Likes & Comments */}
                {(result.likeCount || result.commentCount) && (
                  <div className="flex items-center gap-4 text-xs font-mono font-bold">
                    {result.likeCount && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Heart className="size-3.5 fill-current" />
                        <span>{formatNumber(result.likeCount)} Likes</span>
                      </div>
                    )}
                    {result.commentCount && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <MessageCircle className="size-3.5" />
                        <span>{formatNumber(result.commentCount)} Comments</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Download Button */}
                <div className="space-y-3 pt-2">
                  {result.video ? (
                    <a
                      href={result.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      download="instagram_reel.mp4"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      <Download className="size-4" />
                      <span>Download HD Video (MP4)</span>
                    </a>
                  ) : (
                    <div className="p-3 text-xs text-center text-amber-400 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      Direct video stream URL restricted by Instagram API
                    </div>
                  )}

                  {/* Copy Direct Video URL Button */}
                  {result.video && (
                    <button
                      onClick={() => handleCopyLink(result.video!)}
                      className="w-full py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      <span>{copied ? "Direct Video Link Copied!" : "Copy Direct Video CDN Link"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export const Route = createFileRoute("/instagram")({
  component: InstagramDownloaderPage,
  head: () => ({
    meta: [
      { title: "Instagram Downloader • BETA FEATURE" },
      { name: "description", content: "Download Instagram Reels and videos with title, thumbnail preview, and direct MP4 export." },
    ],
  }),
});
