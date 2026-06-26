import { createFileRoute } from "@tanstack/react-router";

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

  const upstream = await fetch(`https://files.catbox.moe/${filename}`, {
    method,
    headers: upstreamHeaders,
  });

  if (!upstream.ok && upstream.status !== 206) {
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

// Public masked file URL: /{filename}.{ext} — proxies the upstream provider.
export const Route = createFileRoute("/$filename")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: FILE_CORS }),
      HEAD: async ({ params, request }) => streamFile(params.filename, "HEAD", request),
      GET: async ({ params, request }) => streamFile(params.filename, "GET", request),
    },
  },
});