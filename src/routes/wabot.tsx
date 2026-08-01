import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bot,
  Play,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Server,
  Activity,
  Layers,
  KeyRound,
  User,
  Settings,
  Globe,
  Lock,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { WabotSession, WorkflowRun } from "../lib/github-wabot";

function WabotDashboardPage() {
  const [sessions, setSessions] = useState<WabotSession[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  // Form State
  const [inputSessionId, setInputSessionId] = useState("");
  const [inputBotName, setInputBotName] = useState("");
  const [inputSudo, setInputSudo] = useState("");
  const [inputMode, setInputMode] = useState<"public" | "private">("public");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/wabot/manage");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
        setRuns(data.runs || []);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Add Session ID
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSessionId.trim()) {
      showToast("WhatsApp Session ID is required.", "error");
      return;
    }

    setSavingSession(true);
    try {
      const storedUser = localStorage.getItem("cloud_user_account");
      const addedBy = storedUser ? JSON.parse(storedUser).id : "guest";

      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_session",
          sessionId: inputSessionId.trim(),
          botName: inputBotName.trim() || "OIEN BOT",
          sudo: inputSudo.trim(),
          mode: inputMode,
          status: "active",
          addedBy,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("WhatsApp Session ID saved to nonxe/oien database repository!");
        setInputSessionId("");
        setInputBotName("");
        setInputSudo("");
        loadData();
      } else {
        showToast(data.error || "Failed to save session.", "error");
      }
    } catch (err: any) {
      showToast("Save error: " + err.message, "error");
    }
    setSavingSession(false);
  };

  // Handle Delete Session
  const handleDeleteSession = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete session for "${name}"?`)) return;

    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_session", id }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Deleted session "${name}" from nonxe/oien.`);
        loadData();
      } else {
        showToast(data.error || "Failed to delete session.", "error");
      }
    } catch (err: any) {
      showToast("Delete error: " + err.message, "error");
    }
  };

  // Handle Trigger Workflow Dispatch
  const handleTriggerWorkflow = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_workflow" }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("GitHub Action workflow dispatched in nonxe/oien! Bot will start running now.");
        setTimeout(() => loadData(), 3000);
      } else {
        showToast(data.error || "Failed to dispatch workflow.", "error");
      }
    } catch (err: any) {
      showToast("Workflow trigger error: " + err.message, "error");
    }
    setTriggering(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeSessionsCount = sessions.filter((s) => s.status === "active").length;
  const latestRun = runs[0];

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30">
      {/* Header Banner */}
      <header className="px-4 sm:px-6 md:px-8 py-5 border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/85">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="size-9 rounded-xl bg-secondary/40 hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bot className="size-4" />
                </span>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                  WhatsApp Bot Manager
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase font-mono">
                  nonxe/oien
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                GitHub Action multi-session runner • Auto rerun every 5 hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all text-xs font-bold flex items-center gap-1.5"
              title="Refresh status"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              onClick={handleTriggerWorkflow}
              disabled={triggering}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              {triggering ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
              <span>Restart Workflow</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Activity className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono">Active Sessions</div>
              <div className="text-xl font-black text-foreground mt-0.5">
                {activeSessionsCount} / {sessions.length}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono">Auto Schedule</div>
              <div className="text-sm font-black text-foreground mt-0.5 flex items-center gap-1">
                <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Every 5 Hours</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Server className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono">Latest GitHub Run</div>
              <div className="text-xs font-bold text-foreground mt-0.5 capitalize flex items-center gap-1">
                {latestRun ? (
                  <>
                    <span
                      className={`size-2 rounded-full ${
                        latestRun.status === "in_progress"
                          ? "bg-amber-400 animate-ping"
                          : latestRun.conclusion === "success"
                          ? "bg-emerald-400"
                          : "bg-purple-400"
                      }`}
                    />
                    <span>{latestRun.status === "in_progress" ? "Running" : latestRun.conclusion || latestRun.status}</span>
                  </>
                ) : (
                  "Ready"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Form + Sessions List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Submit Session ID Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl border border-border/40 bg-secondary/10 ios-glass space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3">
                <Plus className="size-4 text-emerald-400" />
                <h2 className="text-sm font-black text-foreground">Add WhatsApp Session ID</h2>
              </div>

              <form onSubmit={handleAddSession} className="space-y-3.5">
                {/* Session ID */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center justify-between">
                    <span>Session ID / String</span>
                    <span className="text-emerald-400 text-[10px]">Required</span>
                  </label>
                  <textarea
                    value={inputSessionId}
                    onChange={(e) => setInputSessionId(e.target.value)}
                    placeholder="Paste Session ID (e.g. RGNK~4IqF0mP6...)"
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background/80 border border-border/40 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500 transition-all resize-none"
                    required
                  />
                </div>

                {/* Bot Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Bot Name / Label</label>
                  <input
                    type="text"
                    value={inputBotName}
                    onChange={(e) => setInputBotName(e.target.value)}
                    placeholder="e.g. OIEN BOT 1"
                    className="w-full px-3.5 py-2 rounded-xl bg-background/80 border border-border/40 text-xs font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Sudo / Owner Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Owner Phone / Sudo (Optional)</label>
                  <input
                    type="text"
                    value={inputSudo}
                    onChange={(e) => setInputSudo(e.target.value)}
                    placeholder="e.g. 919876543210"
                    className="w-full px-3.5 py-2 rounded-xl bg-background/80 border border-border/40 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Mode Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Bot Access Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode("public")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        inputMode === "public"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "border-border/30 bg-background/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("private")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        inputMode === "private"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "border-border/30 bg-background/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Private
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSession}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                >
                  {savingSession ? <Loader2 className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
                  <span>Save Session to nonxe/oien</span>
                </button>
              </form>
            </div>

            {/* Info Card */}
            <div className="p-4 rounded-2xl border border-border/30 bg-secondary/5 text-xs space-y-2 leading-relaxed text-muted-foreground">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-400" />
                <span>How Multi-Session Runner Works</span>
              </div>
              <p>
                When you save a session ID, it is written directly to <span className="font-mono text-emerald-300">nonxe/oien/sessions.json</span>.
              </p>
              <p>
                GitHub Actions executes <span className="font-mono text-foreground">multi-runner.js</span> every 5 hours or on manual workflow trigger, starting all added active WhatsApp Bot sessions concurrently!
              </p>
            </div>
          </div>

          {/* Right Column: Sessions List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-foreground flex items-center gap-2">
                <Layers className="size-4 text-emerald-400" />
                <span>Active WhatsApp Bot Sessions ({sessions.length})</span>
              </h2>

              <a
                href="https://github.com/nonxe/oien"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>nonxe/oien repo</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Loader2 className="size-6 animate-spin mx-auto text-emerald-400" />
                <p className="text-xs">Loading sessions from nonxe/oien...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-border/40 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 font-bold">
                  <Bot className="size-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No Session IDs Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Add your first WhatsApp Bot Session ID on the left to start automated execution on nonxe/oien!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border border-border/40 bg-secondary/10 ios-glass space-y-3 transition-all hover:border-emerald-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                          <Bot className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-foreground">{s.botName || "OIEN BOT"}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase font-mono border ${
                                s.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                  : "bg-red-500/10 text-red-300 border-red-500/30"
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Added {new Date(s.addedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(s.sessionId, s.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                          title="Copy Session ID"
                        >
                          {copiedId === s.id ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s.id, s.botName || s.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 transition-all"
                          title="Delete Session"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/30 space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Session Snippet:</span>
                        <span className="text-emerald-400 font-bold">
                          {s.sessionId.slice(0, 16)}...{s.sessionId.slice(-6)}
                        </span>
                      </div>
                      {s.sudo && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Sudo Owner:</span>
                          <span className="text-foreground">{s.sudo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Workflow Runs Log Table */}
            {runs.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase font-mono">Recent GitHub Action Executions</h3>
                <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/60">
                  <div className="divide-y divide-border/20">
                    {runs.map((r) => (
                      <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              r.status === "in_progress"
                                ? "bg-amber-400 animate-ping"
                                : r.conclusion === "success"
                                ? "bg-emerald-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span className="font-mono text-foreground">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <a
                            href={r.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline text-[11px] flex items-center gap-1 font-mono"
                          >
                            <span>Log</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </main>
  );
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export const Route = createFileRoute("/wabot")({
  component: WabotDashboardPage,
  head: () => ({
    meta: [
      { title: "WhatsApp Bot Manager • nonxe/oien" },
      { name: "description", content: "Manage WhatsApp bot session IDs and auto-restart GitHub Action runners in nonxe/oien." },
    ],
  }),
});
