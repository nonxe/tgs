import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Globe,
  Github,
  Sparkles,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Trash2,
  ExternalLink,
  Play,
  RefreshCw,
  Search,
  Eye,
  Plus,
  X,
  Layers,
  Code,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react";
import { HostedSite } from "../lib/github-aslink";

function HostPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [branch, setBranch] = useState("main");
  const [entryPath, setEntryPath] = useState("index.html");
  const [title, setTitle] = useState("");
  
  const [deploying, setDeploying] = useState(false);
  const [mySites, setMySites] = useState<HostedSite[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [userAccount, setUserAccount] = useState<{ id: string } | null>(null);
  
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewSite, setPreviewSite] = useState<HostedSite | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (stored) setUserAccount(JSON.parse(stored));
    } catch {}
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadHostedSites = async () => {
    setLoadingSites(true);
    try {
      const createdBy = userAccount?.id || "anonymous";
      const res = await fetch(`/api/aslink/manage?createdBy=${encodeURIComponent(createdBy)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.sites)) {
        setMySites(data.sites);
      }
    } catch {}
    setLoadingSites(false);
  };

  useEffect(() => {
    loadHostedSites();
  }, [userAccount]);

  // Deploy Static Site
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      showToast("Please enter a public GitHub repository URL.", "error");
      return;
    }

    setDeploying(true);
    try {
      const res = await fetch("/api/aslink/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          repoUrl: repoUrl.trim(),
          slug: slug.trim(),
          branch: branch.trim() || "main",
          entryPath: entryPath.trim() || "index.html",
          title: title.trim(),
          createdBy: userAccount?.id || "anonymous",
        }),
      });

      const data = await res.json();
      if (data.success && data.site) {
        showToast(`Successfully deployed ${data.site.slug}! Permanent link generated in nonxe/aslink.`);
        setRepoUrl("");
        setSlug("");
        setTitle("");
        loadHostedSites();
      } else {
        showToast(data.error || "Deployment failed.", "error");
      }
    } catch (err: any) {
      showToast("Deployment error: " + err.message, "error");
    }
    setDeploying(false);
  };

  // Delete Hosted Site
  const handleDelete = async (siteId: string) => {
    try {
      const res = await fetch("/api/aslink/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          siteId,
          ownerId: userAccount?.id || "anonymous",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMySites((prev) => prev.filter((s) => s.id !== siteId));
        showToast("Deleted static site deployment.");
      }
    } catch {}
  };

  const copyPermanentUrl = (slugName: string, siteId: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/s/${slugName}`;
    navigator.clipboard.writeText(url);
    setCopiedId(siteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-foreground font-sans flex flex-col relative overflow-hidden select-text">
      {/* Top Header */}
      <header className="px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-[#070b14]/90">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="size-4.5" />
            </div>
            <div>
              <h1 className="text-base font-black text-foreground tracking-tight">Static GitHub Host</h1>
              <p className="text-[11px] text-muted-foreground font-mono">Powered by nonxe/aslink repository</p>
            </div>
          </div>
        </div>

        <button
          onClick={loadHostedSites}
          className="p-2 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
          title="Refresh List"
        >
          <RefreshCw className="size-4" />
        </button>
      </header>

      {/* Main Container */}
      <section className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Intro Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
            <Zap className="size-4 animate-pulse" />
            <span>INSTANT PERMANENT STATIC HOSTING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Host Any Public GitHub Repo Instantly
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Paste any public GitHub repository link (HTML/CSS/JS, Vite builds, single page apps) to generate a permanent custom URL stored in the <strong className="text-cyan-400 font-mono">nonxe/aslink</strong> database repo!
          </p>
        </div>

        {/* Deploy Form */}
        <form onSubmit={handleDeploy} className="p-6 rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 border-b border-border/30 pb-3">
            <Github className="size-5 text-cyan-400" />
            <h3 className="text-base font-black text-foreground">Deploy New Static Repository</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Repo URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
                Public GitHub Repository URL *
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/HassanXTech/LetMeSketch"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-border/50 text-foreground text-xs font-mono outline-none focus:border-cyan-500 transition-all"
                required
              />
            </div>

            {/* Custom Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
                Custom Permanent Slug / Subdomain (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="e.g. my-awesome-app"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-border/50 text-foreground text-xs font-mono outline-none focus:border-cyan-500 transition-all"
              />
              <p className="text-[10px] text-muted-foreground">Permanent URL: /s/{slug || "custom-slug"}</p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
                Display Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. LetMeSketch Web App"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-border/50 text-foreground text-xs font-sans font-semibold outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Branch */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
                Branch Name
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-border/50 text-foreground text-xs font-mono outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Entry File Path */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
                Entry File Path
              </label>
              <input
                type="text"
                value={entryPath}
                onChange={(e) => setEntryPath(e.target.value)}
                placeholder="index.html"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-border/50 text-foreground text-xs font-mono outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={deploying}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-40"
            >
              {deploying ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              <span>{deploying ? "Deploying & Saving to nonxe/aslink..." : "Deploy & Generate Permanent Link"}</span>
            </button>
          </div>
        </form>

        {/* My Hosted Sites Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Server className="size-5 text-cyan-400" />
              <span>Deployed Static Repositories</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              {mySites.length} Deployed
            </span>
          </div>

          {loadingSites ? (
            <div className="py-12 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-cyan-400" />
              <span>Loading hosted records from nonxe/aslink...</span>
            </div>
          ) : mySites.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-semibold p-8 rounded-3xl bg-[#090d16] border border-border/30">
              No static sites deployed yet. Use the form above to deploy your first public GitHub repository!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySites.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl bg-[#090d16] border border-border/40 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 shadow-xl group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-foreground">{s.title || s.slug}</h4>
                        <p className="text-[11px] text-cyan-400 font-mono font-bold mt-0.5">
                          /s/{s.slug}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md border border-border/30">
                        {s.owner}/{s.repo}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{s.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                      <Eye className="size-3.5 text-cyan-400" />
                      <span>{s.views || 0} views</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewSite(s)}
                        className="px-3 py-1.5 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        <Play className="size-3" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => copyPermanentUrl(s.slug, s.id)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        {copiedId === s.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        <span>{copiedId === s.id ? "Copied!" : "Copy URL"}</span>
                      </button>
                      <a
                        href={`/s/${s.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
                        title="Open Site"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-red-400 transition-all"
                        title="Delete Deployment"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Toast Feedback */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-xl animate-spring-scale ${
            toastMsg.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/20 border-red-500/40 text-red-300"
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Live Embedded Preview Modal */}
      {previewSite && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-[#090d16] border border-cyan-500/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            <div className="h-12 border-b border-border/30 px-4 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-cyan-400" />
                <span className="text-xs font-black text-foreground">Live Preview: {previewSite.title || previewSite.slug}</span>
                <span className="text-[10px] font-mono text-cyan-400">/s/{previewSite.slug}</span>
              </div>
              <button onClick={() => setPreviewSite(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <iframe
              src={`/s/${previewSite.slug}`}
              title={previewSite.title || previewSite.slug}
              className="flex-1 w-full border-0 bg-white"
            />
          </div>
        </div>
      )}
    </main>
  );
}

export const Route = createFileRoute("/host")({
  component: HostPage,
  head: () => ({
    meta: [
      { title: "Static GitHub Host • nonxe/aslink" },
      { name: "description", content: "Host any public GitHub repository permanently with custom links using nonxe/aslink database." },
    ],
  }),
});
