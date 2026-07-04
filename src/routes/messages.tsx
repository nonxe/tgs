import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Lock,
  Send,
  UserPlus,
  MessageSquare,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  Users,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "SHS Messenger — Highly Encrypted E2EE Chat" },
      {
        name: "description",
        content:
          "End-to-End Encrypted private messaging system using AES-GCM and ECDH key agreement. Secure and anonymous.",
      },
    ],
  }),
  component: E2eeMessengerPage,
});

// Types
interface ChatUser {
  username: string;
  publicKey: string; // JWK string
  salt: string;
}

interface DBMessage {
  id: string;
  sender: string;
  recipient: string;
  encryptedContent: string;
  iv: string;
  timestamp: string;
}

interface DecryptedMessage extends DBMessage {
  plaintext: string;
  decryptionFailed?: boolean;
}

function E2eeMessengerPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Auth State
  const [isRegistered, setIsRegistered] = useState<boolean>(true); // toggle login/register
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Logged-in session state
  const [loggedInUser, setLoggedInUser] = useState<string>("");
  const [myPrivateKey, setMyPrivateKey] = useState<CryptoKey | null>(null);
  const [myAuthHash, setMyAuthHash] = useState<string>("");

  // Chat State
  const [contacts, setContacts] = useState<string[]>([]);
  const [activeContact, setActiveContact] = useState<string>("");
  const [newContactInput, setNewContactInput] = useState<string>("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState<boolean>(false);
  
  // Public keys cache to avoid repeated network requests
  const [publicKeysCache, setPublicKeysCache] = useState<Record<string, CryptoKey>>({});
  
  // Messages state
  const [rawMessages, setRawMessages] = useState<DBMessage[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  
  // Polling ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const t = saved || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    // Try loading session from localStorage
    const savedUser = localStorage.getItem("e2ee_username");
    const savedAuthHash = localStorage.getItem("e2ee_auth_hash");
    const savedPrivKeyJwk = localStorage.getItem("e2ee_private_key_jwk");

    if (savedUser && savedAuthHash && savedPrivKeyJwk) {
      importPrivateKeyFromJwk(JSON.parse(savedPrivKeyJwk)).then((privKey) => {
        setLoggedInUser(savedUser);
        setMyAuthHash(savedAuthHash);
        setMyPrivateKey(privKey);
      }).catch(err => {
        console.error("Failed to restore E2EE private key:", err);
        clearSession();
      });
    }

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Poll for messages once logged in
  useEffect(() => {
    if (loggedInUser && myAuthHash) {
      fetchMessages();
      pollingIntervalRef.current = setInterval(fetchMessages, 4000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [loggedInUser, myAuthHash]);

  // Decrypt messages when rawMessages or keys cache update
  useEffect(() => {
    decryptAllMessages();
  }, [rawMessages, myPrivateKey, publicKeysCache]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [decryptedMessages, activeContact]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const clearSession = () => {
    localStorage.removeItem("e2ee_username");
    localStorage.removeItem("e2ee_auth_hash");
    localStorage.removeItem("e2ee_private_key_jwk");
    setLoggedInUser("");
    setMyAuthHash("");
    setMyPrivateKey(null);
    setRawMessages([]);
    setDecryptedMessages([]);
    setActiveContact("");
    setContacts([]);
  };

  // --- CRYPTO HELPERS ---

  // Helper to hash password using SHA-256
  const sha256 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // Derive AES-GCM Key from password + salt using PBKDF2
  const deriveKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  };

  // Import Private Key from JWK format
  const importPrivateKeyFromJwk = async (jwk: JsonWebKey): Promise<CryptoKey> => {
    return window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      ["deriveKey"]
    );
  };

  // Import Public Key from JWK format
  const importPublicKeyFromJwk = async (jwk: JsonWebKey): Promise<CryptoKey> => {
    return window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );
  };

  // Generate ECDH Keypair
  const generateEcdhKeyPair = async (): Promise<CryptoKeyPair> => {
    return window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"]
    );
  };

  // Derive Shared AES key from my private key and other public key
  const deriveSharedAesKey = async (privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> => {
    return window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: publicKey
      },
      privateKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  };

  // --- E2EE OPERATIONS ---

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password) {
      setAuthError("Please fill in all fields.");
      setAuthLoading(false);
      return;
    }

    try {
      // 1. Generate auth hash (SHA-256 of username + password)
      const authHash = await sha256(cleanUser + password);
      
      // 2. Generate ECDH Key pair for message encryption
      const keyPair = await generateEcdhKeyPair();

      // 3. Export public key to JWK
      const pubKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

      // 4. Derive symmetric key from password to encrypt private key
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const kdfKey = await deriveKeyFromPassword(password, salt);

      // 5. Encrypt private key JWK with password-derived key
      const privKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
      const privKeyBytes = new TextEncoder().encode(JSON.stringify(privKeyJwk));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedPrivBytes = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        kdfKey,
        privKeyBytes
      );

      // Convert variables to hex/base64 for transport
      const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
      const encryptedPrivHex = Array.from(new Uint8Array(encryptedPrivBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // 6. Register on backend
      const res = await fetch("/api/messages/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          passwordHash: authHash,
          publicKey: JSON.stringify(pubKeyJwk),
          encryptedPrivateKey: JSON.stringify({ ciphertext: encryptedPrivHex, iv: ivHex }),
          salt: saltHex
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      // Set session
      setLoggedInUser(cleanUser);
      setMyAuthHash(authHash);
      setMyPrivateKey(keyPair.privateKey);

      // Save to localStorage
      localStorage.setItem("e2ee_username", cleanUser);
      localStorage.setItem("e2ee_auth_hash", authHash);
      localStorage.setItem("e2ee_private_key_jwk", JSON.stringify(privKeyJwk));

      setIsRegistered(true);
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during registration.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password) {
      setAuthError("Please fill in all fields.");
      setAuthLoading(false);
      return;
    }

    try {
      // 1. Fetch user public key and encrypted private key
      const res = await fetch(`/api/messages/publickey?username=${encodeURIComponent(cleanUser)}`);
      if (res.status === 404) throw new Error("Username does not exist.");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      const { encryptedPrivateKey, salt } = data;

      // 2. Derive KDF key from password + salt
      const saltBytes = new Uint8Array(salt.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
      const kdfKey = await deriveKeyFromPassword(password, saltBytes);

      // 3. Decrypt the private key JWK
      const ivBytes = new Uint8Array(encryptedPrivateKey.iv.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
      const cipherBytes = new Uint8Array(encryptedPrivateKey.ciphertext.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));

      let decryptedPrivJwkBytes;
      try {
        decryptedPrivJwkBytes = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: ivBytes },
          kdfKey,
          cipherBytes
        );
      } catch {
        throw new Error("Incorrect password.");
      }

      const privKeyJwk = JSON.parse(new TextDecoder().decode(decryptedPrivJwkBytes));

      // 4. Import the private key
      const privKey = await importPrivateKeyFromJwk(privKeyJwk);

      // 5. Store session
      const authHash = await sha256(cleanUser + password);
      setLoggedInUser(cleanUser);
      setMyAuthHash(authHash);
      setMyPrivateKey(privKey);

      // Save to local storage
      localStorage.setItem("e2ee_username", cleanUser);
      localStorage.setItem("e2ee_auth_hash", authHash);
      localStorage.setItem("e2ee_private_key_jwk", JSON.stringify(privKeyJwk));
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during login.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch all E2EE messages from backend
  const fetchMessages = async () => {
    if (!loggedInUser || !myAuthHash) return;

    try {
      const res = await fetch(`/api/messages/list?username=${encodeURIComponent(loggedInUser)}&authHash=${encodeURIComponent(myAuthHash)}`);
      if (res.ok) {
        const data = await res.json();
        setRawMessages(data.messages || []);
        
        // Extract unique contacts from messages (exclude myself)
        const participants = new Set<string>();
        data.messages.forEach((msg: DBMessage) => {
          if (msg.sender !== loggedInUser) participants.add(msg.sender);
          if (msg.recipient !== loggedInUser) participants.add(msg.recipient);
        });
        
        setContacts(prev => {
          const merged = new Set([...prev, ...participants]);
          return Array.from(merged);
        });
      }
    } catch (err) {
      console.error("Messages list fetch failed:", err);
    }
  };

  // Fetch or retrieve from cache user's ECDH public key
  const getPeerPublicKey = async (peerUsername: string): Promise<CryptoKey | null> => {
    if (publicKeysCache[peerUsername]) {
      return publicKeysCache[peerUsername];
    }

    try {
      const res = await fetch(`/api/messages/publickey?username=${encodeURIComponent(peerUsername)}`);
      if (!res.ok) return null;
      const data = await res.json();
      
      const pubKeyJwk = JSON.parse(data.publicKey);
      const pubKey = await importPublicKeyFromJwk(pubKeyJwk);
      
      setPublicKeysCache(prev => ({ ...prev, [peerUsername]: pubKey }));
      return pubKey;
    } catch (err) {
      console.error(`Failed to get public key for ${peerUsername}:`, err);
      return null;
    }
  };

  // Decrypt all messages locally using peer keys + my private key
  const decryptAllMessages = async () => {
    if (!myPrivateKey || rawMessages.length === 0) return;

    const list: DecryptedMessage[] = [];
    for (const msg of rawMessages) {
      const peer = msg.sender === loggedInUser ? msg.recipient : msg.sender;
      const peerPubKey = await getPeerPublicKey(peer);

      if (!peerPubKey) {
        list.push({ ...msg, plaintext: "[Secure Message — Waiting for peer key...]", decryptionFailed: true });
        continue;
      }

      try {
        // Derive shared AES key
        const sharedKey = await deriveSharedAesKey(myPrivateKey, peerPubKey);

        // Convert hex strings to byte arrays
        const ivBytes = new Uint8Array(msg.iv.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
        const cipherBytes = new Uint8Array(msg.encryptedContent.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

        // Decrypt
        const plaintextBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: ivBytes },
          sharedKey,
          cipherBytes
        );

        const plaintext = new TextDecoder().decode(plaintextBuffer);
        list.push({ ...msg, plaintext });
      } catch (err) {
        console.error("Decryption error:", err);
        list.push({ ...msg, plaintext: "[Decryption Failed — Key Mismatch]", decryptionFailed: true });
      }
    }
    setDecryptedMessages(list);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    const target = newContactInput.trim().toLowerCase();

    if (!target) return;
    if (target === loggedInUser) {
      setContactError("You cannot chat with yourself.");
      return;
    }
    if (contacts.includes(target)) {
      setActiveContact(target);
      setNewContactInput("");
      return;
    }

    setContactLoading(true);
    try {
      const pubKey = await getPeerPublicKey(target);
      if (!pubKey) {
        setContactError("User does not exist on SHS Network.");
      } else {
        setContacts(prev => [...prev, target]);
        setActiveContact(target);
        setNewContactInput("");
      }
    } catch {
      setContactError("Error adding contact.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeContact || !myPrivateKey) return;

    setSendLoading(true);
    try {
      // 1. Fetch/Get Bob's public key
      const peerPubKey = await getPeerPublicKey(activeContact);
      if (!peerPubKey) throw new Error("Recipient public key not available.");

      // 2. Derive shared key
      const sharedKey = await deriveSharedAesKey(myPrivateKey, peerPubKey);

      // 3. Encrypt the plaintext message
      const plaintextBytes = new TextEncoder().encode(messageInput.trim());
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const cipherBytes = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        sharedKey,
        plaintextBytes
      );

      // Convert ciphertext and IV to hex strings
      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
      const cipherHex = Array.from(new Uint8Array(cipherBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // 4. Send to backend
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: loggedInUser,
          recipient: activeContact,
          encryptedContent: cipherHex,
          iv: ivHex,
          authHash: myAuthHash
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to transmit message.");
      }

      setMessageInput("");
      fetchMessages(); // Immediately fetch to update local list
    } catch (err: any) {
      alert(err.message || "Failed to encrypt/send message.");
    } finally {
      setSendLoading(false);
    }
  };

  const activeMessages = decryptedMessages.filter(
    msg => (msg.sender === activeContact && msg.recipient === loggedInUser) ||
           (msg.sender === loggedInUser && msg.recipient === activeContact)
  );

  return (
    <main className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col h-screen overflow-hidden relative select-none">
      
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Lock className="size-4.5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-[16px] font-black tracking-tight leading-tight">SHS MESSENGER</h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                AES E2EE Private Chat Space
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loggedInUser && (
            <button
              onClick={clearSession}
              className="px-3.5 h-8 rounded-full border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Sign Out ({loggedInUser})
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>

      {/* Main UI Area */}
      {!loggedInUser ? (
        // Login & Register Form Container
        <div className="flex-1 flex items-center justify-center p-5 bg-secondary/5 overflow-y-auto select-text">
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-card p-6 shadow-2xl relative overflow-hidden ios-glass ios-shadow animate-spring-scale">
            
            {/* Header branding */}
            <div className="text-center space-y-2 mb-6 select-none">
              <div className="size-12 rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
                <Lock className="size-6" />
              </div>
              <h2 className="text-[20px] font-black tracking-tight">
                {isRegistered ? "Access Secure Chat" : "Create E2EE Account"}
              </h2>
              <p className="text-[11.5px] text-muted-foreground leading-normal max-w-xs mx-auto">
                {isRegistered
                  ? "Enter your credentials to download and decrypt your private keys locally."
                  : "Private keys are generated client-side and encrypted with your password."}
              </p>
            </div>

            {authError && (
              <div className="mb-4 rounded-xl border border-destructive/25 bg-destructive/5 text-destructive text-[12px] font-bold p-3 flex items-center gap-2">
                <AlertCircle className="size-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={isRegistered ? handleLogin : handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Username</label>
                <input
                  type="text"
                  placeholder="e.g. alice"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 bg-background border border-border/30 rounded-xl px-3.5 text-[13px] font-bold outline-none focus:border-emerald-500/40 transition-all lowercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-background border border-border/30 rounded-xl px-3.5 text-[13px] font-bold outline-none focus:border-emerald-500/40 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[13px] disabled:opacity-40 transition-all flex items-center justify-center gap-2 select-none"
              >
                {authLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isRegistered ? (
                  "Login securely"
                ) : (
                  "Create E2EE Account"
                )}
              </button>
            </form>

            <div className="mt-5 text-center select-none">
              <button
                onClick={() => {
                  setIsRegistered(!isRegistered);
                  setAuthError(null);
                }}
                className="text-[12px] font-bold text-emerald-500 hover:underline"
              >
                {isRegistered
                  ? "Don't have an account? Sign Up"
                  : "Already registered? Sign In"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // E2EE Chat Screen
        <div className="flex-1 flex min-h-0 bg-secondary/5 select-text">
          
          {/* Left Column: Contacts list */}
          <div className="w-80 border-r border-border/30 flex flex-col min-h-0 flex-shrink-0 bg-background/50 select-none">
            
            {/* Search/Add User Box */}
            <div className="p-4 border-b border-border/30 flex-shrink-0">
              <form onSubmit={handleAddContact} className="relative">
                <input
                  type="text"
                  placeholder="Search username to start chat..."
                  value={newContactInput}
                  onChange={(e) => setNewContactInput(e.target.value)}
                  className="w-full h-10 bg-background border border-border/40 rounded-xl pl-3 pr-10 text-[12px] font-bold outline-none focus:border-emerald-500/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={contactLoading || !newContactInput.trim()}
                  className="absolute right-1 top-1 size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20 active:scale-95 disabled:opacity-40 transition-all"
                >
                  {contactLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-4" />}
                </button>
              </form>
              
              {contactError && (
                <p className="text-[10px] font-black text-rose-500 mt-2 text-center">{contactError}</p>
              )}
            </div>

            {/* Contacts list scroll */}
            <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">
              <div className="text-[9.5px] font-black text-muted-foreground uppercase tracking-wider px-3 py-2">
                Secure Channels
              </div>
              
              {contacts.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageSquare className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[11.5px] font-black text-muted-foreground leading-normal">
                    No active channels.<br/>Search a username above to start an E2EE conversation.
                  </p>
                </div>
              ) : (
                contacts.map((c) => {
                  const isActive = activeContact === c;
                  // Get last message in this thread
                  const threadMsgs = decryptedMessages.filter(
                    msg => (msg.sender === c && msg.recipient === loggedInUser) ||
                           (msg.sender === loggedInUser && msg.recipient === c)
                  );
                  const lastMsg = threadMsgs[threadMsgs.length - 1];

                  return (
                    <div
                      key={c}
                      onClick={() => setActiveContact(c)}
                      className={`flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-all ${
                        isActive
                          ? "bg-emerald-500/10 border border-emerald-500/25 text-foreground shadow-sm"
                          : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent"
                      }`}
                    >
                      <div className={`size-9 rounded-full flex items-center justify-center font-black text-[13px] ${
                        isActive ? "bg-emerald-500 text-white" : "bg-secondary text-foreground"
                      }`}>
                        {c.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-black truncate text-foreground">
                            {c}
                          </span>
                        </div>
                        {lastMsg && (
                          <p className="text-[11px] truncate text-muted-foreground mt-0.5">
                            {lastMsg.plaintext}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat timeline */}
          <div className="flex-1 flex flex-col min-h-0 bg-background/30">
            {activeContact ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between bg-background/50 flex-shrink-0 select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 flex items-center justify-center font-black text-[14px]">
                      {activeContact.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-black leading-tight">{activeContact}</h3>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 tracking-wide uppercase mt-0.5">
                        <Lock className="size-2.5" />
                        <span>AES-GCM 256 E2EE Secure</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-emerald-500" />
                  </div>
                </div>

                {/* Messages scrollarea */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                  {activeMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
                      <div className="size-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-3">
                        <Lock className="size-6 text-emerald-500/40 animate-pulse" />
                      </div>
                      <p className="text-[13px] font-black">Secure Conversation Initiated</p>
                      <p className="text-[11px] text-muted-foreground max-w-[260px] mx-auto mt-0.5 leading-normal">
                        All payloads are encrypted in your browser using local ECDH public keys. The host cannot decrypt or inspect them.
                      </p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMe = msg.sender === loggedInUser;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] space-y-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {/* Message bubble */}
                            <div className={`px-4 py-2.5 rounded-[20px] text-[13.5px] font-medium leading-relaxed break-words shadow-sm ${
                              isMe
                                ? "bg-emerald-600 text-white rounded-br-[4px]"
                                : msg.decryptionFailed
                                  ? "bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-bl-[4px]"
                                  : "bg-secondary border border-border/40 text-foreground rounded-bl-[4px]"
                            }`}>
                              {msg.plaintext}
                            </div>
                            
                            {/* Meta */}
                            <span className="text-[9.5px] text-muted-foreground font-semibold px-1 select-none">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input bar */}
                <div className="p-4 border-t border-border/30 bg-background/50 flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type secure E2E message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 h-11 bg-background border border-border/35 rounded-xl px-4 text-[13px] font-bold outline-none focus:border-emerald-500/40 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={sendLoading || !messageInput.trim()}
                      className="size-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all flex-shrink-0"
                    >
                      {sendLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4.5" />}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none space-y-3">
                <div className="size-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                  <MessageSquare className="size-7 text-emerald-500/40 animate-pulse" />
                </div>
                <div>
                  <p className="text-[14px] font-black">E2EE Chat Space</p>
                  <p className="text-[11px] text-muted-foreground max-w-[260px] mx-auto mt-0.5 leading-normal">
                    Search or select a contact in the left panel to open an end-to-end encrypted private communications channel.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Security End Banner */}
      <div className="h-10 bg-background border-t border-border/40 flex-shrink-0 flex items-center justify-between px-5 select-none z-10">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Elliptic Curve Diffie-Hellman (ECDH P-256) Key Agreement • AES-GCM 256 Payload Encryption</span>
        </div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          E2EE Live Node
        </span>
      </div>
    </main>
  );
}
