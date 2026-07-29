import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ShieldAlert, Lock } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CLOUD • Link & Notes" },
      { name: "description", content: "Secure file link sharing and anonymous note publisher in a premium dark glassmorphism interface." },
      { name: "author", content: "CLOUD" },
      { property: "og:title", content: "CLOUD • Link & Notes" },
      { property: "og:description", content: "Secure file link sharing and anonymous note publisher in a premium dark glassmorphism interface." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@CLOUD" },
      { name: "twitter:title", content: "CLOUD • Link & Notes" },
      { name: "twitter:description", content: "Secure file link sharing and anonymous note publisher in a premium dark glassmorphism interface." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bec9b761-6ea2-41f8-90fa-3c341da2d776/id-preview-a191bd27--2dbc0f29-ae8a-48ff-8283-4c7fde919a6d.lovable.app-1782300157388.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bec9b761-6ea2-41f8-90fa-3c341da2d776/id-preview-a191bd27--2dbc0f29-ae8a-48ff-8283-4c7fde919a6d.lovable.app-1782300157388.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme');
                const isDark = saved ? saved === 'dark' : true;
                if (!isDark) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Site-Wide IP Authorization Gatekeeper
function SecurityGatekeeper({ children }: { children: ReactNode }) {
  const [isAuthorised, setIsAuthorised] = useState<boolean | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const auth = localStorage.getItem("cloud_ip_authorised");
      if (auth === "true") {
        setIsAuthorised(true);
      } else {
        setIsAuthorised(false);
      }
    } catch {
      setIsAuthorised(false);
    }
  }, []);

  const handleClickText = () => {
    if (isAuthorised) return;
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 10) {
      setShowModal(true);
    }
  };

  const handleVerifyPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput.trim() === "as1234567") {
      try {
        localStorage.setItem("cloud_ip_authorised", "true");
      } catch {}
      setIsAuthorised(true);
      setShowModal(false);
      setErrorMsg("");
    } else {
      setErrorMsg("INVALID PASSKEY. ACCESS DENIED.");
      setPasskeyInput("");
      setClickCount(0);
      setShowModal(false);
    }
  };

  // Checking initial local cache state
  if (isAuthorised === null) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  // If authorized, render children
  if (isAuthorised) {
    return <>{children}</>;
  }

  // Full-screen Unauthorized Overlay Screen
  return (
    <div className="fixed inset-0 z-[99999] bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden">
      {/* Dark Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Main Warning Card */}
      <div 
        onClick={handleClickText}
        className="max-w-md w-full bg-slate-900/80 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-2xl cursor-pointer hover:border-red-500/50 transition-all active:scale-[0.99] relative overflow-hidden"
      >
        {/* Top Warning Icon */}
        <div className="size-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-500/10 animate-pulse">
          <ShieldAlert className="size-10" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-1 rounded-full">
            SYSTEM ACCESS RESTRICTED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-2">
            YOUR IP IS NOT AUTHORISED
          </h1>
          <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
            Security policy enforced. Your current IP address is not recognized by the edge firewall grid.
          </p>
        </div>

        {/* Secret Click Counter Feedback */}
        {clickCount > 0 && clickCount < 10 && (
          <div className="pt-2 text-[11px] font-mono text-red-400/80 animate-pulse">
            Verifying node signature... ({clickCount}/10 clicks)
          </div>
        )}

        <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-slate-500">
          NODE_ID: SHS_EDGE_NODE_09 • SEC_ERR_403
        </div>
      </div>

      {/* Error Toast Feedback */}
      {errorMsg && (
        <div className="mt-4 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold px-4 py-2 rounded-xl shadow-lg animate-bounce">
          {errorMsg}
        </div>
      )}

      {/* Passkey Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <form 
            onSubmit={handleVerifyPasskey}
            className="max-w-sm w-full bg-slate-900 border border-white/20 rounded-3xl p-6 space-y-5 shadow-2xl animate-spring-scale"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="size-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-none">ENTER PASSKEY</h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Authorization Credentials Required</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter Authorization Passkey..."
                autoFocus
                className="w-full h-12 bg-slate-950 border border-white/15 rounded-2xl px-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setClickCount(0);
                }}
                className="flex-1 h-11 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                Authorize
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SecurityGatekeeper>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </SecurityGatekeeper>
    </QueryClientProvider>
  );
}
