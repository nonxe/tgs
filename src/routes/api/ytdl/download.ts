import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json; charset=utf-8",
};

async function handleYtDownload(request: Request) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "YouTube URL parameter is required." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const apiUrl = `https://apis.davidcyril.name.ng/download/ytmp4?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Upstream API error (${response.status}). Check YouTube URL.`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to download YouTube video." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export const Route = createFileRoute("/api/ytdl/download")({
  server: {
    handlers: {
      GET: ({ request }) => handleYtDownload(request),
    },
  },
});
