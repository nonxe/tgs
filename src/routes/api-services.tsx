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
  Youtube,
  Instagram,
  Sparkles,
  Database,
  CheckCircle2,
  BookOpen,
  FileCode,
  ShieldCheck,
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
  const [codeTab, setCodeTab] = useState<"curl" | "js" | "python">("curl");

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
      return `// JavaScript fetch example
async function downloadYouTube(videoUrl, apiKey) {
  const response = await fetch(\`${origin}/api/v1/ytv3?url=\${encodeURIComponent(videoUrl)}&apikey=\${apiKey}\`);
  const data = await response.json();
  console.log("Creator:", data.creator);
  console.log("Download URL:", data.result?.download_url);
  return data;
}

downloadYouTube("${inputQuery}", "${apiKey}");`;
    } else if (selectedEndpoint === "instagram") {
      return `// JavaScript fetch example
async function downloadInstagram(reelUrl, apiKey) {
  const response = await fetch(\`${origin}/api/v1/instagram?url=\${encodeURIComponent(reelUrl)}&apikey=\${apiKey}\`);
  const data = await response.json();
  console.log("Creator:", data.creator);
  console.log("Media URL:", data.result?.video || data.result?.url);
  return data;
}

downloadInstagram("${inputQuery}", "${apiKey}");`;
    } else {
      return `// JavaScript fetch example
async function askClaude(prompt, apiKey) {
  const response = await fetch(\`${origin}/api/v1/ai?prompt=\${encodeURIComponent(prompt)}&apikey=\${apiKey}\`);
  const data = await response.json();
  console.log("Creator:", data.creator);
  console.log("AI Response:", data.data);
  return data;
}

askClaude("${inputQuery}", "${apiKey}");`;
    }
  };

  const getPythonSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
    if (selectedEndpoint === "ytv3") {
      return `# Python requests example
import requests

url = "${origin}/api/v1/ytv3"
params = {
    "url": "${inputQuery}",
    "apikey": "${apiKey}"
}

response = requests.get(url, params=params)
data = response.json()
print("Creator:", data.get("creator"))
print("Download URL:", data.get("result", {}).get("download_url"))`;
    } else if (selectedEndpoint === "instagram") {
      return `# Python requests example
import requests

url = "${origin}/api/v1/instagram"
params = {
    "url": "${inputQuery}",
    "apikey": "${apiKey}"
}

response = requests.get(url, params=params)
data = response.json()
print("Creator:", data.get("creator"))
print("Media URL:", data.get("result", {}).get("video"))`;
    } else {
      return `# Python requests example
import requests

url = "${origin}/api/v1/ai"
params = {
    "prompt": "${inputQuery}",
    "apikey": "${apiKey}"
}

response = requests.get(url, params=params)
data = response.json()
print("Creator:", data.get("creator"))
print("AI Output:", data.get("data"))`;
    }
  };

  const totalRequests = apiRecord?.requestCount || 0;
  const breakdown = apiRecord?.serviceBreakdown || { ytv3: 0, instagram: 0, ai: 0 };
  const recentLogs: ApiUsageLog[] = apiRecord?.recentLogs || [];

  return (
    <main className="min-h-screen bg-[#000000] text-foreground font-sans relative selection:bg-white/20 pb-20">
      {/* Top Navbar Header */}
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
                <span className="p-1 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800">
                  <Code2 className="size-4" />
                </span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  CLOUD API SERVICES
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Developer API Gateway & Authentication Services
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
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                Connect Main Account
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-7">
        {/* Quick Analytics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#09090b] flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Total API Requests</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {totalRequests.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-[#09090b] flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Database className="size-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Database Connection</div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                <span>Cloud Database Active</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-[#09090b] flex items-center gap-3.5">
            <div className="size-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Last Active Call</div>
              <div className="text-xs font-bold text-white font-mono mt-1 truncate max-w-[170px]">
                {apiRecord?.lastUsedAt
                  ? new Date(apiRecord.lastUsedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "No Requests Yet"}
              </div>
            </div>
          </div>
        </div>

        {/* API Key Credentials Management */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Your Personal API Key</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {account ? "Account Key Active" : "Public Demo Key"}
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
                title={showKey ? "Hide Key" : "Show Key"}
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
                title="Regenerate API Key"
              >
                <RefreshCw className={`size-4 ${keyLoading ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Breakdown per service */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="text-[11px] font-mono text-zinc-400 uppercase mb-2">Request Counters per Service:</div>
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

        {/* Live Testing Playground */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Live API Playground Console</h2>
            </div>
            {latency !== null && (
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-emerald-400 border border-zinc-800 text-[10px] font-mono font-bold">
                ⚡ {latency} ms
              </span>
            )}
          </div>

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
              GET /api/v1/ai (Claude 4.5 AI)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Enter URL or prompt..."
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
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Execute API</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Response Inspector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Response JSON Inspector (Creator: "AS CLOUD SYSTEM"):</span>
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
                  <p>Processing API Request...</p>
                </div>
              ) : testResponse ? (
                <pre className="text-emerald-300 font-bold whitespace-pre-wrap">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              ) : (
                <div className="py-8 text-center text-zinc-600">
                  Execute an API request above to view formatted JSON response.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comprehensive API Documentation & Reference */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <BookOpen className="size-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">API Reference & Endpoint Documentation</h2>
          </div>

          {/* Authentication Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              Authentication Methods
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All requests to the Cloud API Services Gateway require valid API authentication. You can pass your key via query parameter or HTTP header:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#000000] border border-zinc-800 space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">1. Query Parameter</span>
                <p className="text-xs font-mono text-zinc-300">GET /api/v1/ytv3?url=...&apikey=YOUR_KEY</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#000000] border border-zinc-800 space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">2. HTTP Header</span>
                <p className="text-xs font-mono text-zinc-300">x-api-key: YOUR_KEY</p>
              </div>
            </div>
          </div>

          {/* Endpoints Breakdown */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Available Endpoints</h3>

            {/* Endpoint 1 */}
            <div className="p-4 rounded-xl bg-[#000000] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold">
                    GET
                  </span>
                  <code className="text-xs font-mono font-bold text-white">/api/v1/ytv3</code>
                </div>
                <span className="text-xs text-zinc-400">YouTube Video Downloader (MP4 720p)</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1 font-mono">
                <div><span className="text-zinc-500">Parameters:</span> <code className="text-emerald-400">url</code> (required, YouTube link), <code className="text-emerald-400">apikey</code> (required)</div>
                <div><span className="text-zinc-500">Creator Field:</span> Returns <code className="text-emerald-400 font-bold">"AS CLOUD SYSTEM"</code></div>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="p-4 rounded-xl bg-[#000000] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold">
                    GET
                  </span>
                  <code className="text-xs font-mono font-bold text-white">/api/v1/instagram</code>
                </div>
                <span className="text-xs text-zinc-400">Instagram Reel & Post Downloader</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1 font-mono">
                <div><span className="text-zinc-500">Parameters:</span> <code className="text-emerald-400">url</code> (required, Instagram link), <code className="text-emerald-400">apikey</code> (required)</div>
                <div><span className="text-zinc-500">Creator Field:</span> Returns <code className="text-emerald-400 font-bold">"AS CLOUD SYSTEM"</code></div>
              </div>
            </div>

            {/* Endpoint 3 */}
            <div className="p-4 rounded-xl bg-[#000000] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold">
                    GET
                  </span>
                  <code className="text-xs font-mono font-bold text-white">/api/v1/ai</code>
                </div>
                <span className="text-xs text-zinc-400">Claude 4.5 Haiku AI Assistant</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1 font-mono">
                <div><span className="text-zinc-500">Parameters:</span> <code className="text-emerald-400">prompt</code> (required, text query), <code className="text-emerald-400">apikey</code> (required)</div>
                <div><span className="text-zinc-500">Creator Field:</span> Returns <code className="text-emerald-400 font-bold">"AS CLOUD SYSTEM"</code></div>
              </div>
            </div>
          </div>

          {/* Integration Code Tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="size-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Code Implementation Examples</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCodeTab("curl")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    codeTab === "curl" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setCodeTab("js")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    codeTab === "js" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => setCodeTab("python")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    codeTab === "python" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-[#000000] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
              {codeTab === "curl" ? getCurlSnippet() : codeTab === "js" ? getJsSnippet() : getPythonSnippet()}
            </pre>
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
      { name: "description", content: "Developer API Services for YouTube, Instagram & AI proxy endpoints with creator attribution AS CLOUD SYSTEM." },
    ],
  }),
});
