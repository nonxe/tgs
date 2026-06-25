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

function extensionFrom(file: File, upstreamUrl: string) {
  const fromName = file.name.match(/\.([A-Za-z0-9]{1,12})$/)?.[1];
  if (fromName) return fromName.toLowerCase();

  const pathname = new URL(upstreamUrl).pathname;
  const fromUrl = pathname.match(/\.([A-Za-z0-9]{1,12})$/)?.[1];
  return fromUrl?.toLowerCase() ?? "bin";
}

function makeSlug(ext: string) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `${id}.${ext}`;
}

async function saveMapping(input: {
  sourceUrl: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  ext: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug(input.ext);
    const { error } = await supabaseAdmin.from("file_links" as never).insert({
      slug,
      source_url: input.sourceUrl,
      original_name: input.originalName,
      content_type: input.contentType,
      file_size: input.fileSize,
    } as never);

    if (!error) return slug;
    if (error.code !== "23505") throw error;
  }

  throw new Error("Could not create unique link");
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

          const forward = new FormData();
          forward.append("file", file, file.name || "upload");

          const upstream = await fetch(
            "https://apis.davidcyril.name.ng/uploader/catbox",
            { method: "POST", body: forward },
          );

          if (!upstream.ok) {
            return Response.json(
              { success: false, error: "Upstream upload failed" },
              { status: 502, headers: CORS },
            );
          }

          const data = (await upstream.json()) as {
            success?: boolean;
            url?: string;
          };
          if (!data?.success || !data.url) {
            return Response.json(
              { success: false, error: "Upload rejected" },
              { status: 502, headers: CORS },
            );
          }

          let sourceUrl: URL;
          try {
            sourceUrl = new URL(data.url);
          } catch {
            return Response.json(
              { success: false, error: "Invalid upload URL" },
              { status: 502, headers: CORS },
            );
          }

          if (!/^https?:$/.test(sourceUrl.protocol)) {
            return Response.json(
              { success: false, error: "Invalid upload URL" },
              { status: 502, headers: CORS },
            );
          }

          const ext = extensionFrom(file, data.url);
          const filename = await saveMapping({
            sourceUrl: data.url,
            originalName: file.name || "upload",
            contentType: file.type || "application/octet-stream",
            fileSize: file.size,
            ext,
          });
          const maskedUrl = `${getOrigin(request)}/f/${filename}`;

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