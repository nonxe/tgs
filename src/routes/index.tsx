import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloud — Upload & share files" },
      { name: "description", content: "Upload any file and get a clean shareable link." },
      { property: "og:title", content: "Cloud — Upload & share files" },
      { property: "og:description", content: "Upload any file and get a clean shareable link." },
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

function formatBytes(n?: number) {
  if (!n && n !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [server, setServer] = useState<string>("us");

  const servers: { id: string; flag: string; name: string; tier: "free" | "premium" }[] = [
    { id: "us", flag: "🇺🇸", name: "United States", tier: "free" },
    { id: "tw", flag: "🇹🇼", name: "Taiwan", tier: "free" },
    { id: "cn", flag: "🇨🇳", name: "China", tier: "premium" },
    { id: "xk", flag: "🇽🇰", name: "Kosovo", tier: "premium" },
    { id: "de", flag: "🇩🇪", name: "Germany", tier: "premium" },
    { id: "ru", flag: "🇷🇺", name: "Russian Federation", tier: "premium" },
    { id: "kr", flag: "🇰🇷", name: "South Korea", tier: "premium" },
    { id: "sg", flag: "🇸🇬", name: "Singapore", tier: "premium" },
    { id: "fr", flag: "🇫🇷", name: "France", tier: "premium" },
    { id: "gb", flag: "🇬🇧", name: "United Kingdom", tier: "premium" },
    { id: "ca", flag: "🇨🇦", name: "Canada", tier: "premium" },
  ];

  const pick = () => inputRef.current?.click();

  const upload = async (f: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Upload through our own endpoint, which streams the body to the
      // upstream provider. Browsers block direct cross-origin upload to
      // catbox/litterbox because they don't send CORS headers.
      const data = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/public/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300 && json.success) resolve(json);
            else reject(new Error(json.error || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        const fd = new FormData();
        fd.append("file", f, f.name || "upload");
        xhr.send(fd);
      });

      setResult({
        success: true,
        url: data.url,
        filename: data.filename,
        size: f.size,
        type: f.type,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const copy = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 pt-8 pb-2 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-semibold tracking-tight">Cloud</h1>
        </div>
        <span className="text-[13px] text-muted-foreground">Upload · Share</span>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-[34px] leading-[1.1] font-semibold tracking-tight">
              Drop a file.
              <br />
              <span className="text-muted-foreground">Get a link.</span>
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Photos, videos, audio, docs — anything.
            </p>
          </div>

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
              className={`relative cursor-pointer rounded-2xl border border-dashed transition-all p-8 text-center backdrop-blur-xl bg-card/60 ${
                dragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <div className="mx-auto mb-4 size-14 rounded-2xl bg-secondary flex items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="m7 8 5-5 5 5" />
                  <path d="M5 21h14" />
                </svg>
              </div>
              <p className="text-[15px] font-medium">Tap to choose or drop here</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Up to 200MB</p>
            </div>
          )}

          {file && !result && (
            <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium truncate">{file.name}</p>
                  <p className="text-[13px] text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                {!busy && (
                  <button
                    onClick={reset}
                    className="text-[13px] text-muted-foreground hover:text-foreground transition px-2"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div>
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Choose server
                </p>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                  {servers.map((s) => {
                    const disabled = s.tier === "premium";
                    const active = server === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={disabled || busy}
                        onClick={() => setServer(s.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${
                          active && !disabled
                            ? "bg-primary/10"
                            : disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-secondary/60"
                        }`}
                      >
                        <span className="text-[20px] leading-none">{s.flag}</span>
                        <span className="flex-1 text-[14px] font-medium truncate">{s.name}</span>
                        {disabled ? (
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            Premium
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                            Free
                          </span>
                        )}
                        {active && !disabled && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {busy && (
                <div>
                  <div className="flex justify-between text-[12px] text-muted-foreground mb-1.5">
                    <span>Uploading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => file && upload(file)}
                disabled={busy}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-[15px] font-medium active:scale-[0.98] transition disabled:opacity-60"
              >
                {busy ? "Uploading…" : "Upload"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-destructive/10 text-destructive text-[14px] px-4 py-3 text-center">
              {error}
            </div>
          )}

          {result?.url && (
            <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium truncate">
                    {file?.name ?? result.filename}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {formatBytes(result.size)} · Ready
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/60 px-3 py-2.5 text-[13px] font-mono break-all text-foreground/90">
                {result.url}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copy}
                  className="h-11 rounded-xl bg-primary text-primary-foreground text-[15px] font-medium active:scale-[0.98] transition"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 rounded-xl bg-secondary text-foreground text-[15px] font-medium flex items-center justify-center active:scale-[0.98] transition"
                >
                  Open
                </a>
              </div>

              <button
                onClick={reset}
                className="w-full text-[14px] text-muted-foreground hover:text-foreground transition pt-1"
              >
                Upload another
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center text-[12px] text-muted-foreground pb-6">
        Files are hosted on our cloud · Links don't expire
      </footer>
    </main>
  );
}
