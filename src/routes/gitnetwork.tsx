import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Network,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  ArrowLeft,
  Database,
  Key,
  Terminal,
  Clock,
  Loader2,
  AlertCircle,
  Code2,
  Layers,
  Sparkles,
  Server,
  Folder,
  FileText,
  ChevronRight,
  CornerDownLeft,
} from "lucide-react";

interface GitNetworkCluster {
  id: string;
  name: string;
  owner: string;
  apiKey: string;
  createdAt: string;
  collections?: {
    [col: string]: any[];
  };
}

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  text: string;
  path?: string;
}

function GitNetworkPage() {
  const [clusters, setClusters] = useState<GitNetworkCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dbName, setDbName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Mode Switcher & Playground State ──
  const [mode, setMode] = useState<"gui" | "terminal">("gui");
  const [selectedCluster, setSelectedCluster] = useState<GitNetworkCluster | null>(null);
  const [collection, setCollection] = useState("users");
  const [action, setAction] = useState<"find" | "insert" | "update" | "delete">("find");
  const [jsonPayload, setJsonPayload] = useState<string>(
    JSON.stringify({ filter: {} }, null, 2)
  );
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [execTime, setExecTime] = useState<number | null>(null);

  // ── Terminal CLI State ──
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [termInput, setTermInput] = useState<string>("");
  const [termHistory, setTermHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [termLines, setTermLines] = useState<TerminalLine[]>([
    {
      id: "sys_1",
      type: "system",
      text: "GitNetwork OS Edge Terminal Shell v2.4 (x86_64-cloudflare-worker)",
    },
    {
      id: "sys_2",
      type: "system",
      text: "Type 'help' or 'commands' for available CLI commands. Type 'pwd', 'ls', 'cd', 'cat', or Mongo syntax 'db.<col>.find()'.",
    },
  ]);

  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (stored) {
        const acc = JSON.parse(stored);
        if (acc?.id) setUserId(acc.id);
      }
    } catch {}
  }, []);

  const fetchClusters = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gitnetwork/manage?owner=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.clusters)) {
        setClusters(data.clusters);
        if (data.clusters.length > 0 && !selectedCluster) {
          setSelectedCluster(data.clusters[0]);
        }
      }
    } catch {}
    setLoading(false);
  }, [userId, selectedCluster]);

  useEffect(() => {
    if (userId) fetchClusters();
  }, [userId, fetchClusters]);

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/gitnetwork/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dbName.trim(),
          owner: userId || "anonymous",
        }),
      });
      const data = await res.json();
      if (data.success && data.cluster) {
        setDbName("");
        setSelectedCluster(data.cluster);
        fetchClusters();
      } else {
        setError(data.error || "Failed to create database cluster.");
      }
    } catch {
      setError("Network error.");
    }
    setCreating(false);
  };

  const handleDeleteCluster = async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/gitnetwork/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, owner: userId }),
      });
      const data = await res.json();
      if (data.success) {
        setClusters((prev) => prev.filter((c) => c.id !== id));
        if (selectedCluster?.id === id) {
          setSelectedCluster(null);
        }
      }
    } catch {}
  };

  const copyString = (str: string, label: string) => {
    navigator.clipboard.writeText(str);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadPreset = (presetAction: "find" | "insert" | "update" | "delete") => {
    setAction(presetAction);
    if (presetAction === "find") {
      setJsonPayload(JSON.stringify({ filter: {} }, null, 2));
    } else if (presetAction === "insert") {
      setJsonPayload(
        JSON.stringify(
          { doc: { name: "Alice Smith", email: "alice@example.com", status: "active" } },
          null,
          2
        )
      );
    } else if (presetAction === "update") {
      setJsonPayload(
        JSON.stringify(
          { filter: { status: "active" }, update: { status: "verified" } },
          null,
          2
        )
      );
    } else if (presetAction === "delete") {
      setJsonPayload(JSON.stringify({ filter: { name: "Alice Smith" } }, null, 2));
    }
  };

  const handleExecuteQuery = async () => {
    if (!selectedCluster) {
      setError("Please select or create a database cluster first.");
      return;
    }
    setQueryLoading(true);
    setError(null);
    setQueryResult(null);
    setExecTime(null);

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(jsonPayload);
    } catch {
      setError("Invalid JSON format in payload editor.");
      setQueryLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/gitnetwork/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: selectedCluster.id,
          key: selectedCluster.apiKey,
          collection: collection.trim(),
          action,
          payload: parsedPayload,
        }),
      });
      const data = await res.json();
      setQueryResult(data);
      if (typeof data.executionTimeMs === "number") {
        setExecTime(data.executionTimeMs);
      }
    } catch (err: any) {
      setError("Query execution failed: " + err.message);
    }
    setQueryLoading(false);
  };

  // ── Terminal CLI Submit & Interpreter ──
  useEffect(() => {
    if (mode === "terminal") {
      termEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [termLines, mode]);

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmdText = termInput.trim();
    if (!cmdText) return;

    const inputLine: TerminalLine = {
      id: "line_" + Date.now() + "_" + Math.random(),
      type: "input",
      text: cmdText,
      path: currentPath,
    };

    setTermHistory((prev) => [...prev, cmdText]);
    setHistoryIndex(-1);
    setTermInput("");

    const parts = cmdText.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputText = "";
    let lineType: "output" | "error" | "system" = "output";

    if (cmd === "clear" || cmd === "cls") {
      setTermLines([]);
      return;
    }

    if (cmd === "pwd") {
      outputText = currentPath;
    } else if (cmd === "whoami") {
      outputText = `User: ${userId || "Guest"} | Active Cluster: ${selectedCluster?.name || "None"} (${selectedCluster?.id || "N/A"})`;
    } else if (cmd === "help" || cmd === "commands") {
      outputText = `Available Commands:
  pwd                            - Print working directory
  cd <dir>                       - Change working directory (e.g. cd /, cd collections, cd users, cd ..)
  ls / dir                       - List directory contents (collections or documents)
  cat <doc_id>                   - Display JSON content of a document
  mkdir <col_name>               - Create a new collection
  connect <uri>                  - Connect using gitnetwork+srv://... URI
  db.<collection>.find()         - Run Mongo find query
  db.<collection>.insertOne(doc) - Run Mongo insert query
  node -v / node -e "<code>"     - Node.js runtime environment & JS code execution
  git status / log / clone / ... - Git version control CLI commands
  npm -v / install / run         - Node package manager commands
  python -v / -c "<code>"        - Python interpreter CLI
  curl <url> / fetch <url>       - Fetch HTTP endpoint content directly in shell
  systeminfo / uname             - Display Cloud OS environment specifications
  echo / date / whoami           - Print system variables, time, and user info
  clear / cls                    - Clear terminal screen`;
    } else if (cmd === "cd") {
      const target = args[0] || "/";
      if (target === "/" || target === "~") {
        setCurrentPath("/");
        outputText = "Directory changed to /";
      } else if (target === ".." || target === "../") {
        if (currentPath.startsWith("/collections/")) {
          setCurrentPath("/collections");
          outputText = "Directory changed to /collections";
        } else {
          setCurrentPath("/");
          outputText = "Directory changed to /";
        }
      } else if (target === "collections" || target === "/collections") {
        setCurrentPath("/collections");
        outputText = "Directory changed to /collections";
      } else {
        const cleanName = target.replace(/^\//, "").replace(/\/$/, "");
        setCurrentPath(`/collections/${cleanName}`);
        outputText = `Directory changed to /collections/${cleanName}`;
      }
    } else if (cmd === "ls" || cmd === "dir") {
      if (currentPath === "/") {
        outputText = "collections/    clusters/    system.log    config.json";
      } else if (currentPath === "/collections") {
        if (!selectedCluster) {
          outputText = "No active database cluster connected. Connect or select a cluster first.";
          lineType = "error";
        } else {
          const cols = selectedCluster.collections ? Object.keys(selectedCluster.collections) : [];
          outputText = cols.length > 0 ? cols.map((c) => c + "/").join("    ") : "(Empty collections list)";
        }
      } else if (currentPath.startsWith("/collections/")) {
        const colName = currentPath.replace("/collections/", "");
        if (!selectedCluster || !selectedCluster.collections?.[colName]) {
          outputText = `Collection '${colName}' not found or empty.`;
        } else {
          const docs = selectedCluster.collections[colName];
          outputText = docs.length > 0 ? docs.map((d) => d._id || "doc").join("\n") : "(No documents in collection)";
        }
      }
    } else if (cmd === "cat") {
      const docId = args[0];
      if (!docId) {
        outputText = "Usage: cat <doc_id>";
        lineType = "error";
      } else if (!selectedCluster) {
        outputText = "No active DB cluster selected.";
        lineType = "error";
      } else {
        let foundDoc: any = null;
        if (selectedCluster.collections) {
          for (const col in selectedCluster.collections) {
            const match = selectedCluster.collections[col].find((d) => d._id === docId);
            if (match) {
              foundDoc = match;
              break;
            }
          }
        }
        if (foundDoc) {
          outputText = JSON.stringify(foundDoc, null, 2);
        } else {
          outputText = `Document '${docId}' not found.`;
          lineType = "error";
        }
      }
    } else if (cmd === "mkdir") {
      const colName = args[0];
      if (!colName) {
        outputText = "Usage: mkdir <collection_name>";
        lineType = "error";
      } else if (!selectedCluster) {
        outputText = "No active cluster selected.";
        lineType = "error";
      } else {
        if (!selectedCluster.collections) selectedCluster.collections = {};
        if (!selectedCluster.collections[colName]) {
          selectedCluster.collections[colName] = [];
          outputText = `Created new collection '${colName}'`;
        } else {
          outputText = `Collection '${colName}' already exists.`;
        }
      }
    } else if (cmd.startsWith("db.")) {
      if (!selectedCluster) {
        outputText = "No active DB cluster connected.";
        lineType = "error";
      } else {
        try {
          const match = cmdText.match(/^db\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9]+)\((.*)\)$/s);
          if (match) {
            const targetCol = match[1];
            const op = match[2].toLowerCase();
            const paramStr = match[3].trim();
            let paramObj = paramStr ? JSON.parse(paramStr) : {};

            let normAction: "find" | "insert" | "update" | "delete" = "find";
            let payload: any = {};

            if (op === "find") {
              normAction = "find";
              payload = { filter: paramObj };
            } else if (op === "insertone" || op === "insert") {
              normAction = "insert";
              payload = { doc: paramObj };
            } else if (op === "deleteone" || op === "delete") {
              normAction = "delete";
              payload = { filter: paramObj };
            }

            const res = await fetch("/api/gitnetwork/v1", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                db: selectedCluster.id,
                key: selectedCluster.apiKey,
                collection: targetCol,
                action: normAction,
                payload,
              }),
            });
            const data = await res.json();
            outputText = JSON.stringify(data, null, 2);
          } else {
            outputText = "Syntax error. Example: db.users.find() or db.users.insertOne({\"name\":\"John\"})";
            lineType = "error";
          }
        } catch (err: any) {
          outputText = "Mongo Query Error: " + err.message;
          lineType = "error";
        }
      }
    } else if (cmd === "connect") {
      const uri = args[0];
      if (!uri) {
        outputText = "Usage: connect gitnetwork+srv://<id>:<key>@edge.gitnetwork.cloud/<name>";
        lineType = "error";
      } else {
        const match = uri.match(/gitnetwork\+srv:\/\/([^:]+):([^@]+)@/);
        if (match) {
          const targetId = match[1];
          const targetKey = match[2];
          const found = clusters.find((c) => c.id === targetId && c.apiKey === targetKey);
          if (found) {
            setSelectedCluster(found);
            outputText = `Connected successfully to cluster '${found.name}' (${found.id})`;
          } else {
            outputText = `Cluster credential mismatch for ID ${targetId}`;
            lineType = "error";
          }
        } else {
          outputText = "Invalid connection URI format.";
          lineType = "error";
        }
      }
    } else if (cmd === "node") {
      const sub = args[0];
      if (sub === "-v" || sub === "--version") {
        outputText = "v20.12.2 (GitNetwork Cloud Worker Runtime)";
      } else if (sub === "-e" || sub === "--eval") {
        const jsCode = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
        if (!jsCode) {
          outputText = "Usage: node -e \"console.log(1 + 1)\"";
          lineType = "error";
        } else {
          try {
            const logs: string[] = [];
            const customConsole = {
              log: (...a: any[]) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(" ")),
              error: (...a: any[]) => logs.push("[ERROR] " + a.join(" ")),
              warn: (...a: any[]) => logs.push("[WARN] " + a.join(" ")),
            };
            const runFn = new Function("console", jsCode);
            const resVal = runFn(customConsole);
            outputText = logs.length > 0 ? logs.join("\n") : (resVal !== undefined ? String(resVal) : "[OK]");
          } catch (err: any) {
            outputText = "Node Evaluation Error: " + err.message;
            lineType = "error";
          }
        }
      } else {
        outputText = "Welcome to Node.js v20.12.2.\nType 'node -e \"code\"' to evaluate JavaScript code or 'node -v' for version.";
      }
    } else if (cmd === "git") {
      const sub = args[0] || "";
      if (sub === "-v" || sub === "--version" || sub === "version") {
        outputText = "git version 2.44.0.gitnetwork-edge";
      } else if (sub === "status") {
        outputText = `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`;
      } else if (sub === "log") {
        outputText = `commit db9dc5e7a9b0c1e82f (HEAD -> main, origin/main)
Author: Cloud Developer <skycho@proton.me>
Date:   ${new Date().toDateString()}

    feat: integrate interactive GitNetwork Cloud OS Terminal`;
      } else if (sub === "branch") {
        outputText = "* main";
      } else if (sub === "clone") {
        const repoUrl = args[1] || "https://github.com/nonxe/database.git";
        outputText = `Cloning into '${repoUrl.split("/").pop()?.replace(".git", "") || "repo"}'...\nremote: Enumerating objects: 42, done.\nremote: Total 42 (delta 18), reused 42\nUnpacking objects: 100% (42/42), done.`;
      } else if (sub === "commit") {
        outputText = `[main 4f2a1b9] ${args.slice(1).join(" ") || "update database files"}\n 1 file changed, 12 insertions(+)`;
      } else {
        outputText = "usage: git [--version] [status | log | branch | clone <url> | commit -m <msg>]";
      }
    } else if (cmd === "npm") {
      const sub = args[0] || "";
      if (sub === "-v" || sub === "--version") {
        outputText = "10.5.0";
      } else if (sub === "i" || sub === "install") {
        const pkg = args[1] || "gitnetwork-db";
        outputText = `added 1 package, and audited 42 packages in 320ms\nfound 0 vulnerabilities`;
      } else if (sub === "run" || sub === "start") {
        outputText = `> gitnetwork-app@1.0.0 ${args[1] || "start"}\n> vite dev --port 3000\nReady in 140ms on http://localhost:3000`;
      } else {
        outputText = "Usage: npm [-v | install <package> | run <script>]";
      }
    } else if (cmd === "python" || cmd === "python3") {
      const sub = args[0];
      if (sub === "-v" || sub === "--version" || sub === "-V") {
        outputText = "Python 3.12.2 (main, GitNetwork WASM Runtime)";
      } else if (sub === "-c") {
        const pyCode = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
        outputText = `Python 3.12 Exec: ${pyCode}\n[Output]: Execution finished cleanly (0 exit code).`;
      } else {
        outputText = "Python 3.12.2 (main, GitNetwork WASM)\nType 'python -c \"print(1+1)\"' or 'python -v'.";
      }
    } else if (cmd === "curl" || cmd === "fetch" || cmd === "wget") {
      const targetUrl = args[0];
      if (!targetUrl) {
        outputText = "Usage: curl <http_url>";
        lineType = "error";
      } else {
        try {
          const res = await fetch(targetUrl);
          const txt = await res.text();
          outputText = txt.length > 800 ? txt.slice(0, 800) + "\n...[Truncated]" : txt;
        } catch (err: any) {
          outputText = "HTTP Fetch Failed: " + err.message;
          lineType = "error";
        }
      }
    } else if (cmd === "echo") {
      const textToEcho = args.join(" ");
      if (textToEcho === "$USER") outputText = userId || "Guest";
      else if (textToEcho === "$PATH") outputText = "/usr/local/bin:/usr/bin:/bin";
      else if (textToEcho === "$NODE_ENV") outputText = "production";
      else outputText = textToEcho;
    } else if (cmd === "date") {
      outputText = new Date().toString();
    } else if (cmd === "systeminfo" || cmd === "uname") {
      outputText = `OS Name:                   GitNetwork Cloud OS Edge (Linux x86_64)
System Type:               Cloudflare Worker / V8 Edge Engine
Node.js Environment:       v20.12.2
Git Version:               gitversion 2.44.0.gitnetwork-edge
Active DB Cluster:         ${selectedCluster?.name || "None"} (${selectedCluster?.id || "N/A"})`;
    } else {
      outputText = `Command not recognized: '${cmd}'. Type 'help' for available CLI commands.`;
      lineType = "error";
    }

    const outputLine: TerminalLine = {
      id: "out_" + Date.now() + "_" + Math.random(),
      type: lineType,
      text: outputText,
    };

    setTermLines((prev) => [...prev, inputLine, outputLine]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans relative">
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="size-10 rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <ArrowLeft className="size-4.5" />
          </a>
          <div className="flex-1">
            <h1 className="text-[26px] font-black tracking-tight leading-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2.5">
              GitNetwork DB
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Serverless Edge JSON Database Network. Production Connection Strings & Interactive Playground.
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Network className="size-5.5 text-cyan-400" />
          </div>
        </div>

        {/* Account check banner */}
        {!userId && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[12.5px] font-semibold flex items-center justify-between">
            <span>Please login with your Cloud Account on Dashboard to create & manage your private DB clusters.</span>
            <a href="/" className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold transition-colors">
              Go to Dashboard
            </a>
          </div>
        )}

        {/* Create Cluster & Cluster List Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Cluster Card */}
          <div className="p-5 rounded-[24px] bg-secondary/10 border border-border/40 ios-glass space-y-4">
            <div className="flex items-center gap-2 text-foreground font-black text-[14px]">
              <Plus className="size-4 text-cyan-400" />
              <span>Create DB Cluster</span>
            </div>

            <form onSubmit={handleCreateCluster} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Database Cluster Name
                </label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="e.g. production-db"
                  maxLength={32}
                  disabled={!userId || creating}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/50 bg-background/80 text-[13px] font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-40"
                />
              </div>

              <button
                type="submit"
                disabled={!userId || creating || !dbName.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-[12.5px] font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-lg shadow-cyan-600/20"
              >
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
                <span>{creating ? "Provisioning..." : "Provision Cluster"}</span>
              </button>
            </form>
          </div>

          {/* Clusters List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-black text-[14px]">
                <Server className="size-4 text-cyan-400" />
                <span>My Database Clusters ({clusters.length})</span>
              </div>
              {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>

            {clusters.length === 0 && !loading ? (
              <div className="p-6 rounded-[20px] bg-secondary/10 border border-border/30 text-center">
                <p className="text-[12.5px] text-muted-foreground/60 italic">
                  No active clusters found. Create a new cluster above to get your connection URL.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clusters.map((c) => {
                  const connString = `gitnetwork+srv://${c.id}:${c.apiKey}@edge.gitnetwork.cloud/${c.name}`;
                  const restUrl = `${baseUrl}/api/gitnetwork/v1?db=${c.id}&key=${c.apiKey}`;
                  const isSelected = selectedCluster?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCluster(c)}
                      className={`p-4 rounded-[20px] bg-secondary/10 border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
                          : "border-border/30 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-[11px]">
                            DB
                          </div>
                          <h4 className="text-[13.5px] font-black text-foreground truncate">{c.name}</h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCluster(c.id);
                          }}
                          className="size-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                          title="Delete cluster"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      {/* Connection String Copy */}
                      <div className="space-y-1.5">
                        <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider">
                          Mongo-style URI Connection String
                        </span>
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-background/80 border border-border/40 font-mono text-[10.5px]">
                          <span className="truncate flex-1 text-cyan-400">{connString}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyString(connString, c.id + "_uri");
                            }}
                            className="text-muted-foreground hover:text-foreground flex-shrink-0"
                            title="Copy URI"
                          >
                            {copiedKey === c.id + "_uri" ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* REST URL Copy */}
                      <div className="space-y-1.5">
                        <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider">
                          HTTPS REST API URL
                        </span>
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-background/80 border border-border/40 font-mono text-[10.5px]">
                          <span className="truncate flex-1 text-sky-400">{restUrl}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyString(restUrl, c.id + "_rest");
                            }}
                            className="text-muted-foreground hover:text-foreground flex-shrink-0"
                            title="Copy REST URL"
                          >
                            {copiedKey === c.id + "_rest" ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                        <span className="font-mono text-cyan-300">ID: {c.id}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Playground & Terminal Section */}
        <div className="p-6 rounded-[28px] bg-secondary/10 border border-border/40 ios-glass space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Terminal className="size-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-black text-foreground">GitNetwork Terminal & Playground</h3>
                <p className="text-[11.5px] text-muted-foreground">
                  Query your database via visual GUI or interactive CLI Terminal with local path navigation
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background/80 border border-border/40">
              <button
                type="button"
                onClick={() => setMode("gui")}
                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all flex items-center gap-1.5 ${
                  mode === "gui"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="size-3.5" />
                <span>GUI Playground</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("terminal")}
                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all flex items-center gap-1.5 ${
                  mode === "terminal"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Terminal className="size-3.5" />
                <span>Terminal CLI</span>
              </button>
            </div>
          </div>

          {/* MODE: TERMINAL CLI */}
          {mode === "terminal" ? (
            <div
              onClick={() => termInputRef.current?.focus()}
              className="w-full h-[450px] p-4 rounded-2xl bg-[#090d16] border border-cyan-500/30 text-emerald-400 font-mono text-[12.5px] flex flex-col justify-between overflow-hidden shadow-2xl relative select-text"
            >
              {/* Terminal Window Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 select-none text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 font-bold text-cyan-300">gitnetwork-shell@edge:~</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-cyan-400/70">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    PATH: {currentPath}
                  </span>
                  {selectedCluster && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      DB: {selectedCluster.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal Lines Output */}
              <div className="flex-1 overflow-y-auto py-3 space-y-1.5 scrollbar-thin">
                {termLines.map((line) => {
                  if (line.type === "system") {
                    return (
                      <div key={line.id} className="text-cyan-400/80 italic text-[11.5px]">
                        # {line.text}
                      </div>
                    );
                  }
                  if (line.type === "input") {
                    return (
                      <div key={line.id} className="flex items-center gap-2 text-foreground font-semibold">
                        <span className="text-emerald-400">gitnetwork@edge:{line.path || "~"}$</span>
                        <span>{line.text}</span>
                      </div>
                    );
                  }
                  if (line.type === "error") {
                    return (
                      <pre key={line.id} className="text-red-400 text-[11.5px] whitespace-pre-wrap pl-4">
                        {line.text}
                      </pre>
                    );
                  }
                  return (
                    <pre key={line.id} className="text-sky-300/90 text-[12px] whitespace-pre-wrap pl-4 font-mono">
                      {line.text}
                    </pre>
                  );
                })}
                <div ref={termEndRef} />
              </div>

              {/* Terminal Prompt Form */}
              <form onSubmit={handleTerminalSubmit} className="pt-2 border-t border-cyan-500/20 flex items-center gap-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>gitnetwork@edge:{currentPath}$</span>
                  <ChevronRight className="size-3.5 text-cyan-400 animate-pulse" />
                </span>
                <input
                  ref={termInputRef}
                  type="text"
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (termHistory.length > 0) {
                        const nextIdx = historyIndex === -1 ? termHistory.length - 1 : Math.max(0, historyIndex - 1);
                        setHistoryIndex(nextIdx);
                        setTermInput(termHistory[nextIdx]);
                      }
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (historyIndex !== -1) {
                        const nextIdx = historyIndex + 1;
                        if (nextIdx >= termHistory.length) {
                          setHistoryIndex(-1);
                          setTermInput("");
                        } else {
                          setHistoryIndex(nextIdx);
                          setTermInput(termHistory[nextIdx]);
                        }
                      }
                    }
                  }}
                  placeholder="Type CLI command (e.g. ls, pwd, cd collections, cat doc_01, db.users.find())..."
                  className="flex-1 bg-transparent text-emerald-300 font-mono text-[13px] outline-none focus:ring-0 placeholder:text-muted-foreground/30"
                  autoFocus
                />
                <button type="submit" className="text-cyan-400 hover:text-cyan-300">
                  <CornerDownLeft className="size-4" />
                </button>
              </form>
            </div>
          ) : (
            /* MODE: GUI PLAYGROUND */
            <>

          {/* Playground Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Collection Name
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/50 bg-background/80">
                <Layers className="size-4 text-cyan-400 flex-shrink-0" />
                <input
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="users"
                  className="w-full bg-transparent text-[13px] font-bold text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Operation / Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-border/50 bg-background/80 text-[13px] font-bold text-foreground focus:outline-none"
              >
                <option value="find">find (Query Documents)</option>
                <option value="insert">insertOne (Add Document)</option>
                <option value="update">updateMany (Modify Documents)</option>
                <option value="delete">deleteOne (Remove Documents)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Quick Sample Presets
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => loadPreset("find")}
                  className={`py-2 rounded-lg text-[10px] font-black border transition-all ${
                    action === "find"
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                      : "bg-secondary/20 border-border/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  find
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("insert")}
                  className={`py-2 rounded-lg text-[10px] font-black border transition-all ${
                    action === "insert"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-secondary/20 border-border/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  insert
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("update")}
                  className={`py-2 rounded-lg text-[10px] font-black border transition-all ${
                    action === "update"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-secondary/20 border-border/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  update
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset("delete")}
                  className={`py-2 rounded-lg text-[10px] font-black border transition-all ${
                    action === "delete"
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "bg-secondary/20 border-border/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  delete
                </button>
              </div>
            </div>
          </div>

          {/* JSON Payload Editor & Response Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-cyan-400" />
                  JSON Request Payload
                </span>
              </div>
              <textarea
                rows={8}
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-border/50 bg-background/90 text-[12.5px] font-mono text-cyan-300 placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none scrollbar-thin"
              />
            </div>

            {/* Result Response */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-sky-400" />
                  Execution Result Output
                </span>
                {execTime !== null && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <Clock className="size-3" /> {execTime} ms
                  </span>
                )}
              </div>
              <div className="w-full h-[200px] p-3.5 rounded-2xl border border-border/50 bg-background/90 text-[12px] font-mono overflow-auto scrollbar-thin">
                {queryLoading ? (
                  <div className="h-full flex items-center justify-center gap-2 text-cyan-400">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Executing query on GitNetwork edge...</span>
                  </div>
                ) : queryResult ? (
                  <pre className="text-emerald-400">{JSON.stringify(queryResult, null, 2)}</pre>
                ) : (
                  <span className="text-muted-foreground/40 italic">
                    Press "Run Query" below to execute query...
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-semibold">
              <AlertCircle className="size-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Run Button */}
          <button
            type="button"
            onClick={handleExecuteQuery}
            disabled={queryLoading || !selectedCluster}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[13.5px] font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-xl shadow-cyan-600/20"
          >
            {queryLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
            <span>{queryLoading ? "Executing Query..." : "Run Query on GitNetwork"}</span>
          </button>
          </>
        )}
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/gitnetwork")({
  component: GitNetworkPage,
  head: () => ({
    meta: [
      { title: "GitNetwork DB — Cloud OS Space" },
      { name: "description", content: "Serverless Edge JSON Database Network. Create database accounts, get Mongo-style connection URLs, and test queries in the live Playground." },
    ],
  }),
});
