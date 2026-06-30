import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  Video,
  Music,
  FileText,
  Archive,
  Image as ImageIcon
} from "lucide-react";

export const Route = createFileRoute("/main")({
  component: FileCloudPage,
});

interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
  error?: string;
}

interface HistoryItem {
  url: string;
  filename: string;
  size: number;
  type: string;
  timestamp: number;
}

function getFileTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.startsWith("image/")) return <ImageIcon className="size-5 text-purple-400" />;
  if (t.startsWith("video/")) return <Video className="size-5 text-purple-400" />;
  if (t.startsWith("audio/")) return <Music className="size-5 text-purple-400" />;
  if (t.startsWith("text/") || t.includes("pdf") || t.includes("document") || t.includes("office")) return <FileText className="size-5 text-purple-400" />;
  if (t.includes("zip") || t.includes("tar") || t.includes("rar") || t.includes("gzip") || t.includes("compressed")) return <Archive className="size-5 text-purple-400" />;
  return <FileIcon className="size-5 text-purple-400" />;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function FileCloudPage({ embed = false }: { embed?: boolean }) {
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (embed) return;
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, [embed]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cloud_upload_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((x) => x.url !== item.url);
      const updated = [item, ...filtered].slice(0, 50); // limit to 50
      localStorage.setItem("cloud_upload_history", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFromHistory = (url: string) => {
    setHistory((prev) => {
      const updated = prev.filter((x) => x.url !== url);
      localStorage.setItem("cloud_upload_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragging(true);
    } else if (e.type === "dragleave") {
      setDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (f: File) => {
    setError(null);
    setResult(null);
    setFile(f);
    setProgress(0);

    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreviewUrl(null);
    }
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
          resolve({
            success: true,
            url: text,
            filename: fileToUpload.name,
            size: fileToUpload.size,
            type: fileToUpload.type,
          });
        } else {
          reject(new Error(text || `Litterbox upload failed (${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error("Litterbox network error"));

      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("time", "72h");
      fd.append("fileToUpload", fileToUpload, fileToUpload.name || "upload");

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
          if (xhr.status >= 200 && xhr.status < 300 && json.status === "success") {
            const rawUrl = json.data.url;
            const finalUrl = rawUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
            resolve({
              success: true,
              url: finalUrl,
              filename: fileToUpload.name,
              size: fileToUpload.size,
              type: fileToUpload.type,
            });
          } else {
            reject(new Error(json.error || `Tmpfiles upload failed (${xhr.status})`));
          }
        } catch {
          reject(new Error(`Tmpfiles parse error`));
        }
      };

      xhr.onerror = () => reject(new Error("Tmpfiles network error"));

      const fd = new FormData();
      fd.append("file", fileToUpload, fileToUpload.name || "upload");

      xhr.send(fd);
    });
  };

  const upload = async (f: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);

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

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMirrorLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedMirror(true);
    setTimeout(() => setCopiedMirror(false), 2000);
  };

  const getMirrorUrl = (url: string) => {
    if (!url || !url.includes("catbox.moe")) return null;
    const key = url.split("/").pop();
    if (!key) return null;
    return `https://cloud.svro.workers.dev/${key}`;
  };

  const content = (
    <div className={`w-full max-w-4xl mx-auto space-y-8 text-left ${embed ? "py-2" : "px-4 py-8 sm:py-12"}`}>
      
      {/* Page Title Intro */}
      <div className="text-center md:text-left">
        <h2 className="text-[34px] md:text-[44px] font-black tracking-tight leading-[1.1] select-none">
          File Cloud.
          <br />
          <span className="opacity-40">Permanent & Temporary.</span>
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground max-w-md">
          Secure, anonymous uploads with direct links. Permanent nodes are served from CDN edges globally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start w-full">
        {/* Left: Drag Drop Area */}
        <div className="md:col-span-3 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`group border border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden select-none ${
              dragging
                ? "border-purple-500 bg-purple-500/5 scale-[1.01]"
                : "border-border/60 hover:border-purple-500/40 bg-secondary/15 hover:bg-secondary/25"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
              className="hidden"
            />

            {previewUrl ? (
              <div className="absolute inset-0 z-0 p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-[16px] opacity-25 filter blur-[2px]"
                />
              </div>
            ) : null}

            <div className="relative z-10 space-y-4">
              <div className="size-14 rounded-[20px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Upload className="size-6" />
              </div>
              <div>
                <p className="text-[15px] font-black tracking-tight">
                  {file ? file.name : "Select or Drop any file"}
                </p>
                <p className="text-[12px] text-muted-foreground/80 mt-1">
                  {file ? `${formatBytes(file.size)} • ${file.type || "unknown"}` : "Supports documents, audio, videos, archives"}
                </p>
              </div>
            </div>
          </div>

          {file && (
            <div className="rounded-[20px] border border-border bg-secondary/15 p-5 space-y-5 animate-spring-scale select-none">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Retention Config</span>
                  <div className="flex bg-background border border-border/40 p-0.5 rounded-[12px] mt-1.5 gap-0.5">
                    <button
                      onClick={() => setRetention("permanent")}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-[10px] text-[11.5px] font-black tracking-tight transition-all ${
                        retention === "permanent" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Permanent (Catbox)
                    </button>
                    <button
                      onClick={() => setRetention("72h")}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-[10px] text-[11.5px] font-black tracking-tight transition-all ${
                        retention === "72h" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Temporary (72h)
                    </button>
                  </div>
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

          {error && (
            <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 text-destructive text-[12.5px] font-bold p-4 text-center select-none animate-shiver">
              {error}
            </div>
          )}

          {result && result.success && (
            <div className="rounded-[20px] border border-border p-5 bg-secondary/10 space-y-5 animate-spring-scale">
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
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-4">
            <h3 className="text-[17px] font-black tracking-tight border-b border-border/30 pb-2.5 flex items-center gap-2 select-none text-muted-foreground">
              <Clock className="size-4.5" />
              <span>Upload History</span>
            </h3>

            {history.length > 0 ? (
              <div className="grid gap-2 max-h-[380px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.url}
                    className="flex items-center justify-between p-3.5 rounded-[18px] border border-border/40 bg-secondary/5 hover:border-foreground/30 transition-all select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <div className="size-9 rounded-[12px] bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                        {getFileTypeIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold truncate text-foreground">{item.filename}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatBytes(item.size)} • {getRelativeTime(item.timestamp)}
                        </p>
                      </div>
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
            ) : (
              <div className="border border-dashed border-border/40 rounded-[24px] p-8 text-center text-muted-foreground/70 select-none">
                <HardDrive className="size-8 mx-auto mb-3 opacity-40" />
                <p className="text-[14px] font-semibold">Workspace is clean</p>
                <p className="text-[12px] mt-1 text-muted-foreground/50">Your uploaded files will appear here on this device.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (embed) return content;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative">
      <header className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-2xl md:max-w-6xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
          <Link to="/main" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none flex-shrink-0">
            CLOUD
          </Link>
          <Link to="/note" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            NOTES
          </Link>
          <Link to="/convert" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            CONVERTS
          </Link>
          <Link to="/owner" className="text-[16px] sm:text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
            ABOUT
          </Link>
        </div>

        <button 
          onClick={toggleTheme}
          className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90 flex-shrink-0 ml-3"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </header>

      {content}
    </main>
  );
}
