import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

async function handleUpload(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ success: false, error: "No file provided." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const filename = file.name || "upload";
    const fileType = file.type || "application/octet-stream";
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: fileType });

    // Forward file to Catbox API (Permanent)
    const catboxFormData = new FormData();
    catboxFormData.append("reqtype", "fileupload");
    catboxFormData.append("fileToUpload", blob, filename);

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: catboxFormData,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      throw new Error(`Catbox returned error: ${res.statusText}`);
    }

    const fileUrl = await res.text();
    
    if (!fileUrl.startsWith("http")) {
      throw new Error(`Invalid response from Catbox: ${fileUrl}`);
    }

    return new Response(JSON.stringify({ success: true, url: fileUrl.trim() }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || "Upload failed." }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/messages/upload")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => handleUpload(request),
    },
  },
});
