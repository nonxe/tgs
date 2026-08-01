import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  ArrowLeft,
  Settings,
  User,
  Users,
  Radio,
  Bot,
  Bookmark,
  Pin,
  Save,
  Loader2,
  Lock,
  Sparkles,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Download,
  Trash2,
} from "lucide-react";
import { TDesktopChat, TDesktopMessage, TDesktopUserSession } from "../lib/github-aslink-telegram";

const INITIAL_CHATS: TDesktopChat[] = [
  {
    id: "saved_messages",
    title: "Saved Messages",
    username: "saved",
    type: "saved",
    lastMessage: "Cloud storage for notes and files",
    lastMessageTime: "12:00 PM",
    unreadCount: 0,
    isPinned: true,
  },
  {
    id: "tg_official",
    title: "Telegram News",
    username: "telegram",
    type: "channel",
    lastMessage: "Welcome to Telegram Desktop Cloud Client!",
    lastMessageTime: "11:45 AM",
    unreadCount: 1,
    isPinned: true,
  },
  {
    id: "dev_community",
    title: "Developers Community",
    username: "devs",
    type: "group",
    lastMessage: "Alex: Is nonxe/aslink database synced?",
    lastMessageTime: "10:30 AM",
    unreadCount: 3,
  },
  {
    id: "ai_bot",
    title: "Telegram Bot API",
    username: "bot",
    type: "bot",
    lastMessage: "Ready to route messages to real Telegram accounts.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
];

const INITIAL_MESSAGES: Record<string, TDesktopMessage[]> = {
  saved_messages: [
    {
      id: "m_1",
      senderId: "me",
      senderName: "You",
      chatId: "saved_messages",
      text: "Welcome to Telegram Desktop (tdesktop) Cloud Edition!\nAll session data and chats are stored permanently in nonxe/aslink database.",
      timestamp: "12:00 PM",
      isOutgoing: true,
    },
  ],
  tg_official: [
    {
      id: "m_2",
      senderId: "tg",
      senderName: "Telegram News",
      chatId: "tg_official",
      text: "Welcome to Telegram Desktop! This web client is inspired by telegramdesktop/tdesktop and connects to nonxe/aslink.",
      timestamp: "11:45 AM",
      isOutgoing: false,
    },
  ],
  dev_community: [
    {
      id: "m_3",
      senderId: "alex",
      senderName: "Alex",
      chatId: "dev_community",
      text: "Is nonxe/aslink database synced?",
      timestamp: "10:30 AM",
      isOutgoing: false,
    },
  ],
  ai_bot: [
    {
      id: "m_4",
      senderId: "bot",
      senderName: "Telegram Bot API",
      chatId: "ai_bot",
      text: "Connect your Telegram Bot Token in Settings to send and receive live Telegram messages!",
      timestamp: "Yesterday",
      isOutgoing: false,
    },
  ],
};

function TDesktopPage() {
  const [activeChatId, setActiveChatId] = useState("saved_messages");
  const [chats, setChats] = useState<TDesktopChat[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState<Record<string, TDesktopMessage[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "personal" | "groups" | "channels" | "bots">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // User & Bot Settings
  const [username, setUsername] = useState("User");
  const [botToken, setBotToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savingCloud, setSavingCloud] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0] || {
    id: "saved_messages",
    title: "Saved Messages",
    username: "saved",
    type: "saved",
    lastMessage: "Cloud storage for notes and files",
    lastMessageTime: "12:00 PM",
    unreadCount: 0,
  };
  const activeMessages = messages[activeChatId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load Session from nonxe/aslink
  useEffect(() => {
    async function loadCloudSession() {
      setLoadingCloud(true);
      try {
        const storedUser = localStorage.getItem("cloud_user_account");
        const userId = storedUser ? JSON.parse(storedUser).id : "guest_user";
        if (storedUser) setUsername(JSON.parse(storedUser).id);

        const res = await fetch(`/api/tdesktop/manage?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (data.success && data.session) {
          if (Array.isArray(data.session.chats) && data.session.chats.length > 0) {
            setChats(data.session.chats);
          }
          if (data.session.messages) {
            setMessages(data.session.messages);
          }
          if (data.session.botToken) setBotToken(data.session.botToken);
        }
      } catch {}
      setLoadingCloud(false);
    }

    loadCloudSession();
  }, []);

  // Save Session to nonxe/aslink
  const handleSaveToCloud = async () => {
    setSavingCloud(true);
    try {
      const storedUser = localStorage.getItem("cloud_user_account");
      const userId = storedUser ? JSON.parse(storedUser).id : "guest_user";

      const session: TDesktopUserSession = {
        userId,
        username,
        botToken,
        chats,
        messages,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/tdesktop/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", session }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Saved Telegram Desktop session to nonxe/aslink repository!");
      } else {
        showToast(data.error || "Failed to save session.", "error");
      }
    } catch (err: any) {
      showToast("Cloud save error: " + err.message, "error");
    }
    setSavingCloud(false);
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: TDesktopMessage = {
      id: "msg_" + Date.now(),
      senderId: "me",
      senderName: username,
      chatId: activeChatId,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOutgoing: true,
    };

    const updatedMsgs = [...(messages[activeChatId] || []), newMsg];
    setMessages((prev) => ({ ...prev, [activeChatId]: updatedMsgs }));

    // Update last message in chat list
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.timestamp, unreadCount: 0 }
          : c
      )
    );

    const sentText = inputText.trim();
    setInputText("");

    // If Telegram Bot Token & Target Chat ID are set, route via Telegram Bot API
    if (botToken && tgChatId) {
      try {
        await fetch("/api/tdesktop/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_telegram_bot",
            botToken,
            chatId: tgChatId,
            text: `[TDesktop Web] ${username}: ${sentText}`,
          }),
        });
      } catch {}
    } else {
      // Simulate Echo Bot response for AI/Bot chats
      if (activeChat.type === "bot" || activeChatId === "ai_bot") {
        setTimeout(() => {
          const botReply: TDesktopMessage = {
            id: "msg_bot_" + Date.now(),
            senderId: "bot",
            senderName: activeChat.title,
            chatId: activeChatId,
            text: `Bot Echo: Received "${sentText}". Connect Telegram Bot Token in Settings to message real Telegram chats!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOutgoing: false,
          };
          setMessages((prev) => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), botReply],
          }));
        }, 1000);
      }
    }
  };

  // Filtered Chat List
  const filteredChats = chats.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.lastMessage?.toLowerCase().includes(q)) return false;
    }
    if (filter === "personal") return c.type === "user" || c.type === "saved";
    if (filter === "groups") return c.type === "group";
    if (filter === "channels") return c.type === "channel";
    if (filter === "bots") return c.type === "bot";
    return true;
  });

  return (
    <main className="min-h-screen bg-[#070b14] text-foreground font-sans flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Telegram Desktop Window Outer Frame */}
      <div className="w-full max-w-6xl h-screen sm:h-[90vh] bg-[#0e1621] border border-border/30 rounded-none sm:rounded-3xl shadow-2xl flex overflow-hidden relative">
        {/* Left Chat List Sidebar */}
        <aside className="w-80 sm:w-96 border-r border-border/20 bg-[#17212b] flex flex-col flex-shrink-0 z-20">
          {/* Header & Search Bar */}
          <div className="p-3 border-b border-border/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href="/"
                  className="size-8 rounded-xl bg-secondary/30 hover:bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  title="Back to Home"
                >
                  <ArrowLeft className="size-4" />
                </a>
                <h1 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-cyan-400" />
                  <span>Telegram Desktop</span>
                </h1>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveToCloud}
                  disabled={savingCloud}
                  className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1"
                  title="Save Session to nonxe/aslink"
                >
                  {savingCloud ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span className="hidden md:inline">Save</span>
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                  title="Telegram Settings"
                >
                  <Settings className="size-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or messages..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0e1621] text-xs text-foreground placeholder:text-muted-foreground/40 border border-border/20 outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1">
              {(["all", "personal", "groups", "channels", "bots"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all flex-shrink-0 ${
                    filter === f ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/10 scrollbar-thin">
            {filteredChats.map((c) => {
              const isActive = c.id === activeChatId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveChatId(c.id);
                    setChats((prev) => prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item)));
                  }}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                    isActive ? "bg-[#2b5278]" : "hover:bg-[#202b36]"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`size-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                        c.type === "saved"
                          ? "bg-gradient-to-tr from-cyan-500 to-blue-500"
                          : c.type === "channel"
                          ? "bg-gradient-to-tr from-purple-500 to-pink-500"
                          : c.type === "group"
                          ? "bg-gradient-to-tr from-emerald-500 to-teal-500"
                          : "bg-gradient-to-tr from-sky-500 to-indigo-500"
                      }`}
                    >
                      {c.type === "saved" ? (
                        <Bookmark className="size-5" />
                      ) : c.type === "channel" ? (
                        <Radio className="size-5" />
                      ) : c.type === "group" ? (
                        <Users className="size-5" />
                      ) : c.type === "bot" ? (
                        <Bot className="size-5" />
                      ) : (
                        c.title.charAt(0).toUpperCase()
                      )}
                    </div>
                    {c.isPinned && (
                      <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-slate-900 border border-border/40 flex items-center justify-center text-muted-foreground">
                        <Pin className="size-2.5 text-cyan-400" />
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-foreground truncate">{c.title}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">{c.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11.5px] text-muted-foreground/80 truncate leading-relaxed">
                        {c.lastMessage || "No messages yet"}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="size-4.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Active Chat Workspace */}
        <section className="flex-1 flex flex-col bg-[#0e1621] relative overflow-hidden">
          {/* Active Chat Top Bar */}
          <header className="h-16 border-b border-border/20 bg-[#17212b] px-4 flex items-center justify-between z-10 flex-shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  activeChat.type === "saved"
                    ? "bg-gradient-to-tr from-cyan-500 to-blue-500"
                    : activeChat.type === "channel"
                    ? "bg-gradient-to-tr from-purple-500 to-pink-500"
                    : activeChat.type === "group"
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-500"
                    : "bg-gradient-to-tr from-sky-500 to-indigo-500"
                }`}
              >
                {activeChat.type === "saved" ? (
                  <Bookmark className="size-4.5" />
                ) : activeChat.type === "channel" ? (
                  <Radio className="size-4.5" />
                ) : activeChat.type === "group" ? (
                  <Users className="size-4.5" />
                ) : activeChat.type === "bot" ? (
                  <Bot className="size-4.5" />
                ) : (
                  activeChat.title.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground">{activeChat.title}</h2>
                <p className="text-[11px] text-cyan-400 font-mono">
                  {activeChat.type === "saved"
                    ? "Your personal cloud notebook"
                    : activeChat.type === "bot"
                    ? "Bot Service • nonxe/aslink"
                    : "@" + (activeChat.username || activeChat.id)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                <Phone className="size-4" />
              </button>
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                <Video className="size-4" />
              </button>
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                <Info className="size-4" />
              </button>
            </div>
          </header>

          {/* Messages Scroll Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0e1621] scrollbar-thin">
            {activeMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] ${m.isOutgoing ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-lg whitespace-pre-wrap ${
                    m.isOutgoing
                      ? "bg-[#2b5278] text-white rounded-tr-none border border-cyan-500/20"
                      : "bg-[#182533] text-foreground rounded-tl-none border border-border/30"
                  }`}
                >
                  {!m.isOutgoing && m.senderName && (
                    <div className="text-[10px] font-bold text-cyan-400 mb-1">{m.senderName}</div>
                  )}
                  <p>{m.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[9.5px] mt-1 ${
                      m.isOutgoing ? "text-cyan-200/70" : "text-muted-foreground/60"
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.isOutgoing && <CheckCheck className="size-3 text-cyan-300" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Dock */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-border/20 bg-[#17212b] flex items-center gap-2 z-10 flex-shrink-0"
          >
            <button type="button" className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all">
              <Paperclip className="size-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 py-2.5 px-4 rounded-2xl bg-[#0e1621] text-xs text-foreground placeholder:text-muted-foreground/40 border border-border/20 outline-none focus:border-cyan-500 transition-all font-sans"
            />

            <button type="button" className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all">
              <Smile className="size-4" />
            </button>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold disabled:opacity-30 transition-all shadow-lg shadow-cyan-600/20"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
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

      {/* Settings & Telegram Bot Integration Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#17212b] border border-cyan-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Settings className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Telegram Desktop Settings</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">Session synced to nonxe/aslink</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Display Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Your Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1621] border border-border/30 text-xs font-bold text-foreground outline-none focus:border-cyan-500"
                />
              </div>

              {/* Telegram Bot Token */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1">
                  <Bot className="size-3.5" />
                  <span>Telegram Bot API Token (Optional)</span>
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1621] border border-cyan-500/30 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Enter your Telegram Bot Token from @BotFather to send real messages to Telegram!
                </p>
              </div>

              {/* Telegram Chat ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase font-mono">Telegram Chat ID</label>
                <input
                  type="text"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  placeholder="e.g. 123456789 or @channelname"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1621] border border-border/30 text-xs font-mono text-foreground outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSaveToCloud();
                  setShowSettingsModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-600/20"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export const Route = createFileRoute("/tdesktop")({
  component: TDesktopPage,
  head: () => ({
    meta: [
      { title: "Telegram Desktop • tdesktop Cloud Client" },
      { name: "description", content: "Official-style Telegram Desktop web client backed by code persistence in nonxe/aslink repository." },
    ],
  }),
});
