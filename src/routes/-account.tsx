import { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Check, 
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

interface LocalUser {
  email: string;
  username: string;
  joined: string;
}

export function AccountPage({ embed = false }: { embed?: boolean }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; username: string; joined: string } | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSupabaseWorking, setIsSupabaseWorking] = useState(true);

  // Initialize and check current session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try Supabase auth first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session?.user) {
          setIsLoggedIn(true);
          setUser({
            email: session.user.email || "",
            username: session.user.user_metadata?.username || session.user.email?.split("@")[0] || "User",
            joined: new Date(session.user.created_at).toLocaleDateString(),
          });
          setIsSupabaseWorking(true);
          return;
        }
      } catch (e) {
        console.warn("Supabase session check failed, using local storage fallback:", e);
        setIsSupabaseWorking(false);
      }

      // Local storage session fallback
      const localSession = localStorage.getItem("cloud_active_session");
      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          setIsLoggedIn(true);
          setUser(sessionData);
        } catch {
          localStorage.removeItem("cloud_active_session");
        }
      }
    };

    checkSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword || (mode === "signup" && !cleanUsername)) {
      setError("Please fill out all fields.");
      setBusy(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setBusy(false);
      return;
    }

    // --- Mode: SIGN UP (Register) ---
    if (mode === "signup") {
      // 1. Try Supabase
      if (isSupabaseWorking) {
        try {
          const { data, error: signupError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
              data: {
                username: cleanUsername,
              }
            }
          });

          if (signupError) throw signupError;

          if (data.user) {
            setSuccess("Account created successfully! Check your email for verification (or proceed to local fallback signin).");
            // Also register in local storage as fallback
            saveLocalUser(cleanEmail, cleanUsername);
            setMode("signin");
            setBusy(false);
            return;
          }
        } catch (e: any) {
          console.warn("Supabase SignUp failed, attempting Local Auth signup fallback...", e.message);
        }
      }

      // 2. Local fallback registration
      const localUsersStr = localStorage.getItem("cloud_local_users") || "[]";
      try {
        const localUsers: LocalUser[] = JSON.parse(localUsersStr);
        if (localUsers.some(u => u.email === cleanEmail)) {
          setError("An account with this email already exists.");
          setBusy(false);
          return;
        }

        const newUser: LocalUser = {
          email: cleanEmail,
          username: cleanUsername,
          joined: new Date().toLocaleDateString(),
        };

        // Simulated secure hashing key (storing password key for demo login)
        localStorage.setItem(`pwd_${cleanEmail}`, cleanPassword);
        localUsers.push(newUser);
        localStorage.setItem("cloud_local_users", JSON.stringify(localUsers));

        setSuccess("Account created successfully (Local Storage mode)!");
        setMode("signin");
        setPassword("");
      } catch (err: any) {
        setError("Registration failed: " + err.message);
      }
    } 
    // --- Mode: SIGN IN (Login) ---
    else {
      // 1. Try Supabase
      if (isSupabaseWorking) {
        try {
          const { data, error: signinError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });

          if (signinError) throw signinError;

          if (data.user) {
            const loggedUser = {
              email: data.user.email || "",
              username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
              joined: new Date(data.user.created_at).toLocaleDateString(),
            };
            setUser(loggedUser);
            setIsLoggedIn(true);
            setBusy(false);
            return;
          }
        } catch (e: any) {
          console.warn("Supabase SignIn failed, trying local credentials...", e.message);
        }
      }

      // 2. Local fallback authentication
      const savedPassword = localStorage.getItem(`pwd_${cleanEmail}`);
      if (savedPassword && savedPassword === cleanPassword) {
        const localUsersStr = localStorage.getItem("cloud_local_users") || "[]";
        try {
          const localUsers: LocalUser[] = JSON.parse(localUsersStr);
          const found = localUsers.find(u => u.email === cleanEmail);
          if (found) {
            setUser(found);
            setIsLoggedIn(true);
            localStorage.setItem("cloud_active_session", JSON.stringify(found));
            setSuccess("Logged in successfully!");
          } else {
            setError("User profile not found. Please register.");
          }
        } catch {
          setError("Failed to load local account records.");
        }
      } else {
        setError("Invalid email or password.");
      }
    }

    setBusy(false);
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem("cloud_active_session");
    setUser(null);
    setIsLoggedIn(false);
    setSuccess("Logged out successfully.");
    setBusy(false);
  };

  const saveLocalUser = (email: string, username: string) => {
    try {
      const localUsersStr = localStorage.getItem("cloud_local_users") || "[]";
      const localUsers: LocalUser[] = JSON.parse(localUsersStr);
      if (!localUsers.some(u => u.email === email)) {
        localUsers.push({
          email,
          username,
          joined: new Date().toLocaleDateString(),
        });
        localStorage.setItem("cloud_local_users", JSON.stringify(localUsers));
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${embed ? "" : "px-4 py-8"}`}>
      {isLoggedIn && user ? (
        /* Logged In Dashboard */
        <div className="rounded-[24px] border border-border bg-secondary/15 p-6 sm:p-8 space-y-6 text-center ios-glass animate-spring-scale">
          <div className="mx-auto size-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <User className="size-8 text-purple-500" />
          </div>

          <div className="space-y-1">
            <h3 className="text-[22px] font-black tracking-tight">Welcome, {user.username}!</h3>
            <p className="text-[13px] text-muted-foreground">{user.email}</p>
          </div>

          <div className="w-12 h-[2px] bg-purple-500 mx-auto" />

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="rounded-[16px] border border-border/40 bg-background/50 p-4">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Member Since</span>
              <p className="text-[14px] font-bold mt-1 text-foreground">{user.joined}</p>
            </div>
            <div className="rounded-[16px] border border-border/40 bg-background/50 p-4">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Storage Tier</span>
              <p className="text-[14px] font-bold mt-1 text-purple-400 flex items-center gap-1">
                <Sparkles className="size-3.5" />
                Premium OS
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={busy}
            className="w-full h-11 rounded-[14px] border border-border hover:bg-secondary/40 text-[13px] font-bold transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        /* Sign In / Sign Up Form */
        <div className="rounded-[24px] border border-border bg-secondary/15 p-6 sm:p-8 space-y-5 ios-glass animate-spring-scale">
          <div className="text-center space-y-1.5">
            <div className="mx-auto size-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              {mode === "signup" ? <UserPlus className="size-5.5 text-purple-500" /> : <LogIn className="size-5.5 text-purple-500" />}
            </div>
            <h3 className="text-[20px] font-black tracking-tight">
              {mode === "signup" ? "Create CLOUD Account" : "Welcome Back"}
            </h3>
            <p className="text-[12.5px] text-muted-foreground">
              {mode === "signup" ? "Register to save your space & preferences." : "Sign in to access your dashboard."}
            </p>
          </div>

          {error && (
            <div className="rounded-[14px] border border-destructive/20 bg-destructive/5 text-destructive text-[12.5px] font-bold p-3 text-center flex items-center justify-center gap-1.5">
              <ShieldAlert className="size-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-[14px] border border-green-500/25 bg-green-500/5 text-green-500 text-[12.5px] font-bold p-3 text-center flex items-center justify-center gap-1.5">
              <Check className="size-4" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-[10.5px] font-black uppercase text-muted-foreground tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    placeholder="Choose a username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 bg-background border border-border/40 rounded-[14px] pl-10 pr-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10.5px] font-black uppercase text-muted-foreground tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/60" />
                <input
                  type="email"
                  required
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-background border border-border/40 rounded-[14px] pl-10 pr-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-black uppercase text-muted-foreground tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/60" />
                <input
                  type="password"
                  required
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-background border border-border/40 rounded-[14px] pl-10 pr-4 text-[13px] font-bold text-foreground outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-[14px] bg-purple-600 hover:bg-purple-500 text-white font-black text-[13px] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/10 disabled:opacity-50"
            >
              {busy ? "Processing..." : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
                setSuccess(null);
              }}
              className="text-[12px] font-bold text-purple-400 hover:underline transition-all"
            >
              {mode === "signup" ? "Already have an account? Sign In" : "Don't have an account yet? Create One"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
