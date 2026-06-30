import { createFileRoute } from "@tanstack/react-router";

const DB_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Origin",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};

const CHARS_63 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
const CHARS_62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function decodeSlug(code: string): string {
  let val = 0n;
  for (let i = 0; i < code.length; i++) {
    const idx = BigInt(CHARS_62.indexOf(code[i]));
    val = val * 62n + idx;
  }
  
  let res = "";
  while (val > 1n) { // Stop at sentinel
    const rem = val % 63n;
    res = CHARS_63[Number(rem)] + res;
    val = val / 63n;
  }
  return res;
}

function extractText(nodes: any[]): string {
  if (!nodes) return "";
  let text = "";
  for (const node of nodes) {
    if (node.tag === "h1") continue; // Skip title header
    if (typeof node === "string") {
      text += node + "\n";
    } else if (node.children) {
      text += extractChildrenText(node.children) + "\n";
    }
  }
  return text.trim();
}

function extractChildrenText(children: any[]): string {
  let text = "";
  for (const child of children) {
    if (typeof child === "string") {
      text += child;
    } else if (child.children) {
      text += extractChildrenText(child.children);
    }
  }
  return text;
}

async function fetchDbValue(id: string) {
  try {
    // If it contains a hyphen, it's a legacy clear-text path slug. Otherwise, it's an encoded short code.
    const targetPath = id.includes("-") ? id : decodeSlug(id);
    
    const res = await fetch(`https://api.telegra.ph/getPage/${targetPath}?return_content=true`);
    const data = await res.json();
    
    if (!data.ok || !data.result) {
      return new Response(JSON.stringify({ success: false, error: "Database key not found" }), {
        status: 404,
        headers: DB_CORS,
      });
    }

    const title = data.result.title === "n" ? "Untitled" : data.result.title;
    const rawContent = extractText(data.result.content || []);

    let parsedContent: any;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch {
      parsedContent = rawContent;
    }

    const responseBody = {
      success: true,
      key: id,
      title: title,
      views: data.result.views,
      data: parsedContent,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: DB_CORS,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Failed to fetch database value" }), {
      status: 500,
      headers: DB_CORS,
    });
  }
}

export const Route = createFileRoute("/db/$id")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: DB_CORS }),
      GET: async ({ params }) => fetchDbValue(params.id),
    },
  },
});
