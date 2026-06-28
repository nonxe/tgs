import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { 
  Sun, 
  Moon, 
  Copy, 
  Plus, 
  ExternalLink, 
  Trash2, 
  FileText, 
  BookOpen,
  ArrowRight,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

interface NoteHistoryItem {
  path: string;
  title: string;
  timestamp: number;
  wordCount: number;
}

export const Route = createFileRoute("/note")({
  component: NotePage,
});

function NotePage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<NoteHistoryItem[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Load theme and history
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    const savedHistory = localStorage.getItem("note_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const getTelegraphToken = async (): Promise<string> => {
    let token = localStorage.getItem("tg_token");
    if (!token) {
      try {
        const res = await fetch("https://api.telegra.ph/createAccount?short_name=iOSNotes&author_name=Anonymous");
        const data = await res.json();
        if (data.ok) {
          token = data.result.access_token;
          if (token) localStorage.setItem("tg_token", token);
        }
      } catch (e) {
        console.error("Token creation failed, trying fallback...", e);
      }
    }
    return token || "b968da50dcdb253c9e04a36e35ac26f5619621f6a13d1a52c3c4314c13a0";
  };

  const textToTelegraphNodes = (text: string) => {
    return text.split("\n").map((line) => ({
      tag: "p",
      children: [line || " "],
    }));
  };

  const publishNote = async () => {
    const finalTitle = title.trim() || "Untitled Note";
    const finalContent = content.trim();

    if (!finalContent) {
      setError("Please write some content in your note.");
      return;
    }

    setBusy(true);
    setError(null);
    setPublishedUrl(null);

    try {
      const token = await getTelegraphToken();
      const nodes = textToTelegraphNodes(finalContent);

      const formData = new URLSearchParams();
      formData.append("access_token", token);
      formData.append("title", finalTitle);
      formData.append("content", JSON.stringify(nodes));
      formData.append("return_content", "true");

      const response = await fetch("https://api.telegra.ph/createPage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.ok && data.result?.path) {
        const path = data.result.path;
        const finalUrl = `${window.location.origin}/note/${path}`;
        setPublishedUrl(finalUrl);

        // Save to local history
        const newHistoryItem: NoteHistoryItem = {
          path,
          title: finalTitle,
          timestamp: Date.now(),
          wordCount: finalContent.split(/\s+/).filter(Boolean).length,
        };

        const updatedHistory = [newHistoryItem, ...history.filter(h => h.path !== path)];
        setHistory(updatedHistory);
        localStorage.setItem("note_history", JSON.stringify(updatedHistory));

        // Reset composer
        setTitle("");
        setContent("");
      } else {
        throw new Error(data.error || "Telegraph API reported failure");
      }
    } catch (e) {
      setError((e as Error).message || "Failed to publish note");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteFromHistory = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = history.filter((h) => h.path !== path);
    setHistory(updated);
    localStorage.setItem("note_history", JSON.stringify(updated));
  };

  const formatRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-2xl mx-auto w-full border-b border-border/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[20px] font-black tracking-tighter select-none opacity-40 hover:opacity-100 transition-opacity">
            CLOUD
          </Link>
          <span className="text-[20px] font-black tracking-tighter select-none">
            NOTES
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={publishNote}
            disabled={busy || !content.trim()}
            className="h-10 px-5 rounded-full bg-foreground text-background font-bold text-[14px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none ios-tap-active flex items-center gap-1.5"
          >
            {busy ? "Saving..." : "Save Note"}
          </button>
          
          <button 
            onClick={toggleTheme}
            className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>
      </header>

      {/* Main Composer */}
      <section className="flex-1 flex flex-col px-4 py-8 max-w-2xl mx-auto w-full gap-4">
        {error && (
          <div className="rounded-[16px] border border-destructive/20 bg-destructive/5 text-destructive text-[14px] font-semibold p-4 text-center animate-shiver">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-secondary/35 text-[24px] font-black tracking-tight placeholder-foreground/30 border border-border/30 rounded-[20px] px-5 py-4 outline-none focus:border-foreground/50 transition-all focus:bg-secondary/60"
            maxLength={100}
          />

          <textarea
            ref={contentRef}
            placeholder="Start typing your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 min-h-[300px] bg-secondary/35 text-[17px] leading-[1.65] placeholder-foreground/30 border border-border/30 rounded-[24px] p-6 outline-none focus:border-foreground/50 transition-all resize-none focus:bg-secondary/60"
          />
        </div>

        {/* History List */}
        {history.length > 0 && (
          <div className="mt-8 space-y-4 animate-slide-up">
            <h3 className="text-[17px] font-black tracking-tight border-b border-border/30 pb-2.5 flex items-center gap-2 select-none">
              <BookOpen className="size-4.5 opacity-60" />
              <span>Published Notes</span>
            </h3>

            <div className="grid gap-2">
              {history.map((item) => (
                <div
                  key={item.path}
                  onClick={() => navigate({ to: `/note/${item.path}` })}
                  className="group flex items-center justify-between p-4 rounded-[18px] border border-border/40 hover:border-foreground/45 hover:bg-secondary/20 transition-all duration-300 cursor-pointer ios-glass"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[15px] font-bold truncate tracking-tight">{item.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      {item.wordCount} words • {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => deleteFromHistory(item.path, e)}
                      className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                      title="Remove from history"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <ArrowRight className="size-4 opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Published Link Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-card p-6 space-y-6 ios-glass ios-shadow animate-spring-scale text-center">
            <div className="mx-auto size-14 rounded-[20px] bg-foreground/5 flex items-center justify-center text-foreground">
              <Sparkles className="size-6 text-foreground animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-[20px] font-black tracking-tight">Note Published!</h3>
              <p className="text-[14px] text-muted-foreground max-w-xs mx-auto">
                Your note is saved permanently and anonymously on Telegraph. Share the link below:
              </p>
            </div>

            <div className="bg-secondary/40 border border-border/30 rounded-[16px] p-3 text-[14px] font-semibold break-all text-center flex items-center justify-center gap-2">
              <LinkIcon className="size-4 opacity-50 flex-shrink-0" />
              <span>{publishedUrl}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setPublishedUrl(null)}
                className="h-12 rounded-full border border-border font-bold text-[14px] hover:bg-secondary active:scale-[0.97] transition-all"
              >
                Close
              </button>
              <button
                onClick={copyLink}
                className={`h-12 rounded-full font-bold text-[14px] text-background bg-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${
                  copied ? "bg-green-600 text-white" : ""
                }`}
              >
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
