import { createFileRoute } from "@tanstack/react-router";
import { lookupLink, incrementClicks } from "../lib/github-links";

const FILE_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

// Filename must look like "name.ext" — no slashes, must contain a dot.
const FILENAME_RE = /^[A-Za-z0-9_-]{1,64}\.[A-Za-z0-9]{1,12}$/;

async function streamFile(filename: string, method: "GET" | "HEAD", request: Request) {
  if (!filename || !FILENAME_RE.test(filename)) {
    return new Response("Not found", { status: 404, headers: FILE_CORS });
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("Range");
  if (range) upstreamHeaders.set("Range", range);

  // Try permanent host first, then the 72h fallback host.
  const hosts = ["https://files.catbox.moe", "https://litter.catbox.moe"];
  let upstream: Response | null = null;
  for (const host of hosts) {
    const r = await fetch(`${host}/${filename}`, { method, headers: upstreamHeaders });
    if (r.ok || r.status === 206) {
      upstream = r;
      break;
    }
  }
  if (!upstream) {
    return new Response("Not found", { status: 404, headers: FILE_CORS });
  }

  const headers = new Headers(FILE_CORS);
  const passthrough = ["content-type", "content-length", "accept-ranges", "content-range", "last-modified", "etag"];
  for (const h of passthrough) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Disposition", `inline; filename="${filename}"`);

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

async function handleRequest(filename: string, method: "GET" | "HEAD", request: Request) {
  // If it looks like a file (has a dot + extension), proxy it
  if (FILENAME_RE.test(filename)) {
    return streamFile(filename, method, request);
  }

  // Otherwise, try to look up as a short link redirect
  const slug = filename.trim().toLowerCase();
  if (slug && /^[a-zA-Z0-9_-]{2,48}$/.test(slug)) {
    try {
      const link = await lookupLink(slug);
      if (link) {
        // Fire-and-forget click increment
        incrementClicks(slug).catch(() => {});
        
        // Build a simple redirect HTML page with a brief animation
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=${link.url}">
  <title>Redirecting...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      min-height: 100vh; display: flex; align-items: center; justify-content: center; 
      background: #0a0a0a; color: #fff; font-family: -apple-system, system-ui, sans-serif;
    }
    .wrap { text-align: center; animation: fadeIn 0.3s ease; }
    .spinner { width: 28px; height: 28px; border: 3px solid #333; border-top-color: #a855f7;
      border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 16px; }
    p { font-size: 13px; color: #888; }
    a { color: #a855f7; text-decoration: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="spinner"></div>
    <p>Redirecting to <a href="${link.url}">${link.url.length > 50 ? link.url.slice(0, 50) + '...' : link.url}</a></p>
  </div>
  <script>window.location.href="${link.url}";</script>
</body>
</html>`;
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...FILE_CORS },
        });
      }
    } catch {}
  }

  return new Response("Not found", { status: 404, headers: FILE_CORS });
}

// Public masked file URL: /{filename}.{ext} — proxies the upstream provider.
// Also handles short link redirects for slugs without dots.
export const Route = createFileRoute("/$filename")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: FILE_CORS }),
      HEAD: async ({ params, request }) => handleRequest(params.filename, "HEAD", request),
      GET: async ({ params, request }) => handleRequest(params.filename, "GET", request),
    },
  },
});