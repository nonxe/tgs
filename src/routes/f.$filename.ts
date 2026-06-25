import { createFileRoute } from "@tanstack/react-router";

const FILE_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

const UPLOAD_BUCKET = "file-uploads";

function safeFilename(filename: string) {
  return /^[A-Za-z0-9_-]{8,40}(\.[A-Za-z0-9]{1,12})?$/.test(filename);
}

async function streamFile(filename: string, method: "GET" | "HEAD", request: Request) {
  if (!filename || !safeFilename(filename)) {
    return new Response("Invalid file", { status: 400, headers: FILE_CORS });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("file_links" as never)
    .select("source_url, original_name, content_type" as never)
    .eq("slug" as never, filename as never)
    .maybeSingle();

  if (error || !data) {
    return new Response("Not found", { status: 404, headers: FILE_CORS });
  }

  const fileLink = data as unknown as {
    source_url: string;
    original_name: string | null;
    content_type: string | null;
  };
  let sourceUrl = fileLink.source_url;

  if (sourceUrl.startsWith("lovable-storage://")) {
    const path = sourceUrl.slice(`lovable-storage://${UPLOAD_BUCKET}/`.length);
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(UPLOAD_BUCKET)
      .createSignedUrl(path, 60);

    if (signedError || !signed?.signedUrl) {
      return new Response("Not found", { status: 404, headers: FILE_CORS });
    }

    sourceUrl = signed.signedUrl;
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("Range");
  if (range) upstreamHeaders.set("Range", range);

  const upstream = await fetch(sourceUrl, { method, headers: upstreamHeaders });
  if (!upstream.ok || (method === "GET" && !upstream.body)) {
    return new Response("Not found", { status: 404, headers: FILE_CORS });
  }

  const headers = new Headers(FILE_CORS);
  const contentType = upstream.headers.get("content-type");
  const contentLength = upstream.headers.get("content-length");
  const acceptRanges = upstream.headers.get("accept-ranges");
  const contentRange = upstream.headers.get("content-range");

  if (fileLink.content_type) headers.set("Content-Type", fileLink.content_type);
  else if (contentType) headers.set("Content-Type", contentType);
  if (contentLength) headers.set("Content-Length", contentLength);
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
  if (contentRange) headers.set("Content-Range", contentRange);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set(
    "Content-Disposition",
    `inline; filename="${(fileLink.original_name || filename).replaceAll('"', "")}"`,
  );

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
      HEAD: async ({ params, request }) => streamFile(params.filename, "HEAD", request),
      GET: async ({ params, request }) => streamFile(params.filename, "GET", request),
    },
  },
});