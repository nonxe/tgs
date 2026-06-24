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

          // Mask the source: only expose our own /f/{id}.{ext} path.
          const filename = data.url.split("/").pop() ?? "";
          if (!filename || !/^[\w.-]+$/.test(filename)) {
            return Response.json(
              { success: false, error: "Invalid upload URL" },
              { status: 502, headers: CORS },
            );
          }

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