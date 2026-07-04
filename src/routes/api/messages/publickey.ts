import { createFileRoute } from "@tanstack/react-router";
import { connectToDatabase } from "../../../lib/mongodb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json; charset=utf-8",
};

async function handleGetPublicKey(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const username = urlObj.searchParams.get("username")?.trim().toLowerCase();

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "Missing username parameter." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("e2ee_users").findOne({ username });

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "User not found." }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      publicKey: user.publicKey,
      encryptedPrivateKey: user.encryptedPrivateKey, // Also return this so they can download and decrypt it locally during login!
      salt: user.salt,
      pfpUrl: user.pfpUrl
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Failed to fetch user info." }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export const Route = createFileRoute("/api/messages/publickey")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => handleGetPublicKey(request),
    },
  },
});
