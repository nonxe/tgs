import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
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

function GitNetworkPage() {
  const [clusters, setClusters] = useState<GitNetworkCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dbName, setDbName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Playground State ──
  const [selectedCluster, setSelectedCluster] = useState<GitNetworkCluster | null>(null);
  const [collection, setCollection] = useState("users");
  const [action, setAction] = useState<"find" | "insert" | "update" | "delete">("find");
  const [jsonPayload, setJsonPayload] = useState<string>(
    JSON.stringify({ filter: {} }, null, 2)
  );
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [execTime, setExecTime] = useState<number | null>(null);

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

        {/* Interactive Playground Section */}
        <div className="p-6 rounded-[28px] bg-secondary/10 border border-border/40 ios-glass space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Terminal className="size-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-black text-foreground">Interactive Database Playground</h3>
                <p className="text-[11.5px] text-muted-foreground">
                  Execute live JSON queries against your GitNetwork cluster
                </p>
              </div>
            </div>

            {selectedCluster && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11.5px] font-bold">
                <Database className="size-3.5" />
                <span>Active DB: {selectedCluster.name}</span>
              </div>
            )}
          </div>

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
