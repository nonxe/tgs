import { useState } from "react";
import { 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  BookOpen, 
  Play, 
  Send, 
  ArrowRight,
  Code2
} from "lucide-react";

export function DbConsole() {
  // Publisher state
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState("{\n  \"status\": \"success\",\n  \"message\": \"Hello from ssDB\"\n}");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbKey, setDbKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Playground state
  const [searchKey, setSearchKey] = useState("");
  const [fetching, setFetching] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const [playResult, setPlayResult] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"docs" | "create" | "play">("docs");

  const CHARS_63 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
  const CHARS_62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const encodeSlug = (slug: string): string => {
    let val = 1n; // Sentinel
    for (let i = 0; i < slug.length; i++) {
      const idx = BigInt(CHARS_63.indexOf(slug[i]));
      val = val * 63n + idx;
    }
    
    let res = "";
    while (val > 0n) {
      const rem = val % 62n;
      res = CHARS_62[Number(rem)] + res;
      val = val / 62n;
    }
    return res;
  };

  const getTelegraphToken = async (): Promise<string> => {
    let token = localStorage.getItem("tg_token");
    if (!token) {
      try {
        const res = await fetch("https://api.telegra.ph/createAccount?short_name=ssDB&author_name=Anonymous");
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

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDbKey(null);
    
    const cleanPayload = payload.trim();
    if (!cleanPayload) {
      setError("Payload cannot be empty.");
      return;
    }

    // Try to validate JSON
    try {
      JSON.parse(cleanPayload);
    } catch {
      if (!confirm("Payload does not appear to be valid JSON. Do you still want to save it as raw text?")) {
        return;
      }
    }

    setBusy(true);
    try {
      const token = await getTelegraphToken();
      
      // Wrap note data in Telegra.ph structure
      const nodes = [
        {
          tag: "h1",
          children: [title.trim() || "ssDB Node"]
        },
        ...cleanPayload.split("\n").map(line => ({
          tag: "p",
          children: [line || " "]
        }))
      ];

      const formData = new URLSearchParams();
      formData.append("access_token", token);
      formData.append("title", "n"); // Short fixed title for short code
      formData.append("content", JSON.stringify(nodes));

      const response = await fetch("https://api.telegra.ph/createPage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.ok && data.result?.path) {
        const shortCode = encodeSlug(data.result.path);
        setDbKey(shortCode);
        setTitle("");
        setPayload("{\n  \n}");
      } else {
        throw new Error(data.error || "Telegra.ph rejected request");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create database node.");
    } finally {
      setBusy(false);
    }
  };

  const handlePlaygroundFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayError(null);
    setPlayResult(null);

    const key = searchKey.trim();
    if (!key) return;

    setFetching(true);
    try {
      const res = await fetch(`/db/${key}`);
      const data = await res.json();
      if (res.ok) {
        setPlayResult(JSON.stringify(data, null, 2));
      } else {
        setPlayError(data.error || "Key not found");
      }
    } catch {
      setPlayError("Connection failed");
    } finally {
      setFetching(false);
    }
  };

  const copyText = async (text: string, type: "key" | "url") => {
    await navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1500);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1500);
    }
  };

  const getDbUrl = (key: string) => {
    if (typeof window === "undefined") return `/db/${key}`;
    return `${window.location.origin}/db/${key}`;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto space-y-5 select-text">
      
      {/* Navigation Headers */}
      <div className="flex border-b border-border/20 bg-secondary/10 p-1 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex-1 h-9 rounded-lg text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "docs" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4" />
          <span>API Docs</span>
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 h-9 rounded-lg text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "create" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="size-4" />
          <span>Create Key</span>
        </button>
        <button
          onClick={() => setActiveTab("play")}
          className={`flex-1 h-9 rounded-lg text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "play" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Play className="size-4" />
          <span>Playground</span>
        </button>
      </div>

      {/* Content Viewports */}
      <div className="flex-1 overflow-y-auto min-h-[350px] pr-1 space-y-4">
        
        {/* Tab 1: API Docs */}
        {activeTab === "docs" && (
          <div className="space-y-5 animate-slide-up text-left">
            <div className="space-y-1">
              <h3 className="text-[20px] font-black tracking-tight text-purple-400 flex items-center gap-2">
                <Database className="size-5" />
                <span>ssDB Engine API</span>
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                ssDB is an ultra-fast, serverless, database-free JSON store built directly on top of our anonymous edge storage engine. You can fetch and feed JSON parameters directly into your scripts.
              </p>
            </div>

            {/* API Endpoints */}
            <div className="rounded-xl border border-border/30 bg-secondary/5 p-4 space-y-3.5">
              <span className="text-[10px] font-black uppercase text-purple-500 tracking-wider">REST Endpoints</span>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/25 px-1.5 py-0.5 rounded">GET</span>
                    <code className="text-[12px] font-black text-foreground">/db/&lt;unique_key&gt;</code>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed">
                    Retrieve the stored JSON or plain-text payload dynamically with full CORS support.
                  </p>
                </div>
              </div>
            </div>

            {/* Code Examples */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">Fetch Examples</span>
              
              <div className="rounded-xl border border-border/30 bg-secondary/15 p-4 space-y-3.5">
                <div className="flex items-center gap-2 text-purple-400">
                  <Code2 className="size-4" />
                  <span className="text-[12px] font-black">JavaScript Fetch</span>
                </div>
                <pre className="text-[11px] font-mono leading-relaxed bg-[#0b0b0e] p-3.5 rounded-lg border border-border/10 text-emerald-400 overflow-x-auto">
{`fetch("https://yourdomain.com/db/unique_key")
  .then(res => res.json())
  .then(data => {
    console.log("Database Data:", data.data);
  });`}
                </pre>
              </div>

              <div className="rounded-xl border border-border/30 bg-secondary/15 p-4 space-y-3.5">
                <div className="flex items-center gap-2 text-purple-400">
                  <Terminal className="size-4" />
                  <span className="text-[12px] font-black">cURL</span>
                </div>
                <pre className="text-[11px] font-mono leading-relaxed bg-[#0b0b0e] p-3.5 rounded-lg border border-border/10 text-emerald-400 overflow-x-auto">
{`curl -X GET "https://yourdomain.com/db/unique_key"`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Create key */}
        {activeTab === "create" && (
          <div className="space-y-4 animate-slide-up text-left">
            <div className="space-y-1">
              <h3 className="text-[18px] font-black tracking-tight text-purple-400">Create Data Node</h3>
              <p className="text-[12.5px] text-muted-foreground">Publish JSON payloads directly to ssDB and get an edge API endpoint instantly.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-[12.5px] font-bold p-3 text-center">
                {error}
              </div>
            )}

            {dbKey ? (
              <div className="rounded-xl border border-purple-500/25 bg-purple-500/5 p-5 space-y-4 animate-spring-scale">
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase text-green-500 tracking-wider">Node Published Successfully</span>
                  <h4 className="text-[13.5px] font-black text-muted-foreground mt-1">Node Key: {dbKey}</h4>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Database API Endpoint</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getDbUrl(dbKey)}
                        className="flex-1 h-10 bg-secondary/40 border border-border/30 rounded-xl px-3.5 text-[12px] font-bold text-muted-foreground outline-none min-w-0"
                      />
                      <button
                        onClick={() => copyText(getDbUrl(dbKey), "url")}
                        className="h-10 px-3.5 rounded-xl bg-foreground text-background font-bold text-[12px] flex items-center gap-1.5 flex-shrink-0"
                      >
                        {copiedUrl ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDbKey(null)}
                  className="w-full h-10 rounded-xl border border-border hover:bg-secondary/40 text-[12.5px] font-bold transition-colors"
                >
                  Create Another Node
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateNode} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-black uppercase text-muted-foreground tracking-wider">Node Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. userConfig..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 bg-background border border-border/40 rounded-xl px-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-black uppercase text-muted-foreground tracking-wider">Payload (JSON or Text)</label>
                  <textarea
                    required
                    placeholder="Paste config or payload..."
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="w-full min-h-[160px] bg-background border border-border/40 rounded-xl p-4 text-[12.5px] font-mono text-emerald-400 outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[13px] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/10 disabled:opacity-50"
                >
                  {busy ? "Publishing to ssDB..." : "Create Node"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Playground */}
        {activeTab === "play" && (
          <div className="space-y-4 animate-slide-up text-left">
            <div className="space-y-1">
              <h3 className="text-[18px] font-black tracking-tight text-purple-400">Database Playground</h3>
              <p className="text-[12.5px] text-muted-foreground">Test endpoints and query stored records dynamically from edge layers.</p>
            </div>

            <form onSubmit={handlePlaygroundFetch} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter unique key/ID..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="flex-1 h-11 bg-background border border-border/40 rounded-xl px-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={fetching || !searchKey.trim()}
                className="h-11 px-5 rounded-xl bg-foreground text-background font-bold text-[13px] flex items-center gap-1.5 flex-shrink-0 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {fetching ? "Querying..." : "Execute"}
                <ArrowRight className="size-4" />
              </button>
            </form>

            {playError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-[12.5px] font-bold p-3 text-center">
                Query Failed: {playError}
              </div>
            )}

            {playResult && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">JSON Response Payload</span>
                <pre className="text-[11.5px] font-mono leading-relaxed bg-[#0b0b0e] p-4 rounded-xl border border-border/10 text-emerald-400 overflow-x-auto max-h-[280px] overflow-y-auto">
                  {playResult}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
