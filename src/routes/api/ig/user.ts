const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Content-Type": "application/json; charset=utf-8",
};

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#064;/g, "@")
    .replace(/&#x2022;/g, "•")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function parseFollowerCount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, "").trim();
  const match = cleaned.match(/^([\d.]+)\s*([MKmk]?)$/);
  if (!match) return parseInt(cleaned, 10) || 0;
  const num = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();
  if (suffix === "M") return Math.round(num * 1000000);
  if (suffix === "K") return Math.round(num * 1000);
  return Math.round(num);
}

async function handleGetIgUser(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const username = urlObj.searchParams
      .get("username")
      ?.trim()
      .replace(/^@/, "")
      .replace(/https?:\/\/(www\.)?instagram\.com\//i, "")
      .split("/")[0]
      .split("?")[0];

    if (!username) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'username' query parameter." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Fetch profile page HTML from Instagram to extract OG meta tags
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Dest": "document",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Instagram returned an error. The account may not exist or may be private." }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const html = await res.text();

    // Extract OG meta tags
    const titleMatch = html.match(/og:title[^>]*content="([^"]*)"/);
    const descMatch = html.match(/og:description[^>]*content="([^"]*)"/);
    const imgMatch = html.match(/og:image[^>]*content="([^"]*)"/);

    if (!titleMatch || !descMatch) {
      if (html.includes("Login") && html.includes("sign up")) {
        return new Response(
          JSON.stringify({ success: false, error: "Instagram requires login to view this profile. The account may be private." }),
          { status: 403, headers: CORS_HEADERS }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "Could not parse Instagram profile. The username may be incorrect." }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const rawTitle = decodeHtmlEntities(titleMatch[1]);
    const rawDesc = decodeHtmlEntities(descMatch[1]);
    const rawImg = decodeHtmlEntities(imgMatch?.[1] || "");

    // Parse title: "Full Name (@username) • Instagram photos and videos"
    const nameMatch = rawTitle.match(/^(.+?)\s*\(@/);
    const fullName = nameMatch ? nameMatch[1].trim() : username;

    // Parse description: "671M Followers, 647 Following, 4,103 Posts - See Instagram photos and videos from Full Name (@username)"
    const followersMatch = rawDesc.match(/([\d,.]+[MKmk]?)\s*Followers/i);
    const followingMatch = rawDesc.match(/([\d,.]+[MKmk]?)\s*Following/i);
    const postsMatch = rawDesc.match(/([\d,.]+[MKmk]?)\s*Posts/i);

    // Extract bio: everything after "from Name (@user)"
    let bio = "";
    const bioMatch = rawDesc.match(/Posts\s*-\s*(?:See Instagram photos and videos from .+?\(@\w+\)\s*)?(.*)$/i);
    if (!bioMatch) {
      const altBioMatch = rawDesc.match(/Posts\s*-\s*(.*)/i);
      bio = altBioMatch ? altBioMatch[1].trim() : "";
    } else {
      bio = bioMatch[1].trim();
    }

    // Get higher resolution avatar
    let avatarUrl = rawImg;
    if (avatarUrl.includes("s100x100")) {
      avatarUrl = avatarUrl.replace("s100x100", "s320x320");
    } else if (avatarUrl.includes("s150x150")) {
      avatarUrl = avatarUrl.replace("s150x150", "s320x320");
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          name: fullName,
          username: username,
          avatar_url: avatarUrl,
          bio: bio,
          followers: parseFollowerCount(followersMatch?.[1] || "0"),
          following: parseFollowerCount(followingMatch?.[1] || "0"),
          posts: parseFollowerCount(postsMatch?.[1] || "0"),
        },
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ig/user")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => handleGetIgUser(request),
    },
  },
});
