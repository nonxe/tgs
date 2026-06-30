import { createFileRoute } from "@tanstack/react-router";

const DB_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Origin",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};

const CHARS_63 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
const CHARS_62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const encodeSlug = (slug: string): string => {
  let val = 1n; // Sentinel
  for (let i = 0; i < slug.length; i++) {
    const idx = BigInt(CHARS_63.indexOf(slug[i]));
    val = val * 63n + idx;
  }
  
  let res = "";
  while (val > 0n) {
    const rem = val % 62n;
    res = CHARS_62[Number(rem)] + res;
    val = val / 62n;
  }
  return res;
};

async function handleCreateDb(request: Request) {
  try {
    const body = await request.json() as any;
    const title = body.title?.toString() || "ssDB Node";
    const url = body.url?.toString() || "";
    const dataPayload = body.data;

    if (dataPayload === undefined || dataPayload === null) {
      return new Response(JSON.stringify({ success: false, error: "Missing 'data' field in body" }), {
        status: 400,
        headers: DB_CORS,
      });
    }

    const payloadString = typeof dataPayload === "object" ? JSON.stringify(dataPayload) : dataPayload.toString();

    // Construct content nodes. 
    // H1 stores the Title
    // H2 stores the URL (if provided)
    // All other text is stored as P nodes
    const nodes: any[] = [
      {
        tag: "h1",
        children: [title]
      }
    ];

    if (url) {
      nodes.push({
        tag: "h2",
        children: [url]
      });
    }

    nodes.push(...payloadString.split("\n").map(line => ({
      tag: "p",
      children: [line || " "]
    })));

    const token = "b968da50dcdb253c9e04a36e35ac26f5619621f6a13d1a52c3c4314c13a0";

    const formData = new URLSearchParams();
    formData.append("access_token", token);
    formData.append("title", "n"); // Short fixed title for short code path
    formData.append("content", JSON.stringify(nodes));

    const response = await fetch("https://api.telegra.ph/createPage", {
      method: "POST",
      body: formData,
    });

    const tgData = await response.json();
    if (tgData.ok && tgData.result?.path) {
      const shortCode = encodeSlug(tgData.result.path);
      
      // Get request origin to return full link
      const origin = request.headers.get("origin") || new URL(request.url).origin;

      return new Response(JSON.stringify({
        success: true,
        key: shortCode,
        url: `${origin}/db/${shortCode}`
      }), {
        status: 200,
        headers: DB_CORS,
      });
    } else {
      throw new Error(tgData.error || "Telegra.ph rejected page creation");
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Failed to create node" }), {
      status: 500,
      headers: DB_CORS,
    });
  }
}

export const Route = createFileRoute("/db/create")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: DB_CORS }),
      POST: async ({ request }) => handleCreateDb(request),
    },
  },
});
