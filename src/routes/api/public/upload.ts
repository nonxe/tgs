import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

function getOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

// We forward to an upstream cloud and just keep the returned filename.
// Permanent host first; falls back to a 72h host if the permanent one
// rejects the request (some egress IPs are blocked by the permanent host).
async function uploadToBackend(file: File): Promise<string> {
  const filename = file.name || "upload";

  // Attempt 1: permanent host (catbox).
  try {
    const fd = new FormData();
    fd.append("reqtype", "fileupload");
    fd.append("fileToUpload", file, filename);
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: fd,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const text = (await res.text()).trim();
    if (res.ok && text.startsWith("http")) {
      const name = text.split("/").pop();
      if (name) return name;
    }
  } catch {
    /* fall through */
  }

  // Attempt 2: 72h fallback (litterbox, same filename scheme).
  const fd = new FormData();
  fd.append("reqtype", "fileupload");
  fd.append("time", "72h");
  fd.append("fileToUpload", file, filename);
  const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
    method: "POST",
    body: fd,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const text = (await res.text()).trim();
  if (!res.ok || !text.startsWith("http")) {
    throw new Error(text || `Upload failed (${res.status})`);
  }
  const name = text.split("/").pop();
  if (!name) throw new Error("Bad upstream response");
  return name;
}

export const Route = createFileRoute("/api/public/upload")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const incoming = await request.formData();
          const file = incoming.get("file");
          if (!(file instanceof File)) {
            return Response.json(
              { success: false, error: "No file provided" },
              { status: 400, headers: CORS },
            );
          }

          const filename = await uploadToBackend(file);
          const maskedUrl = `${getOrigin(request)}/${filename}`;

          return Response.json(
            {
              success: true,
              url: maskedUrl,
              filename,
              size: file.size,
              type: file.type,
            },
            { headers: CORS },
          );
        } catch (err) {
          return Response.json(
            { success: false, error: (err as Error).message },
            { status: 500, headers: CORS },
          );
        }
      },
    },
  },
});