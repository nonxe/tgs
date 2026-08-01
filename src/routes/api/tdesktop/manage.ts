import { fetchTDesktopData, saveTDesktopData, TDesktopUserSession } from "../../../lib/github-aslink-telegram";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { action, session, userId, botToken, chatId, text } = body;

    // Action: Send Real Telegram Message via Telegram Bot API
    if (action === "send_telegram_bot") {
      if (!botToken || !chatId || !text) {
        return new Response(
          JSON.stringify({ success: false, error: "botToken, chatId, and text are required." }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const tgRes = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        }),
      });

      const tgData = await tgRes.json();
      return new Response(JSON.stringify({ success: tgRes.ok, telegram: tgData }), {
        status: tgRes.ok ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    // Action: Save session to nonxe/aslink
    if (action === "save" && session) {
      const ok = await saveTDesktopData(session);
      return new Response(JSON.stringify({ success: ok }), {
        status: ok ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action." }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Server error." }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "userId required." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const session = await fetchTDesktopData(userId);
    return new Response(JSON.stringify({ success: true, session }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Server error." }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
