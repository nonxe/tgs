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

// Convert File/Blob to standard Blob to ensure correct multipart boundary serialization
async function uploadToBackend(file: any, retention: string): Promise<string> {
  const filename = file.name || "upload";
  const fileType = file.type || "application/octet-stream";
  
  // Read file data into ArrayBuffer and wrap in a clean Blob
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: fileType });

  // If retention is permanent (or fallback), try Catbox first.
  if (retention !== "72h") {
    try {
      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", blob, filename);
      
      const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: fd,
      });
      const text = (await res.text()).trim();
      if (res.ok && text.startsWith("http")) {
        const name = text.split("/").pop();
        if (name) return name;
      }
    } catch {
      /* fall through */
    }
  }

  // Attempt 2 (or primary if 72h): 72h fallback (litterbox, same filename scheme).
  const fd = new FormData();
  fd.append("reqtype", "fileupload");
  fd.append("time", "72h");
  fd.append("fileToUpload", blob, filename);
  
  const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
    method: "POST",
    body: fd,
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
          const retention = incoming.get("retention")?.toString() || "permanent";

          if (!file || typeof (file as any).arrayBuffer !== "function") {
            return Response.json(
              { success: false, error: "No file provided" },
              { status: 400, headers: CORS },
            );
          }

          const filename = await uploadToBackend(file, retention);
          const maskedUrl = `${getOrigin(request)}/${filename}`;

          return Response.json(
            {
              success: true,
              url: maskedUrl,
              filename,
              size: (file as any).size,
              type: (file as any).type,
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