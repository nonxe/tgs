import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json; charset=utf-8",
};

async function handleLyricsSearch(request: Request) {
  try {
    const reqUrl = new URL(request.url);
    let song = reqUrl.searchParams.get("song") || reqUrl.searchParams.get("q") || "";

    if (request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        if (body.song || body.q) song = body.song || body.q;
      } catch {}
    }

    if (!song || !song.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Please enter a song title or artist name." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const apiUrl = `https://apis.davidcyril.name.ng/lyrics3?song=${encodeURIComponent(song.trim())}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Upstream lyrics service error (${apiRes.status})` }),
        { status: apiRes.status, headers: CORS_HEADERS }
      );
    }

    const data = await apiRes.json();

    if (!data || !data.result || !data.result.lyrics) {
      return new Response(
        JSON.stringify({ success: false, error: `No lyrics found for '${song}'. Please check the song name.` }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Capitalize song title cleanly
    const rawSong = data.result.song || song;
    const formattedSong = rawSong.charAt(0).toUpperCase() + rawSong.slice(1);
    const rawArtist = data.result.artist && data.result.artist !== "Unknown" ? data.result.artist : "";

    return new Response(
      JSON.stringify({
        success: true,
        creator: "AS CLOUD SYSTEM",
        result: {
          song: formattedSong,
          artist: rawArtist || "Music Track",
          lyrics: data.result.lyrics,
        },
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to fetch song lyrics." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export const Route = createFileRoute("/api/lyrics/search")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => handleLyricsSearch(request),
      POST: async ({ request }) => handleLyricsSearch(request),
    },
  },
});
