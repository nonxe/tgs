import { createFileRoute } from "@tanstack/react-router";

// Public file proxy. URL: /api/public/f/{id}.{ext}
// Streams the file from the underlying provider so the source host stays hidden.
export const Route = createFileRoute("/api/public/f/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const filename = params.filename;
        if (!filename || !/^[\w.-]+$/.test(filename)) {
          return new Response("Invalid file", { status: 400 });
        }

        const upstream = await fetch(`https://files.catbox.moe/${filename}`);
        if (!upstream.ok || !upstream.body) {
          return new Response("Not found", { status: 404 });
        }

        const headers = new Headers();
        const ct = upstream.headers.get("content-type");
        const cl = upstream.headers.get("content-length");
        if (ct) headers.set("Content-Type", ct);
        if (cl) headers.set("Content-Length", cl);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Content-Disposition", `inline; filename="${filename}"`);
        headers.set("Access-Control-Allow-Origin", "*");

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});