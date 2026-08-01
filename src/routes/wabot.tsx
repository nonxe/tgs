import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bot,
  Zap,
  Lock,
  KeyRound,
  User,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  Activity,
  Server,
  ArrowLeft,
  RefreshCw,
  Loader2,
  ExternalLink,
  Save,
  LogOut,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { WabotSession, WorkflowRun } from "../lib/github-wabot";

function WabotDashboardPage() {
  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  // Wabot State
  const [session, setSession] = useState<WabotSession | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [inputSessionId, setInputSessionId] = useState("");
  const [inputBotName, setInputBotName] = useState("");
  const [inputSudo, setInputSudo] = useState("");
  const [inputMode, setInputMode] = useState<"public" | "private">("public");
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Check saved admin session
  useEffect(() => {
    const token = localStorage.getItem("wabot_admin_auth");
    if (token === "wabot_admin_authenticated") {
      setIsAdmin(true);
    }
  }, []);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/wabot/manage");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSession(data.session || null);
          setRuns(data.runs || []);
          if (data.session) {
            setInputSessionId(data.session.sessionId || "");
            setInputBotName(data.session.botName || "OIEN BOT");
            setInputSudo(data.session.sudo || "");
            setInputMode(data.session.mode || "public");
          }
        }
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
      const interval = setInterval(() => loadData(), 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthenticating(true);

    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_login",
          username: adminUser.trim(),
          password: adminPass.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.adminToken) {
        localStorage.setItem("wabot_admin_auth", data.adminToken);
        setIsAdmin(true);
        showToast("Welcome Admin! Access granted.");
      } else {
        setAuthError(data.error || "Invalid Admin username or password.");
      }
    } catch (err: any) {
      setAuthError("Authentication error: " + err.message);
    }
    setAuthenticating(false);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("wabot_admin_auth");
    setIsAdmin(false);
    setAdminUser("");
    setAdminPass("");
  };

  // Handle Save Session ID
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSessionId.trim()) {
      showToast("WhatsApp Session ID is required.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_session",
          auth: { adminToken: "wabot_admin_authenticated" },
          sessionId: inputSessionId.trim(),
          botName: inputBotName.trim() || "OIEN BOT",
          sudo: inputSudo.trim(),
          mode: inputMode,
          status: "active",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("WhatsApp Session ID saved to nonxe/oien database repository!");
        loadData();
      } else {
        showToast(data.error || "Failed to save session.", "error");
      }
    } catch (err: any) {
      showToast("Save error: " + err.message, "error");
    }
    setSaving(false);
  };

  // Handle Trigger Workflow Dispatch
  const handleTriggerWorkflow = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger_workflow",
          auth: { adminToken: "wabot_admin_authenticated" },
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("GitHub Action workflow dispatched in nonxe/oien! Bot is running now.");
        setTimeout(() => loadData(), 3000);
      } else {
        showToast(data.error || "Failed to dispatch workflow.", "error");
      }
    } catch (err: any) {
      showToast("Workflow trigger error: " + err.message, "error");
    }
    setTriggering(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latestRun = runs[0];

  // Render Admin Login Screen if not authenticated
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans selection:bg-emerald-500/30 select-none">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-secondary/10 ios-glass space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-400">
            <Bot className="size-32" />
          </div>

          <div className="flex items-center justify-between">
            <a
              href="/"
              className="size-9 rounded-xl bg-secondary/40 hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </a>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase font-mono">
              Admin Only
            </span>
          </div>

          <div className="space-y-2">
            <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Lock className="size-6" />
            </div>
            <h1 className="text-xl font-black text-foreground">WhatsApp Bot Admin</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Login to manage single WhatsApp Session ID and GitHub Action bot runner in <span className="font-mono text-emerald-300">nonxe/oien</span>.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="size-4 flex-shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase font-mono flex items-center gap-1">
                <User className="size-3.5 text-emerald-400" />
                <span>Username</span>
              </label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="Admin username"
                className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-border/40 text-xs font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase font-mono flex items-center gap-1">
                <KeyRound className="size-3.5 text-emerald-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Admin password"
                className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-border/40 text-xs font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {authenticating ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              <span>Authenticate Admin</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

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
                Single Session Runner • Auto rerun every 5 hours • Admin Authenticated
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

            <button
              onClick={handleAdminLogout}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold"
              title="Logout Admin"
            >
              <LogOut className="size-3.5" />
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
              <div className="text-xs text-muted-foreground font-mono">Current Active Bot</div>
              <div className="text-sm font-black text-foreground mt-0.5 truncate max-w-[180px]">
                {session ? session.botName || "OIEN BOT" : "No Session Set"}
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

        {/* Main Section: Current Active Session Card & Edit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Update Single Session ID Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl border border-border/40 bg-secondary/10 ios-glass space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center gap-2">
                  <Save className="size-4 text-emerald-400" />
                  <h2 className="text-sm font-black text-foreground">Configure WhatsApp Session ID</h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold">
                  Single Session
                </span>
              </div>

              <form onSubmit={handleSaveSession} className="space-y-3.5">
                {/* Session ID */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center justify-between">
                    <span>WhatsApp Session ID / String</span>
                    <span className="text-emerald-400 text-[10px]">Required</span>
                  </label>
                  <textarea
                    value={inputSessionId}
                    onChange={(e) => setInputSessionId(e.target.value)}
                    placeholder="Paste Session ID (e.g. RGNK~4IqF0mP6...)"
                    rows={4}
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
                    placeholder="e.g. OIEN BOT"
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
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>Save Session to nonxe/oien</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Active Session Overview & Recent Workflow Runs */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Bot className="size-4 text-emerald-400" />
              <span>Active Session Details</span>
            </h2>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Loader2 className="size-6 animate-spin mx-auto text-emerald-400" />
                <p className="text-xs">Loading active session from nonxe/oien...</p>
              </div>
            ) : !session ? (
              <div className="p-8 rounded-3xl border border-dashed border-border/40 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 font-bold">
                  <Bot className="size-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No Session Configured</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Paste your WhatsApp Session ID on the left to activate automated execution on nonxe/oien!
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-3xl border border-emerald-500/30 bg-secondary/10 ios-glass space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <Bot className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground">{session.botName || "OIEN BOT"}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-black uppercase font-mono">
                        {session.status} • {session.mode || "public"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(session.sessionId)}
                    className="px-3 py-1.5 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Copy Session ID"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copied ? "Copied" : "Copy ID"}</span>
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-background/80 border border-border/30 space-y-1.5 font-mono text-xs">
                  <div className="text-muted-foreground text-[11px]">Session ID Snippet:</div>
                  <div className="text-emerald-300 font-bold break-all">
                    {session.sessionId.slice(0, 24)}...{session.sessionId.slice(-8)}
                  </div>
                  {session.sudo && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/20 text-muted-foreground">
                      <span>Owner / Sudo:</span>
                      <span className="text-foreground">{session.sudo}</span>
                    </div>
                  )}
                  {session.updatedAt && (
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pt-1">
                      <span>Last Updated:</span>
                      <span>{new Date(session.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Workflow Runs Log Table */}
            {runs.length > 0 && (
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase font-mono">Recent GitHub Action Runs</h3>
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

export const Route = createFileRoute("/wabot")({
  component: WabotDashboardPage,
  head: () => ({
    meta: [
      { title: "WhatsApp Bot Admin • nonxe/oien" },
      { name: "description", content: "Single WhatsApp Session ID manager and auto-restart runner for nonxe/oien." },
    ],
  }),
});
