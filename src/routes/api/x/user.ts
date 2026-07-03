import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json; charset=utf-8",
};

async function handleGetUser(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const username = urlObj.searchParams.get("username")?.trim().replace(/^@/, "");

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "Missing 'username' query parameter." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Call fxtwitter API under the hood
    const res = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(username)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 (CLOUD X Client)",
      },
    });

    const data = await res.json();
    if (res.ok && data.code === 200 && data.user) {
      return new Response(JSON.stringify({ success: true, user: data.user }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: data.message || "User not found or account is private." }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Internal server error." }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export const Route = createFileRoute("/api/x/user")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => handleGetUser(request),
    },
  },
});
