import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bot,
  Play,
  Square,
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
  Radio,
  Power,
  Sliders,
  Terminal,
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
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
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
          setIsRunning(!!data.isRunning);
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
      const interval = setInterval(() => loadData(), 20000);
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
        showToast("Welcome Admin! iOS Session Authenticated.");
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

  // Save Session ID
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
        showToast("WhatsApp Session ID saved to nonxe/oien repo!");
        loadData();
      } else {
        showToast(data.error || "Failed to save session.", "error");
      }
    } catch (err: any) {
      showToast("Save error: " + err.message, "error");
    }
    setSaving(false);
  };

  // Start Workflow
  const handleStartWorkflow = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_bot",
          auth: { adminToken: "wabot_admin_authenticated" },
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("GitHub Action Workflow STARTED! Bot is launching...");
        setTimeout(() => loadData(), 3000);
      } else {
        showToast(data.error || "Failed to start workflow.", "error");
      }
    } catch (err: any) {
      showToast("Start error: " + err.message, "error");
    }
    setStarting(false);
  };

  // Stop Workflow
  const handleStopWorkflow = async () => {
    setStopping(true);
    try {
      const res = await fetch("/api/wabot/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop_bot",
          auth: { adminToken: "wabot_admin_authenticated" },
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Stopped ${data.cancelledCount || 1} active bot workflow run(s)!`);
        setTimeout(() => loadData(), 3000);
      } else {
        showToast(data.error || "Failed to stop workflow.", "error");
      }
    } catch (err: any) {
      showToast("Stop error: " + err.message, "error");
    }
    setStopping(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latestRun = runs[0];

  // Render iOS Admin Login Modal
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#050811] text-foreground flex items-center justify-center p-4 font-sans selection:bg-emerald-500/30 select-none relative overflow-hidden">
        {/* iOS Neon Mesh Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 size-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full p-7 sm:p-9 rounded-[32px] border border-emerald-500/20 bg-[#0c1424]/80 backdrop-blur-3xl space-y-6 shadow-2xl relative z-10">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="size-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-white/5"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </a>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase font-mono tracking-wider">
              iOS Admin Access
            </span>
          </div>

          <div className="space-y-2">
            <div className="size-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
              <Lock className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">WA Bot Manager</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Authenticate with Admin credentials to control <span className="font-mono text-white">nonxe/oien</span> runner.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="size-4 flex-shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center gap-1.5">
                <User className="size-3.5 text-emerald-400" />
                <span>Admin Username</span>
              </label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="Enter Username..."
                className="w-full px-4 py-3 rounded-2xl bg-[#050811]/90 border border-white/10 text-xs font-bold text-white placeholder:text-muted-foreground/30 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-emerald-400" />
                <span>Admin Password</span>
              </label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter Password..."
                className="w-full px-4 py-3 rounded-2xl bg-[#050811]/90 border border-white/10 text-xs font-bold text-white placeholder:text-muted-foreground/30 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              {authenticating ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              <span>Authenticate Session</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050811] text-foreground font-sans selection:bg-emerald-500/30 relative">
      {/* Background Neon Ambient Glows */}
      <div className="fixed top-0 left-1/3 size-96 rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-1/4 size-96 rounded-full bg-teal-500/5 blur-[140px] pointer-events-none z-0" />

      {/* Header Banner */}
      <header className="px-4 sm:px-6 md:px-8 py-4 border-b border-white/10 backdrop-blur-2xl sticky top-0 z-40 bg-[#050811]/85">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="size-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-white/5"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bot className="size-4.5" />
                </span>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  WA Bot Manager
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase font-mono">
                  nonxe/oien
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                iOS Dark Edition • Auto rerun every 5 hours • Admin Authorized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all text-xs font-bold flex items-center gap-1.5"
              title="Refresh status"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              onClick={handleAdminLogout}
              className="p-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
              title="Logout Admin"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-7 space-y-7 relative z-10">
        {/* iOS Workflow Action Control Center Banner */}
        <div className="p-6 rounded-[32px] border border-white/10 bg-[#0c1424]/80 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`size-14 rounded-2xl border flex items-center justify-center font-bold text-xl shadow-xl ${
                  isRunning
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
                    : "bg-slate-800/50 border-white/10 text-slate-400"
                }`}
              >
                <Power className="size-7" />
              </div>
              <span
                className={`absolute -top-1 -right-1 size-4 rounded-full border-2 border-[#050811] ${
                  isRunning ? "bg-emerald-400 animate-ping" : "bg-rose-500"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Bot Runner Control Center</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${
                    isRunning
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {isRunning ? "🟢 WORKFLOW RUNNING" : "🔴 WORKFLOW STOPPED"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Start or Stop GitHub Action execution in <span className="font-mono text-emerald-400">nonxe/oien</span>. Auto rerun is active ONLY when started.
              </p>
            </div>
          </div>

          {/* Start & Stop Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleStartWorkflow}
              disabled={starting}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {starting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
              <span>Start Workflow</span>
            </button>

            <button
              onClick={handleStopWorkflow}
              disabled={stopping}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {stopping ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4 fill-current" />}
              <span>Stop Workflow</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl border border-white/10 bg-[#0c1424]/60 backdrop-blur-2xl flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Bot className="size-6" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-mono uppercase">Current Configured Bot</div>
              <div className="text-sm font-black text-white mt-0.5 truncate max-w-[170px]">
                {session ? session.botName || "OIEN BOT" : "No Session Set"}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0c1424]/60 backdrop-blur-2xl flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              <Clock className="size-6" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-mono uppercase">Auto Schedule</div>
              <div className="text-sm font-black text-white mt-0.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Every 5 Hours</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0c1424]/60 backdrop-blur-2xl flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              <Server className="size-6" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-mono uppercase">Latest GitHub Run</div>
              <div className="text-xs font-black text-white mt-0.5 capitalize flex items-center gap-1.5">
                {latestRun ? (
                  <>
                    <span
                      className={`size-2 rounded-full ${
                        latestRun.status === "in_progress"
                          ? "bg-amber-400 animate-ping"
                          : latestRun.conclusion === "success"
                          ? "bg-emerald-400"
                          : "bg-rose-400"
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

        {/* Main Content Grid: Config Form + Active Session Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Configure WhatsApp Session ID Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 sm:p-7 rounded-[32px] border border-white/10 bg-[#0c1424]/80 backdrop-blur-3xl space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Sliders className="size-5 text-emerald-400" />
                  <h2 className="text-base font-black text-white">Session Configuration</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20">
                  Single Session
                </span>
              </div>

              <form onSubmit={handleSaveSession} className="space-y-4">
                {/* Session ID */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center justify-between">
                    <span>WhatsApp Session ID / String</span>
                    <span className="text-emerald-400 text-[10px]">Required</span>
                  </label>
                  <textarea
                    value={inputSessionId}
                    onChange={(e) => setInputSessionId(e.target.value)}
                    placeholder="Paste WhatsApp Session ID (e.g. RGNK~4IqF0mP6...)"
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl bg-[#050811]/90 border border-white/10 text-xs font-mono text-white placeholder:text-muted-foreground/30 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-mono leading-relaxed"
                    required
                  />
                </div>

                {/* Bot Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Bot Name / Label</label>
                  <input
                    type="text"
                    value={inputBotName}
                    onChange={(e) => setInputBotName(e.target.value)}
                    placeholder="e.g. OIEN BOT"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#050811]/90 border border-white/10 text-xs font-bold text-white placeholder:text-muted-foreground/30 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Sudo / Owner Number */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Owner Phone / Sudo (Optional)</label>
                  <input
                    type="text"
                    value={inputSudo}
                    onChange={(e) => setInputSudo(e.target.value)}
                    placeholder="e.g. 919876543210"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#050811]/90 border border-white/10 text-xs font-mono text-white placeholder:text-muted-foreground/30 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Mode Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase font-mono">Bot Access Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode("public")}
                      className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                        inputMode === "public"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("private")}
                      className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                        inputMode === "private"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      Private
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-3"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>Save Session to nonxe/oien</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Active Session Overview & Execution Logs */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Bot className="size-4.5 text-emerald-400" />
              <span>Active Session Details</span>
            </h2>

            {loading ? (
              <div className="py-14 text-center text-muted-foreground space-y-3">
                <Loader2 className="size-7 animate-spin mx-auto text-emerald-400" />
                <p className="text-xs font-mono">Fetching active session from nonxe/oien...</p>
              </div>
            ) : !session ? (
              <div className="p-8 rounded-[32px] border border-dashed border-white/10 text-center space-y-3 bg-[#0c1424]/40">
                <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 font-bold">
                  <Bot className="size-7" />
                </div>
                <h3 className="text-sm font-bold text-white">No Session Configured</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Paste your WhatsApp Session ID on the left to configure automated execution on <span className="font-mono text-emerald-400">nonxe/oien</span>!
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-[32px] border border-emerald-500/20 bg-[#0c1424]/80 backdrop-blur-3xl space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="size-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/10">
                      <Bot className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{session.botName || "OIEN BOT"}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-black uppercase font-mono">
                        {session.status} • {session.mode || "public"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(session.sessionId)}
                    className="px-3.5 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Copy Session ID"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copied ? "Copied" : "Copy ID"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#050811]/90 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="text-muted-foreground text-[11px]">Session ID Snippet:</div>
                  <div className="text-emerald-300 font-bold break-all">
                    {session.sessionId.slice(0, 26)}...{session.sessionId.slice(-8)}
                  </div>
                  {session.sudo && (
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10 text-muted-foreground">
                      <span>Owner / Sudo:</span>
                      <span className="text-white font-bold">{session.sudo}</span>
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

            {/* Workflow Execution Runs Log Table */}
            {runs.length > 0 && (
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase font-mono flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-emerald-400" />
                  <span>Recent GitHub Action Runs Log</span>
                </h3>
                <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0c1424]/60 backdrop-blur-2xl">
                  <div className="divide-y divide-white/5">
                    {runs.map((r) => (
                      <div key={r.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`size-2.5 rounded-full ${
                              r.status === "in_progress"
                                ? "bg-amber-400 animate-ping"
                                : r.conclusion === "success"
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                          />
                          <span className="font-mono font-bold text-white">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <a
                            href={r.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline text-[11px] flex items-center gap-1 font-mono font-bold"
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
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-2xl animate-spring-scale ${
            toastMsg.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/20 border-rose-500/40 text-rose-300"
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
      { name: "description", content: "iOS Dark WA Bot Manager with Start and Stop Workflow controls for nonxe/oien." },
    ],
  }),
});
