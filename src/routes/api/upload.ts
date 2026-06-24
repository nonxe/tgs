import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/upload")({
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

          // Extract just the filename (e.g. "abc123.jpg") and mask the source.
          const filename = data.url.split("/").pop() ?? "";
          const origin = new URL(request.url).origin;
          const maskedUrl = `${origin}/f/${filename}`;

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