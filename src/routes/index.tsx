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
  Sun, 
  Moon, 
  Info,
  ChevronDown,
  X,
  FileText,
  Video,
  Music,
  Archive,
  Image as ImageIcon,
  Sparkles,
  User,
  LayoutGrid,
  Minus,
  UserPlus,
  Crown,
  Database
} from "lucide-react";
import { ConvertPage } from "./convert";
import { MorePage } from "./more";
import { OwnerPage } from "./owner";
import { NoteComposer } from "./note.index";
import { DbConsole } from "./-db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLOUD — Web OS Portal" },
      { name: "description", content: "Premium, responsive Web OS interface containing secure file sharing, notes, transcoders, and AI utilities." },
      { property: "og:title", content: "CLOUD — Web OS Portal" },
      { property: "og:description", content: "Secure sharing, notes, converters, and chatbot inside a premium Stage Manager workspace." },
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

const APPS_LIST = [
  { id: "uploader", title: "File Cloud", desc: "Share files", icon: Upload },
  { id: "notes", title: "Quick Notes", desc: "Anonymous notes", icon: FileText },
  { id: "convert", title: "Media Convert", desc: "Local transcoders", icon: Archive },
  { id: "ai", title: "AI Assistant", desc: "17 Models & Writer", icon: Sparkles },
  { id: "request-account", title: "Private Account", desc: "Request account", icon: UserPlus },
  { id: "owner", title: "About", desc: "About CLOUD", icon: User },
  { id: "db-console", title: "ssDB Dev Console", desc: "API & Data Nodes", icon: Database }
];

function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMirror, setCopiedMirror] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [retention, setRetention] = useState<"permanent" | "72h">("permanent");
  
  // Private Account Request States
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [showQueenPopup, setShowQueenPopup] = useState(false);
  
  // FAQs accordion
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Local storage history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<"dark" | "dark">("dark");

  // Clock state
  const [timeStr, setTimeStr] = useState("");

  // Stage Manager Window States
  const [openApps, setOpenApps] = useState<string[]>(["uploader"]); // File Cloud is open by default
  const [activeApp, setActiveApp] = useState<string | null>("uploader");

  // Update Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
        " | " + 
        d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load uploader history
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cloud_upload_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // App Launcher controls
  const launchApp = (id: string) => {
    if (id === "request-account") {
      setShowAccountModal(true);
      return;
    }
    if (!openApps.includes(id)) {
      setOpenApps(prev => [...prev, id]);
    }
    setActiveApp(id);
  };

  const closeApp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = openApps.filter(app => app !== id);
    setOpenApps(updated);
    if (activeApp === id) {
      setActiveApp(updated.length > 0 ? updated[updated.length - 1] : null);
    }
  };

  const minimizeApp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeApp === id) {
      setActiveApp(null);
    }
  };

  const handleRequestAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim();
    if (!cleanUsername) return;

    if (cleanUsername.toLowerCase() === "suhu") {
      setShowQueenPopup(true);
      return;
    }

    const email = "skycho@proton.me";
    const subject = encodeURIComponent(`Private Account Request: ${cleanUsername}`);
    const body = encodeURIComponent(
      `Hello AS,\n\nI would like to request a private CLOUD account with the requested username:\n\nUsername: ${cleanUsername}\n\nPlease let me know when it is ready.\n\nBest regards.`
    );
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setShowAccountModal(false);
    setUsernameInput("");
  };

  const saveToHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((x) => x.url !== item.url);
      const updated = [item, ...filtered].slice(0, 30);
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

        xhr.onerror = () => reject(new Error("Network error during direct upload"));

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

      if (retention === "permanent") {
        data = await uploadViaProxy(f);
      } else {
        try {
          data = await uploadDirectLitterbox(f);
        } catch {
          try {
            data = await uploadDirectTmpfiles(f);
          } catch {
            data = await uploadViaProxy(f);
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

  const copyMirrorLink = async (url?: string) => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiedMirror(true);
    setTimeout(() => setCopiedMirror(false), 1500);
  };

  const getMirrorUrl = (originalUrl?: string): string | null => {
    if (!originalUrl) return null;
    const filename = originalUrl.split('/').pop();
    if (!filename) return null;
    return `https://cloud.svro.workers.dev/${filename}`;
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

  const activeAppDetail = APPS_LIST.find(a => a.id === activeApp);

  return (
    <main className="min-h-screen min-h-[100dvh] max-h-screen max-h-[100dvh] bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden select-none">
      {/* Ambient Moving Wallpaper Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Top OS Menu Status Bar */}
      <header className="px-4 sm:px-6 h-11 sm:h-12 flex items-center justify-between border-b border-border/20 backdrop-blur-md sticky top-0 z-[100] bg-background/30 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[13px] sm:text-[14px] font-black tracking-wider text-purple-500">CLOUD OS</span>
          <span className="text-[10px] font-bold text-muted-foreground/80 hidden sm:inline">Stage Manager</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-bold text-muted-foreground tracking-tight">{timeStr}</span>
        </div>
      </header>

      {/* OS Desktop Workspace */}
      <section className="flex-1 relative p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-120px)] sm:h-[calc(100dvh-128px)]">
        
        {/* Left Stage Manager Sidebar (PC/Desktop only, hidden on mobile) */}
        {openApps.length > 0 && (
          <div className="hidden md:flex flex-col gap-3.5 w-32 py-4 justify-center items-center select-none z-30 flex-shrink-0">
            {openApps.map(appId => {
              const app = APPS_LIST.find(a => a.id === appId);
              if (!app) return null;
              const AppIcon = app.icon;
              const isActive = activeApp === appId;
              
              return (
                <button
                  key={appId}
                  onClick={() => setActiveApp(appId)}
                  className={`group relative w-[90px] h-[75px] rounded-[18px] border bg-secondary/15 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive 
                      ? "border-purple-500/40 bg-secondary/30 ring-1 ring-purple-500/10 shadow-lg shadow-purple-500/5" 
                      : "border-border/30 hover:border-border"
                  }`}
                >
                  <div className="size-8 rounded-[10px] bg-background border border-border/20 flex items-center justify-center shadow-sm">
                    <AppIcon className="size-4.5 text-purple-500" />
                  </div>
                  <span className="text-[10px] font-black tracking-tight truncate max-w-[80px] text-muted-foreground group-hover:text-foreground">
                    {app.title}
                  </span>

                  {/* Close app action directly from Stage manager stack */}
                  <button
                    onClick={(e) => closeApp(appId, e)}
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-secondary/80 border border-border/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black text-muted-foreground hover:text-red-500 hover:bg-secondary transition-all"
                  >
                    ×
                  </button>
                </button>
              );
            })}
          </div>
        )}

        {/* Center Stage Workspace Area */}
        <div className="flex-1 relative flex items-center justify-center z-20 h-full w-full">
          {activeApp ? (
            /* Render Focused App Window */
            <div className="w-full max-w-4xl h-full flex flex-col rounded-[18px] sm:rounded-[24px] border border-border/60 bg-[#060608]/75 backdrop-blur-2xl ios-shadow overflow-hidden animate-spring-scale">
              
              {/* Window Title Bar header */}
              <div className="h-12 px-5 flex items-center justify-between border-b border-border/20 bg-secondary/15 select-none flex-shrink-0">
                {/* Control Action bullets */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => closeApp(activeApp, e)}
                    title="Close"
                    className="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-[10px] font-black text-transparent hover:text-black/60 transition-colors"
                  >
                    ×
                  </button>
                  <button
                    onClick={(e) => minimizeApp(activeApp, e)}
                    title="Minimize"
                    className="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-[10px] font-black text-transparent hover:text-black/60 transition-colors"
                  >
                    -
                  </button>
                </div>
                
                {/* Title */}
                {activeAppDetail && (
                  <span className="text-[13px] font-black tracking-tight text-foreground flex items-center gap-2">
                    <activeAppDetail.icon className="size-4 text-purple-500" />
                    {activeAppDetail.title}
                  </span>
                )}
                
                {/* Right Space placeholder */}
                <div className="w-14" />
              </div>
              
              {/* Window Scrollable content viewport */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6 select-text">
                {activeApp === "uploader" && (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="text-center mb-4">
                      <h3 className="text-[28px] md:text-[34px] font-black tracking-tight">Drop a file. Get a link.</h3>
                      <p className="text-[14px] text-muted-foreground mt-1">Direct high-speed uploads. Storage duration: permanent or temporary.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                      <div className="md:col-span-3 space-y-4">
                        {!result && !file && (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragging(false);
                              onFile(e.dataTransfer.files?.[0] ?? null);
                            }}
                            onClick={pick}
                            className={`group cursor-pointer rounded-[20px] border border-dashed p-8 text-center transition-all ${
                              dragging ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"
                            }`}
                          >
                            <input
                              ref={inputRef}
                              type="file"
                              className="hidden"
                              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                            />
                            <div className="mx-auto mb-4 size-12 rounded-[16px] border border-border bg-secondary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="size-5 text-purple-500" />
                            </div>
                            <p className="text-[15px] font-black">Tap to choose or drag here</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">Supports any formats up to 1GB limit.</p>
                          </div>
                        )}

                        {file && !result && (
                          <div className="rounded-[20px] border border-border p-5 space-y-5 bg-secondary/5">
                            <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-[14px] border border-border/10">
                              <div className="size-10 rounded-[10px] bg-foreground/5 flex items-center justify-center text-purple-500 border border-border/10">
                                {getFileIcon(file.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-black truncate">{file.name}</p>
                                <p className="text-[12px] text-muted-foreground">{formatBytes(file.size)}</p>
                              </div>
                              <button onClick={reset} disabled={busy} className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                                <X className="size-4" />
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[12px] font-bold text-muted-foreground">Storage Duration</label>
                              <div className="grid grid-cols-2 gap-1 bg-secondary/50 p-1 rounded-[14px] border border-border/15">
                                <button
                                  onClick={() => setRetention("permanent")}
                                  disabled={busy}
                                  className={`h-9 rounded-[10px] text-[12.5px] font-bold transition-all ${
                                    retention === "permanent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                                  }`}
                                >
                                  Permanent
                                </button>
                                <button
                                  onClick={() => setRetention("72h")}
                                  disabled={busy}
                                  className={`h-9 rounded-[10px] text-[12.5px] font-bold transition-all ${
                                    retention === "72h" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                                  }`}
                                >
                                  Temporary (72h)
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => upload(file)}
                              disabled={busy}
                              className="w-full h-11 rounded-[14px] bg-foreground text-background font-black text-[13.5px] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40"
                            >
                              {busy ? `Uploading (${progress}%)` : "Upload File"}
                            </button>
                          </div>
                        )}

                        {result && result.success && (
                          <div className="rounded-[20px] border border-border p-5 bg-secondary/10 space-y-5">
                            <div className="text-center">
                              <span className="text-[11px] font-black uppercase text-green-500 tracking-wider">Upload Success</span>
                              <h4 className="text-[15px] font-black truncate mt-1">{result.filename}</h4>
                            </div>

                            {/* Link 1: Primary */}
                            <div className="space-y-1.5">
                              <label className="text-[10.5px] font-black uppercase text-muted-foreground tracking-wider">Direct Link</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={result.url}
                                  className="flex-1 h-10 bg-secondary/40 border border-border/30 rounded-[14px] px-3.5 text-[12px] font-bold text-muted-foreground outline-none min-w-0"
                                />
                                <button
                                  onClick={() => copyLink(result.url)}
                                  className="h-10 px-3.5 rounded-[14px] bg-foreground text-background font-bold text-[12px] flex items-center gap-1.5 flex-shrink-0"
                                >
                                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                                </button>
                              </div>
                            </div>

                            {/* Link 2: Mirror */}
                            {retention === "permanent" && getMirrorUrl(result.url) && (
                              <div className="space-y-1.5">
                                <label className="text-[10.5px] font-black uppercase text-purple-500 tracking-wider">Mirror Link</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    readOnly
                                    value={getMirrorUrl(result.url)!}
                                    className="flex-1 h-10 bg-secondary/40 border border-purple-500/20 rounded-[14px] px-3.5 text-[12px] font-bold text-muted-foreground outline-none min-w-0"
                                  />
                                  <button
                                    onClick={() => copyMirrorLink(getMirrorUrl(result.url)!)}
                                    className="h-10 px-3.5 rounded-[14px] bg-purple-600 text-white font-bold text-[12px] flex items-center gap-1.5 flex-shrink-0"
                                  >
                                    {copiedMirror ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                    <span className="hidden sm:inline">{copiedMirror ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            <button onClick={reset} className="w-full h-10 rounded-[14px] border border-border hover:bg-secondary/40 text-[13px] font-bold transition-colors">
                              Upload Another File
                            </button>
                          </div>
                        )}

                        {error && (
                          <div className="rounded-[16px] border border-destructive/20 bg-destructive/5 text-destructive text-[13px] font-bold p-3.5 text-center">
                            Error: {error}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-border/20 pb-2">
                          <span className="text-[12px] font-black tracking-tight uppercase text-muted-foreground">Upload History</span>
                          {history.length > 0 && (
                            <button onClick={clearHistory} className="text-[11px] font-black text-red-500 hover:underline">
                              Clear
                            </button>
                          )}
                        </div>
                        {history.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground select-none">
                            <HardDrive className="size-7 mx-auto opacity-30 mb-1" />
                            <p className="text-[12px] font-bold">History is empty</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {history.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-[12px] border border-border/20 bg-secondary/5 text-[12.5px]">
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="font-bold truncate text-foreground">{item.filename}</p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {formatBytes(item.size)} • {getRelativeTime(item.timestamp)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                                    <ExternalLink className="size-3.5" />
                                  </a>
                                  <button onClick={() => deleteFromHistory(item.url)} className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-red-500">
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FAQs Info */}
                    <div className="space-y-3 pt-4 border-t border-border/10">
                      <h4 className="text-[13px] font-black uppercase text-muted-foreground tracking-wider">FAQs & Upload Help</h4>
                      <div className="space-y-1.5">
                        {[
                          { q: "How long are uploaded files kept?", a: "Files selected as Permanent are saved indefinitely. Files selected as Temporary are automatically purged after 72 hours." },
                          { q: "What is the maximum size allowed?", a: "You can upload any file format up to 200 MB for Permanent storage, and up to 1 GB for Temporary (72h) storage." }
                        ].map((faq, i) => {
                          const isOpen = faqOpen === i;
                          return (
                            <div key={i} className="rounded-[12px] border border-border/20 bg-secondary/5 overflow-hidden">
                              <button onClick={() => setFaqOpen(isOpen ? null : i)} className="w-full px-4 py-2.5 flex items-center justify-between text-left text-[12px] font-bold text-foreground">
                                <span>{faq.q}</span>
                                <ChevronDown className={`size-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                              </button>
                              {isOpen && (
                                <p className="px-4 pb-3 text-[11px] leading-relaxed text-muted-foreground">{faq.a}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === "notes" && <NoteComposer />}
                {activeApp === "convert" && <ConvertPage embed={true} />}
                {activeApp === "ai" && <MorePage embed={true} />}
                {activeApp === "owner" && <OwnerPage embed={true} onLaunchApp={launchApp} />}
                {activeApp === "db-console" && <DbConsole />}
              </div>
            </div>
          ) : (
            /* Render Empty Desktop Icons Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-3xl select-none text-center animate-fade-in">
              {APPS_LIST.filter(item => item.id !== "db-console").map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => launchApp(item.id)}
                    className="p-5 rounded-[24px] border bg-[#08080a]/50 border-border/30 hover:border-purple-500/30 hover:bg-[#0c0c10]/70 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <div className="size-14 rounded-[18px] border border-border bg-[#101014] flex items-center justify-center text-foreground transition-transform shadow-md">
                      <Icon className="size-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-black tracking-tight">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom macOS Style Launcher Dock */}
      <footer className="h-16 sm:h-20 w-full flex items-center justify-center select-none z-[100] pb-2 sm:pb-4 px-3 sm:px-4 sticky bottom-0 flex-shrink-0">
        <div className="h-14 sm:h-16 px-3 sm:px-4 rounded-[18px] sm:rounded-[22px] border border-white/10 bg-[#0c0c0e]/85 backdrop-blur-2xl flex items-center gap-2 sm:gap-3 shadow-2xl w-full max-w-sm justify-center">
          
          {/* Desktop Launcher Icon */}
          <button
            onClick={() => setActiveApp(null)}
            title="Desktop Dashboard"
            className={`group relative size-10 sm:size-11 flex flex-col items-center justify-center rounded-[10px] sm:rounded-[12px] bg-secondary/35 border transition-all duration-150 active:scale-90 ${
              activeApp === null ? "border-purple-500/40 bg-secondary/70" : "border-border/25 hover:border-purple-500/25"
            }`}
          >
            <LayoutGrid className={`size-4 sm:size-4.5 ${activeApp === null ? "text-purple-500" : "text-foreground"}`} />
            {activeApp === null && (
              <span className="absolute bottom-1 size-1 rounded-full bg-purple-500 shadow-md shadow-purple-500/60" />
            )}
          </button>

          <div className="h-8 w-[1px] bg-border/40 mx-1" />

          {APPS_LIST.filter(item => item.id !== "db-console").map((item) => {
            const Icon = item.icon;
            const isOpen = openApps.includes(item.id);
            const isActive = activeApp === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => launchApp(item.id)}
                title={item.title}
                className={`group relative size-10 sm:size-11 flex flex-col items-center justify-center rounded-[10px] sm:rounded-[12px] bg-secondary/35 border transition-all duration-150 active:scale-90 ${
                  isActive ? "border-purple-500/40 bg-secondary/70" : "border-border/25 hover:border-purple-500/25 hover:bg-secondary/70"
                }`}
              >
                <Icon className={`size-4 sm:size-4.5 transition-transform ${isActive ? "text-purple-500 scale-105" : "text-foreground group-hover:scale-110"}`} />
                
                {/* Active/Open indicator lights */}
                {isOpen && (
                  <span className={`absolute bottom-1 size-1 rounded-full ${
                    isActive ? "bg-purple-500 shadow-md shadow-purple-500/60" : "bg-muted-foreground/60"
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </footer>

      <style>{`
        @keyframes blossomFall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(250px) translateX(50px) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
        .blossom-petal {
          position: absolute;
          animation: blossomFall 4s linear infinite;
          pointer-events: none;
          color: #ffb7c5;
          text-shadow: 0 0 6px rgba(255, 183, 197, 0.6);
          z-index: 100;
        }
      `}</style>

      {/* Modal: Create Private Account Request */}
      {showAccountModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-[24px] border border-border bg-secondary/95 p-6 shadow-2xl relative overflow-hidden ios-glass animate-spring-scale select-text">
            <button 
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-background/50 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-[20px] font-black tracking-tight flex items-center gap-2 text-purple-400">
              <UserPlus className="size-5" />
              <span>Request Private Account</span>
            </h3>
            <p className="text-[12.5px] text-muted-foreground mt-2 leading-relaxed">
              Choose your unique username. We will prepare an automated email request to AS to set up your account.
            </p>

            <form onSubmit={handleRequestAccount} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">Desired Username</label>
                <input
                  type="text"
                  required
                  placeholder="Enter username..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full h-11 bg-background border border-border/40 rounded-[14px] px-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-[14px] bg-purple-600 hover:bg-purple-500 text-white font-black text-[13px] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/10"
              >
                Generate Request Mail
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: reserved Queen Popup */}
      {showQueenPopup && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-[24px] border border-pink-500/40 bg-[#160b10]/95 p-6 shadow-2xl relative overflow-hidden ios-glass animate-spring-scale text-center border-t-2 border-t-pink-500 select-text">
            
            {/* Falling Cherry Blossoms */}
            {Array.from({ length: 15 }).map((_, i) => (
              <span 
                key={i} 
                className="blossom-petal"
                style={{
                  left: `${Math.random() * 85}%`,
                  top: `${-20 - Math.random() * 30}px`,
                  animationDelay: `${Math.random() * 3.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  fontSize: `${12 + Math.random() * 12}px`
                }}
              >
                🌸
              </span>
            ))}

            <div className="mx-auto size-14 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
              <Crown className="size-7 text-pink-400 animate-pulse" />
            </div>

            <h4 className="text-[17px] font-black tracking-tight text-pink-300 flex items-center justify-center gap-1.5">
              <Sparkles className="size-4 text-pink-400" />
              Reserved Username
            </h4>
            
            <p className="text-[14px] text-pink-100/90 mt-3 leading-relaxed font-bold px-2">
              This username is reserved in honor of Her Majesty the Queen. 🌸👑
            </p>

            <button
              onClick={() => {
                setShowQueenPopup(false);
                setShowAccountModal(false);
                setUsernameInput("");
              }}
              className="mt-6 w-full h-10 rounded-[14px] bg-pink-600 hover:bg-pink-500 text-white font-bold text-[12.5px] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Accept Majesty
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
