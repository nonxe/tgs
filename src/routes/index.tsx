import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { 
  Upload, 
  File as FileIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Clock, 
  HardDrive, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Info,
  ChevronDown,
  X,
  FileText,
  Video,
  Music,
  Archive,
  Image as ImageIcon
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloud — Minimalist File Sharing" },
      { name: "description", content: "Upload any file and get a clean, direct link. Pure iOS black & white theme." },
      { property: "og:title", content: "Cloud — Minimalist File Sharing" },
      { property: "og:description", content: "Upload any file and get a clean, direct link." },
    ],
  }),
  component: Index,
});

type UploadResult = {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  type?: string;
  error?: string;
};

type HistoryItem = {
  url: string;
  filename: string;
  size?: number;
  type?: string;
  timestamp: number;
};

function formatBytes(n?: number) {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let i = -1;
  let v = n;
  do {
    v /= 1024;
    i++;
  } while (v >= 1024 && i < units.length - 1);
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

function getRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getFileIcon(type?: string) {
  const t = type?.toLowerCase() || "";
  if (t.startsWith("image/")) return <ImageIcon className="size-5" />;
  if (t.startsWith("video/")) return <Video className="size-5" />;
  if (t.startsWith("audio/")) return <Music className="size-5" />;
  if (t.startsWith("text/") || t.includes("pdf") || t.includes("document") || t.includes("office")) return <FileText className="size-5" />;
  if (t.includes("zip") || t.includes("tar") || t.includes("rar") || t.includes("gzip") || t.includes("compressed")) return <Archive className="size-5" />;
  return <FileIcon className="size-5" />;
}

function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [retention, setRetention] = useState<"permanent" | "72h">("permanent");
  
  // Custom states for iOS accordion FAQs
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Load history
    try {
      const stored = localStorage.getItem("cloud_upload_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }

    // Load theme
    const isDark = document.documentElement.classList.contains("dark") || 
                   (localStorage.getItem("theme") === "dark") ||
                   (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const saveToHistory = (item: HistoryItem) => {
    // Check if item already exists in history to avoid duplicates
    setHistory((prev) => {
      const filtered = prev.filter((x) => x.url !== item.url);
      const updated = [item, ...filtered].slice(0, 30); // Keep last 30 items
      localStorage.setItem("cloud_upload_history", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFromHistory = (url: string) => {
    const updated = history.filter((item) => item.url !== url);
    setHistory(updated);
    localStorage.setItem("cloud_upload_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your upload history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem("cloud_upload_history");
    }
  };

  const pick = () => {
    if (!busy) inputRef.current?.click();
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);

    // Create preview for images
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const upload = async (f: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const uploadDirectLitterbox = (fileToUpload: File): Promise<UploadResult> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://litterbox.catbox.moe/resources/internals/api.php");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          const text = (xhr.responseText || "").trim();
          if (xhr.status >= 200 && xhr.status < 300 && text.startsWith("http")) {
            const name = text.split("/").pop() || fileToUpload.name;
            resolve({
              success: true,
              url: text,
              filename: name,
              size: fileToUpload.size,
              type: fileToUpload.type,
            });
          } else {
            reject(new Error(text || `Upload failed (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during direct high-speed upload"));

        const fd = new FormData();
        fd.append("reqtype", "fileupload");
        fd.append("time", "72h");
        fd.append("fileToUpload", fileToUpload, fileToUpload.name || "upload");

        xhr.send(fd);
      });
    };

    const uploadViaProxy = (fileToUpload: File): Promise<UploadResult> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/public/upload");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300 && json.success) {
              resolve(json);
            } else {
              reject(new Error(json.error || `Upload failed (${xhr.status})`));
            }
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        const fd = new FormData();
        fd.append("file", fileToUpload, fileToUpload.name || "upload");
        fd.append("retention", retention);

        xhr.send(fd);
      });
    };

    const uploadDirectTmpfiles = (fileToUpload: File): Promise<UploadResult> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://tmpfiles.org/api/v1/upload");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300 && json.data?.url) {
              const directUrl = json.data.url.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
              resolve({
                success: true,
                url: directUrl,
                filename: fileToUpload.name,
                size: fileToUpload.size,
                type: fileToUpload.type,
              });
            } else {
              reject(new Error("Tmpfiles upload failed"));
            }
          } catch {
            reject(new Error("Tmpfiles parse failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during tmpfiles upload"));

        const fd = new FormData();
        fd.append("file", fileToUpload, fileToUpload.name || "upload");
        xhr.send(fd);
      });
    };

    try {
      let data: UploadResult;
      const LARGE_FILE_THRESHOLD = 4.5 * 1024 * 1024; // 4.5MB serverless proxy bypass threshold

      if (retention === "72h" || f.size > LARGE_FILE_THRESHOLD) {
        try {
          data = await uploadDirectLitterbox(f);
        } catch {
          try {
            data = await uploadDirectTmpfiles(f);
          } catch {
            data = await uploadViaProxy(f);
          }
        }
      } else {
        try {
          data = await uploadViaProxy(f);
        } catch {
          try {
            data = await uploadDirectLitterbox(f);
          } catch {
            data = await uploadDirectTmpfiles(f);
          }
        }
      }

      const finalResult: UploadResult = {
        success: true,
        url: data.url,
        filename: data.filename || f.name,
        size: f.size,
        type: f.type,
      };

      setResult(finalResult);

      if (data.url) {
        saveToHistory({
          url: data.url,
          filename: data.filename || f.name,
          size: f.size,
          type: f.type,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (url?: string) => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-2xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <span className="text-[20px] font-black tracking-tighter select-none">
            CLOUD
          </span>
          <Link
            to="/note"
            className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity"
          >
            NOTES
          </Link>
          <Link
            to="/convert"
            className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity"
          >
            CONVERTS
          </Link>
          <Link
            to="/more"
            className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity"
          >
            MORE
          </Link>
          <Link
            to="/owner"
            className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity"
          >
            OWNER INFO
          </Link>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </header>

      {/* Main Container */}
      <section className="flex-1 flex flex-col px-4 py-12 max-w-2xl md:max-w-6xl mx-auto w-full">
        {/* Intro */}
        <div className="text-center mb-10 w-full animate-slide-up">
          <h2 className="text-[40px] md:text-[52px] leading-[1.05] font-black tracking-tight select-none">
            Drop a file.
            <br />
            <span className="opacity-40">Get a link.</span>
          </h2>
          <p className="mt-4 text-[16px] text-muted-foreground max-w-md mx-auto">
            Photos, videos, audio, documents — anything. Shared instantly.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Left Column: Uploader Card & Status */}
          <div className="md:col-span-3 w-full space-y-6">
            <div className="w-full max-w-md md:max-w-none mx-auto animate-spring-scale">
              {!result && !file && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    onFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                  onClick={pick}
                  className={`group relative cursor-pointer rounded-[24px] border border-dashed p-10 text-center transition-all duration-300 ios-glass ios-shadow ${
                    dragging
                      ? "border-foreground bg-foreground/5 scale-[1.01]"
                      : "border-border hover:border-foreground/45 hover:scale-[1.005]"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="mx-auto mb-6 size-16 rounded-[20px] border border-border flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Upload className="size-6 text-foreground group-hover:animate-bounce" />
                  </div>
                  <p className="text-[17px] font-bold tracking-tight">Tap to choose or drag here</p>
                  <p className="mt-1 text-[14px] text-muted-foreground">Supports huge files (100MB, 200MB, up to 1GB)</p>
                </div>
              )}

              {file && !result && (
                <div className="rounded-[24px] border border-border p-6 space-y-6 ios-glass ios-shadow">
                  {/* File Info */}
                  <div className="flex items-center gap-4 bg-secondary/40 p-4 rounded-[18px] border border-border/20">
                    {previewUrl ? (
                      <div className="size-12 rounded-[12px] overflow-hidden border border-border/20 bg-muted flex-shrink-0">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-12 rounded-[12px] bg-foreground/5 flex items-center justify-center text-muted-foreground border border-border/10 flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold truncate tracking-tight">{file.name}</p>
                      <p className="text-[13px] text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    
                    <button
                      onClick={reset}
                      disabled={busy}
                      className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Retention Toggle */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-muted-foreground select-none">Storage Duration</label>
                    <div className="grid grid-cols-2 gap-1 bg-secondary/50 p-1 rounded-[16px] border border-border/25">
                      <button
                        onClick={() => setRetention("permanent")}
                        disabled={busy}
                        className={`h-10 rounded-[12px] text-[13.5px] font-bold transition-all ${
                          retention === "permanent"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Permanent (Catbox)
                      </button>
                      <button
                        onClick={() => setRetention("72h")}
                        disabled={busy}
                        className={`h-10 rounded-[12px] text-[13.5px] font-bold transition-all ${
                          retention === "72h"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Temporary (72 Hours)
                      </button>
                    </div>
                  </div>

                  {/* Action Button / Progress */}
                  <div className="space-y-4">
                    {busy ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[13px] font-bold select-none px-1">
                          <span className="text-muted-foreground">Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden border border-border/10">
                          <div 
                            className="h-full bg-foreground transition-all duration-150 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => upload(file)}
                        className="w-full h-12 rounded-[16px] bg-foreground text-background text-[15px] font-black hover:scale-[1.01] active:scale-[0.99] transition-all ios-tap-active select-none"
                      >
                        Upload to Cloud
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="mt-4 rounded-[18px] border border-destructive/20 bg-destructive/5 text-destructive text-[14px] font-semibold px-4 py-3 text-center flex items-center justify-center gap-2 animate-shiver">
                      <ShieldAlert className="size-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {result?.url && (
                    <div className="rounded-[24px] border border-border p-6 space-y-6 ios-glass ios-shadow animate-spring-scale">
                      {/* Success Header */}
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full border-2 border-foreground flex items-center justify-center text-foreground bg-foreground/5 flex-shrink-0">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" className="draw-check" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[16px] font-bold tracking-tight">Upload Complete</p>
                          <p className="text-[13px] text-muted-foreground truncate">
                            {file?.name ?? result.filename}
                          </p>
                        </div>
                      </div>

                      {/* URL Display */}
                      <div className="relative group">
                        <div className="rounded-[18px] bg-secondary/40 border border-border/30 px-4 py-4 text-[13px] font-mono break-all text-foreground/90 select-all pr-12">
                          {result.url}
                        </div>
                        <button
                          onClick={() => copyLink(result.url)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full border border-border bg-background flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
                          title="Copy link"
                        >
                          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => copyLink(result.url)}
                          className="h-12 rounded-[16px] bg-primary text-primary-foreground text-[15px] font-bold active:scale-[0.98] transition-all ios-tap-active select-none"
                        >
                          {copied ? "Link Copied" : "Copy Link"}
                        </button>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-12 rounded-[16px] border border-border bg-secondary hover:bg-secondary/80 text-foreground text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all ios-tap-active select-none"
                        >
                          <span>Open URL</span>
                          <ExternalLink className="size-4" />
                        </a>
                      </div>

                      <button
                        onClick={reset}
                        className="w-full text-[14px] text-muted-foreground hover:text-foreground font-bold transition-colors pt-2"
                      >
                        Upload another file
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: History & FAQs */}
          <div className="md:col-span-2 w-full space-y-8">
            {/* History List */}
            {history.length > 0 && (
              <div className="w-full space-y-4 animate-slide-up">
                <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                  <h3 className="text-[17px] font-bold tracking-tight flex items-center gap-2">
                    <Clock className="size-4.5 opacity-60" />
                    <span>Recent Uploads</span>
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-[12px] font-bold text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {history.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-[16px] border border-border/40 hover:border-border transition-all bg-card/20 hover:bg-card/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-9 rounded-[10px] bg-foreground/5 border border-border/10 flex items-center justify-center text-muted-foreground flex-shrink-0">
                          {getFileIcon(item.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold truncate tracking-tight text-foreground">{item.filename}</p>
                          <p className="text-[12px] text-muted-foreground/80 flex items-center gap-1.5">
                            <span>{formatBytes(item.size)}</span>
                            <span>·</span>
                            <span>{getRelativeTime(item.timestamp)}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Open file"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <button
                          onClick={() => copyLink(item.url)}
                          className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy link"
                        >
                          <Copy className="size-4" />
                        </button>
                        <button
                          onClick={() => deleteFromHistory(item.url)}
                          className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove from history"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            <div className="w-full space-y-4 animate-slide-up">
              <h3 className="text-[17px] font-bold tracking-tight border-b border-border/30 pb-2.5 flex items-center gap-2 select-none">
                <HardDrive className="size-4.5 opacity-60" />
                <span>Information & FAQs</span>
              </h3>

              <div className="space-y-2">
                {[
                  {
                    q: "How long are uploaded files kept?",
                    a: "Files selected as Permanent are saved indefinitely via Catbox. Files selected as Temporary are automatically purged after 72 hours via Litterbox."
                  },
                  {
                    q: "What is the maximum file size limit?",
                    a: "You can upload any file format up to 200 MB for Permanent storage, and up to 1 GB for Temporary (72h) storage. Huge files automatically utilize high-speed direct cloud streaming."
                  },
                  {
                    q: "Is my upload history public?",
                    a: "No. Your upload history is stored entirely locally on your device (in localStorage). Nobody else can see what you uploaded unless you share the link."
                  }
                ].map((faq, i) => {
                  const isOpen = faqOpen === i;
                  return (
                    <div 
                      key={i} 
                      className="rounded-[16px] border border-border/40 overflow-hidden bg-card/10"
                    >
                      <button
                        onClick={() => setFaqOpen(isOpen ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-[14px] hover:bg-secondary/40 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-350 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div 
                        className={`transition-all duration-350 ease-in-out overflow-hidden ${
                          isOpen ? "max-h-40 border-t border-border/20" : "max-h-0"
                        }`}
                      >
                        <p className="p-4 text-[13px] text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-[12px] text-muted-foreground pb-8 pt-4 border-t border-border/20 w-full max-w-2xl md:max-w-6xl mx-auto select-none mt-12">
        Files are streamed securely · Direct links generated do not expire unless set to temporary
      </footer>
    </main>
  );
}
