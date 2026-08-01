import {
  createOrUpdateHostedSite,
  fetchAllHostedSites,
  getHostedSiteBySlug,
  deleteHostedSite,
  parseGithubRepoUrl,
} from "../../../lib/github-aslink";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "0.0.0.0";

    const { action, repoUrl, slug, branch, entryPath, title, description, createdBy, siteId, ownerId } = body;

    if (action === "delete") {
      if (!siteId) {
        return new Response(JSON.stringify({ success: false, error: "siteId required for deletion." }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }
      const ok = await deleteHostedSite(siteId, ownerId || createdBy || "anonymous");
      return new Response(JSON.stringify({ success: ok }), {
        status: ok ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    // Default action: Create/Deploy Static Site
    if (!repoUrl) {
      return new Response(JSON.stringify({ success: false, error: "Public GitHub repository URL is required." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const parsed = parseGithubRepoUrl(repoUrl);
    if (!parsed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid GitHub URL format. Example: https://github.com/HassanXTech/LetMeSketch",
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Test GitHub repo branch & entry file (non-blocking fallback)
    const testBranch = (branch || "main").trim();
    const testPath = (entryPath || "index.html").trim().replace(/^\//, "");
    let finalBranch = testBranch;

    try {
      const testUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${testBranch}/${testPath}`;
      const checkRes = await fetch(testUrl, { method: "GET", headers: { Range: "bytes=0-100" } });

      if (!checkRes.ok && testBranch === "main") {
        const fallbackUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/master/${testPath}`;
        const fallbackRes = await fetch(fallbackUrl, { method: "GET", headers: { Range: "bytes=0-100" } });
        if (fallbackRes.ok) {
          finalBranch = "master";
        }
      }
    } catch {}

    const result = await createOrUpdateHostedSite({
      repoUrl,
      slug,
      branch: finalBranch,
      entryPath: testPath,
      title,
      description,
      createdBy: createdBy || "anonymous",
      clientIp,
    });

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
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
    const slug = url.searchParams.get("slug");
    const createdBy = url.searchParams.get("createdBy");

    if (slug) {
      const site = await getHostedSiteBySlug(slug);
      return new Response(JSON.stringify({ success: !!site, site }), {
        status: site ? 200 : 404,
        headers: CORS_HEADERS,
      });
    }

    const { sites } = await fetchAllHostedSites();

    let resultSites = sites;
    if (createdBy) {
      resultSites = sites.filter((s) => s.createdBy === createdBy || createdBy === "all");
    }

    return new Response(JSON.stringify({ success: true, sites: resultSites }), {
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
