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

const UPLOAD_BUCKET = "file-uploads";

function extensionFrom(file: File) {
  const fromName = file.name.match(/\.([A-Za-z0-9]{1,12})$/)?.[1];
  if (fromName) return fromName.toLowerCase();
  return "bin";
}

function makeSlug(ext: string) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `${id}.${ext}`;
}

async function saveMapping(input: {
  file: File;
  originalName: string;
  contentType: string;
  fileSize: number;
  ext: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug(input.ext);
    const { error: uploadError } = await supabaseAdmin.storage
      .from(UPLOAD_BUCKET)
      .upload(slug, input.file, {
        contentType: input.contentType,
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes("already exists")) continue;
      throw uploadError;
    }

    const { error } = await supabaseAdmin.from("file_links" as never).insert({
      slug,
      source_url: `lovable-storage://${UPLOAD_BUCKET}/${slug}`,
      original_name: input.originalName,
      content_type: input.contentType,
      file_size: input.fileSize,
    } as never);

    if (!error) return slug;
    await supabaseAdmin.storage.from(UPLOAD_BUCKET).remove([slug]);
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

          const ext = extensionFrom(file);
          const filename = await saveMapping({
            file,
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