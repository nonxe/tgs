import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  "Access-Control-Max-Age": "86400",
};

function getOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

// Forward File directly to upstream provider to avoid loading whole buffers into server memory
async function uploadToBackend(file: any, retention: string): Promise<string> {
  const filename = file.name || "upload";

  // If retention is permanent (or fallback), try Catbox first.
  if (retention !== "72h") {
    try {
      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", file, filename);
      
      const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: fd,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
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
  fd.append("fileToUpload", file, filename);
  
  const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
    method: "POST",
    body: fd,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
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
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const action = url.searchParams.get("action");

          if (action === "getSignedUrl") {
            const filename = url.searchParams.get("filename") || "upload";
            const ext = filename.split(".").pop() || "bin";
            // Create unique slug
            const randomId = Math.random().toString(36).substring(2, 15);
            const slug = `${randomId}.${ext}`;

            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data, error } = await supabaseAdmin.storage
              .from("file-uploads")
              .createSignedUploadUrl(slug);

            if (error || !data) {
              return Response.json(
                { success: false, error: error?.message || "Failed to create signed URL" },
                { status: 500, headers: CORS }
              );
            }

            return Response.json(
              {
                success: true,
                signedUrl: data.signedUrl,
                slug,
              },
              { headers: CORS }
            );
          }

          return Response.json({ success: false, error: "Invalid action" }, { status: 400, headers: CORS });
        } catch (err) {
          return Response.json(
            { success: false, error: (err as Error).message },
            { status: 500, headers: CORS }
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const supabaseUrl = url.searchParams.get("supabaseUrl");
          const slug = url.searchParams.get("slug");
          const retention = url.searchParams.get("retention") || "permanent";

          if (supabaseUrl && slug) {
            // 1. Download file from Supabase Storage
            const fileRes = await fetch(supabaseUrl);
            if (!fileRes.ok) {
              return Response.json(
                { success: false, error: `Failed to download file from temporary storage (${fileRes.status})` },
                { status: 502, headers: CORS }
              );
            }

            const blob = await fileRes.blob();

            // 2. Upload to Catbox permanently
            const filename = await uploadToBackend(blob, retention);
            const maskedUrl = `${getOrigin(request)}/${filename}`;

            // 3. Delete temporary file from Supabase Storage in the background
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              await supabaseAdmin.storage.from("file-uploads").remove([slug]);
            } catch (delErr) {
              console.error("Failed to delete temp file from Supabase storage:", delErr);
            }

            return Response.json(
              {
                success: true,
                url: maskedUrl,
                filename,
                size: blob.size,
                type: blob.type,
              },
              { headers: CORS }
            );
          }

          // Otherwise, regular multipart formData upload
          const incoming = await request.formData();
          const file = incoming.get("file");

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