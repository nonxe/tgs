import { createFileRoute } from "@tanstack/react-router";

const FILE_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

function safeFilename(filename: string) {
  return /^[\w.-]+$/.test(filename);
}

async function streamFile(filename: string, method: "GET" | "HEAD") {
  if (!filename || !safeFilename(filename)) {
    return new Response("Invalid file", { status: 400, headers: FILE_CORS });
  }

  const upstream = await fetch(`https://files.catbox.moe/${filename}`, { method });
  if (!upstream.ok || (method === "GET" && !upstream.body)) {
    return new Response("Not found", { status: 404, headers: FILE_CORS });
  }

  const headers = new Headers(FILE_CORS);
  const contentType = upstream.headers.get("content-type");
  const contentLength = upstream.headers.get("content-length");
  const acceptRanges = upstream.headers.get("accept-ranges");
  const contentRange = upstream.headers.get("content-range");

  if (contentType) headers.set("Content-Type", contentType);
  if (contentLength) headers.set("Content-Length", contentLength);
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
  if (contentRange) headers.set("Content-Range", contentRange);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Disposition", `inline; filename="${filename.replaceAll('"', "")}"`);

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

// User-facing share URL: /f/{unique-id}.{ext}
// This proxies the provider file through this domain, so the browser stays on this URL.
export const Route = createFileRoute("/f/$filename")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: FILE_CORS }),
      HEAD: async ({ params }) => streamFile(params.filename, "HEAD"),
      GET: async ({ params }) => streamFile(params.filename, "GET"),
    },
  },
});