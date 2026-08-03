import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Code2,
  Key,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Terminal,
  Play,
  UserCheck,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  Clock,
  Activity,
  Layers,
  Youtube,
  Instagram,
  Sparkles,
  Database,
  CheckCircle2,
  Server,
  Zap,
} from "lucide-react";
import { getOrCreateUserApiKey, ApiRecord, ApiUsageLog } from "../lib/github-api-records";

interface AccountData {
  id: string;
  pass?: string;
}

function ApiServicesPage() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [apiKey, setApiKey] = useState<string>("as_demo_public_2026");
  const [apiRecord, setApiRecord] = useState<ApiRecord | null>(null);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [keyLoading, setKeyLoading] = useState<boolean>(false);

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<"ytv3" | "instagram" | "ai">("ytv3");
  const [inputQuery, setInputQuery] = useState<string>("https://www.youtube.com/watch?v=MwpMEbgC7DA");
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const loadUserKeyData = async (username: string) => {
    setKeyLoading(true);
    try {
      const res = await getOrCreateUserApiKey(username);
      setApiKey(res.apiKey);
      setApiRecord(res.record);
    } catch {
      const fallbackKey = `as_live_${btoa(username.toLowerCase()).replace(/=/g, "").slice(0, 10)}`;
      setApiKey(fallbackKey);
    } finally {
      setKeyLoading(false);
    }
  };

  // Initialize Account and API Key from nonxe/recordsapi
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setAccount(parsed);
          loadUserKeyData(parsed.id);
        }
      }
    } catch {}
  }, []);

  const handleRegenerateKey = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const prefix = account ? account.id.toLowerCase().slice(0, 6) : "user";
    const newKey = `as_live_${prefix}_${randomSuffix}`;
    setApiKey(newKey);
    if (account) {
      localStorage.setItem("cloud_user_apikey", newKey);
    }
  };

  const handleCopy = (text: string, type: "key" | "response") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const handleSendTestRequest = async () => {
    if (!inputQuery.trim()) return;

    setTestLoading(true);
    setTestResponse(null);
    setLatency(null);

    const startTime = performance.now();
    try {
      let endpointPath = "";
      let paramName = "url";

      if (selectedEndpoint === "ytv3") {
        endpointPath = "/api/v1/ytv3";
        paramName = "url";
      } else if (selectedEndpoint === "instagram") {
        endpointPath = "/api/v1/instagram";
        paramName = "url";
      } else if (selectedEndpoint === "ai") {
        endpointPath = "/api/v1/ai";
        paramName = "prompt";
      }

      const reqUrl = `${endpointPath}?${paramName}=${encodeURIComponent(inputQuery.trim())}&apikey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(reqUrl);
      const data = await res.json();

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setTestResponse(data);

      // Refresh records analytics if logged in
      if (account) {
        loadUserKeyData(account.id);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setTestResponse({
        creator: "AS CLOUD SYSTEM",
        status: 500,
        success: false,
        error: err.message || "Failed to execute request.",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const getCurlSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
    if (selectedEndpoint === "ytv3") {
      return `curl -X GET "${origin}/api/v1/ytv3?url=${encodeURIComponent(inputQuery)}&apikey=${apiKey}"`;
    } else if (selectedEndpoint === "instagram") {
      return `curl -X GET "${origin}/api/v1/instagram?url=${encodeURIComponent(inputQuery)}&apikey=${apiKey}"`;
    } else {
      return `curl -X GET "${origin}/api/v1/ai?prompt=${encodeURIComponent(inputQuery)}&apikey=${apiKey}"`;
    }
  };

  const getJsSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
    if (selectedEndpoint === "ytv3") {
      return `fetch("${origin}/api/v1/ytv3?url=${encodeURIComponent(inputQuery)}&apikey=${apiKey}")\n  .then(res => res.json())\n  .then(data => console.log(data.creator, data.result));`;
    } else if (selectedEndpoint === "instagram") {
      return `fetch("${origin}/api/v1/instagram?url=${encodeURIComponent(inputQuery)}&apikey=${apiKey}")\n  .then(res => res.json())\n  .then(data => console.log(data.creator, data.result));`;
    } else {
      return `fetch("${origin}/api/v1/ai?prompt=${encodeURIComponent(inputQuery)}&apikey=${apiKey}")\n  .then(res => res.json())\n  .then(data => console.log(data.creator, data.data));`;
    }
  };

  const totalRequests = apiRecord?.requestCount || 0;
  const breakdown = apiRecord?.serviceBreakdown || { ytv3: 0, instagram: 0, ai: 0 };
  const recentLogs: ApiUsageLog[] = apiRecord?.recentLogs || [];

  return (
    <main className="min-h-screen bg-[#000000] text-foreground font-sans relative selection:bg-white/20 pb-20">
      {/* Header Banner */}
      <header className="px-4 sm:px-6 md:px-8 py-4 border-b border-zinc-800/80 sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="size-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-zinc-800"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800">
                  <Code2 className="size-4" />
                </span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  CLOUD API SERVICES
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-emerald-400 border border-zinc-800 text-[10px] font-mono font-bold tracking-wider">
                  V1 GATEWAY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Developer API Gateway & Analytics Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {account ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                <UserCheck className="size-3.5" />
                <span>{account.id}</span>
              </div>
            ) : (
              <a
                href="/"
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                Connect Main Account
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-7">
        {/* Account Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090b] flex items-center gap-4">
            <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Total API Requests</div>
              <div className="text-xl font-bold text-white mt-0.5 font-mono">
                {totalRequests.toLocaleString()} <span className="text-xs font-normal text-zinc-500">calls</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090b] flex items-center gap-4">
            <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Database className="size-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Database Storage</div>
              <div className="text-xs font-bold text-emerald-400 mt-1 font-mono flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                <span>nonxe/recordsapi</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090b] flex items-center gap-4">
            <div className="size-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Last Active Request</div>
              <div className="text-xs font-bold text-white mt-1 font-mono truncate max-w-[170px]">
                {apiRecord?.lastUsedAt
                  ? new Date(apiRecord.lastUsedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "No Requests Yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Account API Key Card */}
        <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Personal API Authentication Key</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Synced to nonxe/recordsapi
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value={apiKey}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-[#000000] border border-zinc-800 text-xs font-mono font-bold text-emerald-400 outline-none"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                title={showKey ? "Hide API Key" : "Show API Key"}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(apiKey, "key")}
                className="flex-1 sm:flex-initial h-11 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {copiedKey ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                <span>{copiedKey ? "Copied" : "Copy Key"}</span>
              </button>

              <button
                onClick={handleRegenerateKey}
                disabled={keyLoading}
                className="h-11 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                title="Regenerate Key"
              >
                <RefreshCw className={`size-4 ${keyLoading ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Service Usage Breakdown */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Service Request Breakdown (nonxe/recordsapi):</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#000000] border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Youtube className="size-3.5 text-red-400" />
                  <span>YouTube (ytv3)</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{breakdown.ytv3 || 0}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#000000] border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Instagram className="size-3.5 text-rose-400" />
                  <span>Instagram</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{breakdown.instagram || 0}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#000000] border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>Claude AI</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{breakdown.ai || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Stream Table */}
        {recentLogs.length > 0 && (
          <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Recent API Request Stream Logs</h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Stored in nonxe/recordsapi</span>
            </div>

            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-[#000000]">
              <div className="divide-y divide-zinc-800/80">
                {recentLogs.map((log, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white uppercase">{log.service}</span>
                      <span className="text-zinc-500">{log.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                      <span>{log.latencyMs ? `${log.latencyMs}ms` : "OK"}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {log.status || 200} OK
                      </span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Testing Playground Console */}
        <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Live API Testing Playground</h2>
            </div>
            {latency !== null && (
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-emerald-400 border border-zinc-800 text-[10px] font-mono font-bold">
                ⚡ {latency} ms
              </span>
            )}
          </div>

          {/* Endpoint Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedEndpoint("ytv3");
                setInputQuery("https://www.youtube.com/watch?v=MwpMEbgC7DA");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                selectedEndpoint === "ytv3"
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              GET /api/v1/ytv3 (YouTube MP4)
            </button>

            <button
              onClick={() => {
                setSelectedEndpoint("instagram");
                setInputQuery("https://www.instagram.com/reel/DVydQvZDAfr/");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                selectedEndpoint === "instagram"
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              GET /api/v1/instagram (Reel Downloader)
            </button>

            <button
              onClick={() => {
                setSelectedEndpoint("ai");
                setInputQuery("Who are you?");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                selectedEndpoint === "ai"
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              GET /api/v1/ai (Claude 4.5 Haiku)
            </button>
          </div>

          {/* Parameter Input & Execute */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Enter parameter value..."
              className="flex-1 h-11 px-4 rounded-xl bg-[#000000] border border-zinc-800 text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500"
            />
            <button
              onClick={handleSendTestRequest}
              disabled={testLoading}
              className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              {testLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>

          {/* Live JSON Response Inspector Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Response Payload Inspector (Creator: "AS CLOUD SYSTEM"):</span>
              {testResponse && (
                <button
                  onClick={() => handleCopy(JSON.stringify(testResponse, null, 2), "response")}
                  className="hover:text-white flex items-center gap-1 font-bold text-emerald-400"
                >
                  {copiedResponse ? <Check className="size-3" /> : <Copy className="size-3" />}
                  <span>{copiedResponse ? "Copied JSON" : "Copy JSON"}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#000000] border border-zinc-800 font-mono text-xs max-h-80 overflow-y-auto leading-relaxed">
              {testLoading ? (
                <div className="py-8 text-center text-zinc-500 space-y-2">
                  <Loader2 className="size-6 animate-spin mx-auto text-emerald-400" />
                  <p>Proxying request & logging to nonxe/recordsapi...</p>
                </div>
              ) : testResponse ? (
                <pre className="text-emerald-300 font-bold whitespace-pre-wrap">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              ) : (
                <div className="py-8 text-center text-zinc-600">
                  Click "Send Request" above to execute API call & view JSON response payload.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Integration Snippets */}
        <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Integration Code Snippets</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">cURL Example</span>
              <pre className="p-3.5 rounded-xl bg-[#000000] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                {getCurlSnippet()}
              </pre>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">JavaScript (fetch) Example</span>
              <pre className="p-3.5 rounded-xl bg-[#000000] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                {getJsSnippet()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/api-services")({
  component: ApiServicesPage,
  head: () => ({
    meta: [
      { title: "CLOUD API SERVICES • Developer Gateway" },
      { name: "description", content: "Developer API Gateway for YouTube, Instagram & AI endpoints stored in nonxe/recordsapi with creator AS CLOUD SYSTEM." },
    ],
  }),
});
