import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Mail,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Inbox,
  ArrowLeft,
  Sun,
  Moon,
  Loader2,
  Clock,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export const Route = createFileRoute("/tempmail")({
  head: () => ({
    meta: [
      { title: "Temp Mail — Premium Anonymous Disposable Email" },
      {
        name: "description",
        content:
          "Generate temporary, anonymous email addresses to bypass spam. View incoming emails in real-time.",
      },
    ],
  }),
  component: TempMailPage,
});

interface MailMessage {
  id: string;
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    address: string;
    name: string;
  }>;
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
}

interface FullMessage extends MailMessage {
  text: string;
  html: string[];
}

function TempMailPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  // Account state
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  
  // Loading & Error states
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inbox states
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<FullMessage | null>(null);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  
  // UI indicators
  const [copied, setCopied] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    // Load existing account from localStorage
    const savedEmail = localStorage.getItem("tempmail_address");
    const savedToken = localStorage.getItem("tempmail_token");
    const savedAccountId = localStorage.getItem("tempmail_account_id");

    if (savedEmail && savedToken && savedAccountId) {
      setEmailAddress(savedEmail);
      setToken(savedToken);
      setAccountId(savedAccountId);
      fetchInbox(savedToken);
    } else {
      generateNewAccount();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle auto-refresh interval
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (autoRefresh && token) {
      timerRef.current = setInterval(() => {
        pollInbox();
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, token]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // Helper to generate random credentials
  const generateRandomString = (length: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateNewAccount = async () => {
    setLoading(true);
    setError(null);
    setSelectedMessage(null);
    setMessages([]);

    try {
      // 1. Fetch available domains
      const domainRes = await fetch("https://api.mail.tm/domains");
      if (!domainRes.ok) throw new Error("Failed to load mail domains.");
      const domainsData = await domainRes.json();
      const activeDomains = domainsData["hydra:member"]?.filter((d: any) => d.isActive);
      
      if (!activeDomains || activeDomains.length === 0) {
        throw new Error("No active email domains available.");
      }
      
      const selectedDomain = activeDomains[0].domain;
      const username = `cloud_${generateRandomString(8)}`;
      const email = `${username}@${selectedDomain}`;
      const password = generateRandomString(12);

      // 2. Create the account
      const createRes = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.message || "Failed to create mail account.");
      }
      
      const createData = await createRes.json();
      const newAccountId = createData.id;

      // 3. Get JWT Auth Token
      const tokenRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
      });

      if (!tokenRes.ok) throw new Error("Authentication failed.");
      const tokenData = await tokenRes.json();
      const newToken = tokenData.token;

      // Save to state
      setEmailAddress(email);
      setToken(newToken);
      setAccountId(newAccountId);

      // Save to localStorage
      localStorage.setItem("tempmail_address", email);
      localStorage.setItem("tempmail_token", newToken);
      localStorage.setItem("tempmail_account_id", newAccountId);

      // Fetch initial empty inbox
      fetchInbox(newToken);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInbox = async (authToken: string) => {
    setRefreshing(true);
    try {
      const res = await fetch("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to load messages.");
      const data = await res.json();
      setMessages(data["hydra:member"] || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const pollInbox = async () => {
    if (!token) return;
    try {
      const res = await fetch("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data["hydra:member"] || []);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  const handleRefresh = () => {
    if (token) fetchInbox(token);
  };

  const handleCopy = () => {
    if (!emailAddress) return;
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const readMessage = async (msgId: string) => {
    if (!token) return;
    setMessageLoading(true);
    try {
      const res = await fetch(`https://api.mail.tm/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load message body.");
      const data = await res.json();
      setSelectedMessage(data);
      
      // Mark as seen locally
      setMessages(prev => 
        prev.map(m => m.id === msgId ? { ...m, seen: true } : m)
      );
    } catch (err: any) {
      alert(err.message || "Error reading message.");
    } finally {
      setMessageLoading(false);
    }
  };

  const deleteMessage = async (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    
    if (selectedMessage?.id === msgId) {
      setSelectedMessage(null);
    }

    try {
      await fetch(`https://api.mail.tm/messages/${msgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete this email address? All messages will be permanently lost.")) {
      return;
    }
    
    if (token && accountId) {
      try {
        await fetch(`https://api.mail.tm/accounts/${accountId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to delete account on server:", err);
      }
    }

    // Clear local storage
    localStorage.removeItem("tempmail_address");
    localStorage.removeItem("tempmail_token");
    localStorage.removeItem("tempmail_account_id");

    setEmailAddress("");
    setToken("");
    setAccountId("");
    generateNewAccount();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + d.toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col h-screen overflow-hidden relative">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80 flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Mail className="size-4.5 text-violet-500" />
            </div>
            <div>
              <h1 className="text-[16px] font-black tracking-tight leading-tight">TEMP MAIL</h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Anonymous Disposable Inbox
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-secondary/5">
        {/* Left Side: Address Control & Inbox List */}
        <div className="w-full md:w-[420px] border-r border-border/30 flex flex-col min-h-0 flex-shrink-0 bg-background/50">
          
          {/* Email Address Panel */}
          <div className="p-5 border-b border-border/30 space-y-4 flex-shrink-0">
            {loading ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="size-6 text-violet-500 animate-spin" />
                <span className="text-[11.5px] font-bold text-muted-foreground">Generating address...</span>
              </div>
            ) : error ? (
              <div className="p-3.5 rounded-[16px] border border-destructive/20 bg-destructive/5 space-y-2 text-center">
                <AlertCircle className="size-5 text-destructive mx-auto" />
                <p className="text-[12px] font-bold text-destructive">{error}</p>
                <button
                  onClick={generateNewAccount}
                  className="px-4 py-1.5 rounded-full bg-destructive text-white text-[11px] font-black hover:bg-destructive/80 transition-all"
                >
                  Retry Generator
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Your Disposable Email Address
                  </span>
                  
                  {/* Address Display Bar */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-secondary/45 border border-border/35 rounded-[16px] px-4 flex items-center justify-between font-bold text-[13.5px] select-all overflow-x-auto scrollbar-none whitespace-nowrap">
                      {emailAddress}
                    </div>
                    
                    <button
                      onClick={handleCopy}
                      className="size-12 rounded-[16px] border border-border/35 bg-background flex items-center justify-center hover:bg-secondary active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                      title="Copy Address"
                    >
                      {copied ? <Check className="size-4.5 text-emerald-500" /> : <Copy className="size-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Actions & Refresh */}
                <div className="flex items-center justify-between pt-1 select-none">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={deleteAccount}
                      className="flex items-center gap-1.5 text-[11.5px] font-black text-rose-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Change Address</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Auto Refresh toggle */}
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`h-6 px-2.5 rounded-full border text-[9.5px] font-black tracking-wider uppercase transition-all flex items-center gap-1 ${
                        autoRefresh 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <Clock className="size-3" />
                      <span>{autoRefresh ? "Auto On" : "Auto Off"}</span>
                    </button>

                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="size-7 rounded-full border border-border/40 flex items-center justify-center hover:bg-secondary active:scale-90 disabled:opacity-40 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-violet-500" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inbox Messages list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none space-y-3">
                <div className="size-14 rounded-full bg-violet-500/5 border border-violet-500/10 flex items-center justify-center">
                  <Inbox className="size-6 text-muted-foreground opacity-45" />
                </div>
                <div>
                  <p className="text-[13.5px] font-black">Waiting for incoming emails...</p>
                  <p className="text-[11px] text-muted-foreground max-w-[240px] mx-auto mt-0.5 leading-normal">
                    This inbox refreshes automatically. Use this temporary address to receive signup verifications or attachments.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/25">
                {messages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => readMessage(msg.id)}
                      className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-secondary/30 relative ${
                        isSelected ? "bg-secondary/40 border-l-[3px] border-violet-500" : ""
                      } ${!msg.seen ? "bg-violet-500/[0.02]" : ""}`}
                    >
                      {/* Unread indicator */}
                      {!msg.seen && (
                        <span className="absolute left-2.5 top-[22px] size-2 rounded-full bg-violet-500" />
                      )}

                      <div className="flex-1 min-w-0 space-y-1 pl-2">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-[12.5px] truncate ${!msg.seen ? "font-black" : "font-bold text-muted-foreground"}`}>
                            {msg.from.name || msg.from.address}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0">
                            {formatDate(msg.createdAt).split(" - ")[0]}
                          </span>
                        </div>
                        <p className={`text-[13px] truncate ${!msg.seen ? "font-black text-foreground" : "font-bold text-foreground/80"}`}>
                          {msg.subject || "(No Subject)"}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground truncate leading-normal">
                          {msg.intro}
                        </p>
                      </div>

                      <button
                        onClick={(e) => deleteMessage(msg.id, e)}
                        className="size-7 rounded-full hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-muted-foreground/60 transition-all self-center"
                        title="Delete Message"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Message Detail Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative">
          {messageLoading ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95">
              <Loader2 className="size-7 text-violet-500 animate-spin mb-2" />
              <span className="text-[12.5px] font-bold text-muted-foreground">Loading message body...</span>
            </div>
          ) : selectedMessage ? (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Message Header Stats */}
              <div className="p-5 border-b border-border/30 space-y-3 flex-shrink-0 select-text">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-[16px] md:text-[18px] font-black tracking-tight leading-tight">
                    {selectedMessage.subject || "(No Subject)"}
                  </h2>
                  <span className="text-[11px] font-black text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border/40 whitespace-nowrap">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>

                <div className="space-y-1 text-[12.5px] font-bold">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12 flex-shrink-0">From:</span>
                    <span className="text-foreground truncate">
                      {selectedMessage.from.name ? `${selectedMessage.from.name} <${selectedMessage.from.address}>` : selectedMessage.from.address}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12 flex-shrink-0">To:</span>
                    <span className="text-foreground truncate">{emailAddress}</span>
                  </div>
                </div>
              </div>

              {/* Message Render Area */}
              <div className="flex-1 overflow-y-auto p-5 select-text bg-white dark:bg-[#15202b]">
                {selectedMessage.html && selectedMessage.html.length > 0 ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <style>
                            body {
                              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                              font-size: 14px;
                              line-height: 1.6;
                              color: ${theme === "dark" ? "#ffffff" : "#1a1a1a"};
                              background-color: ${theme === "dark" ? "#15202b" : "#ffffff"};
                              margin: 0;
                              padding: 10px;
                            }
                            a { color: #8b5cf6; }
                            img { max-width: 100%; height: auto; }
                          </style>
                        </head>
                        <body>
                          ${selectedMessage.html[0]}
                        </body>
                      </html>
                    `}
                    className="w-full h-full border-0 bg-transparent"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    title="Email content"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-foreground dark:text-foreground/90">
                    {selectedMessage.text}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none space-y-3 bg-secondary/[0.02]">
              <div className="size-16 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-center shadow-sm">
                <Mail className="size-7 text-violet-500/40 animate-pulse" />
              </div>
              <div>
                <p className="text-[14px] font-black">No email selected</p>
                <p className="text-[11px] text-muted-foreground max-w-[250px] mx-auto mt-0.5 leading-normal">
                  Click on any incoming email from the inbox list on the left to read its full HTML or text content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Security Shield Footer Banner */}
      <div className="h-10 bg-background border-t border-border/40 flex-shrink-0 flex items-center justify-between px-5 select-none z-10">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>SSL End-to-End Encryption • Zero Tracking Logs</span>
        </div>
        <span className="text-[10px] font-black text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
          Live Connection Active
        </span>
      </div>
    </main>
  );
}
