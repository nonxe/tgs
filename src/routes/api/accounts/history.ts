import { createFileRoute } from "@tanstack/react-router";
import { addHistoryEntry, getUserHistory } from "../../../lib/github-history";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json; charset=utf-8",
};

async function handleSaveHistory(request: Request) {
  try {
    const { userId, action, detail } = (await request.json()) as {
      userId?: string;
      action?: string;
      detail?: string;
    };

    if (!userId || !action) {
      return new Response(JSON.stringify({ success: false, error: "userId and action required." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const result = await addHistoryEntry(userId, action, detail || "");

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Failed to save history." }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

async function handleGetHistory(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "userId query param required." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const entries = await getUserHistory(userId);

    return new Response(JSON.stringify({ success: true, history: entries }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Failed to fetch history." }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export const Route = createFileRoute("/api/accounts/history")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => handleSaveHistory(request),
      GET: async ({ request }) => handleGetHistory(request),
    },
  },
});
