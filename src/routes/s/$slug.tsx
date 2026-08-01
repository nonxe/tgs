import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Globe,
  Github,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Share2,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  Eye,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { HostedSite } from "../../lib/github-aslink";

function HostedSiteRunner() {
  const { slug } = Route.useParams();
  const [site, setSite] = useState<HostedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadSite() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/aslink/manage?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!active) return;

        if (data.success && data.site) {
          setSite(data.site);
        } else {
          setError(`No static website found for slug '${slug}'. Check if the repository URL or slug is correct.`);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load static website configuration.");
      }
      if (active) setLoading(false);
    }

    loadSite();
    return () => {
      active = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-foreground flex flex-col items-center justify-center p-6 space-y-4">
        <div className="size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
          <Loader2 className="size-7 animate-spin" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Fetching static host record from <span className="text-cyan-400 font-mono">nonxe/aslink</span>...
        </p>
      </main>
    );
  }

  if (error || !site) {
    return (
      <main className="min-h-screen bg-[#070b14] text-foreground flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="size-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle className="size-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-black text-foreground">Static Site Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error || "Invalid hosted site slug."}</p>
        </div>
        <a
          href="/host"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-black shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <Sparkles className="size-4" />
          <span>Host a GitHub Repository Now</span>
        </a>
      </main>
    );
  }

  // Construct raw GitHub or HTML static entry URL
  // Uses raw.githack.com or raw.githubusercontent.com for static execution
  const rawUrl = `https://raw.githack.com/${site.owner}/${site.repo}/${site.branch}/${site.entryPath}`;
  const repoGithubUrl = site.repoUrl || `https://github.com/${site.owner}/${site.repo}`;

  return (
    <main className="min-h-screen bg-[#070b14] text-foreground flex flex-col relative overflow-hidden select-none">
      {/* Top Floating Mini Header */}
      <header className="h-12 border-b border-border/30 bg-[#090d16]/95 backdrop-blur-2xl px-4 flex items-center justify-between z-30 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <a
            href="/host"
            className="size-8 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            title="Host Dashboard"
          >
            <ArrowLeft className="size-3.5" />
          </a>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Globe className="size-3.5" />
            </div>
            <div>
              <h1 className="text-xs font-black text-foreground flex items-center gap-1.5">
                <span>{site.title || site.slug}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                  /s/{site.slug}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Control Bar Actions */}
        <div className="flex items-center gap-2">
          <a
            href={repoGithubUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-muted-foreground hover:text-foreground text-[11px] font-bold transition-all flex items-center gap-1.5 hidden sm:flex"
          >
            <Github className="size-3.5" />
            <span>Repo</span>
          </a>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
            title="Reload Iframe"
          >
            <RefreshCw className="size-3.5" />
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
            title="Open Fullscreen Raw"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </header>

      {/* Main Full-Screen Frame */}
      <div className="flex-1 w-full bg-white relative">
        <iframe
          key={key}
          src={rawUrl}
          title={site.title || site.slug}
          className="w-full h-full border-0 block"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </main>
  );
}

export const Route = createFileRoute("/s/$slug")({
  component: HostedSiteRunner,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} • Hosted Static App` },
      { name: "description", content: "Static website hosted permanently using GitHub repository via nonxe/aslink." },
    ],
  }),
});
