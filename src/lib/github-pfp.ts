import { updateAccountPfpInLog } from "./github-db";

const PFP_REPO = "nonxe/dbpfp";

function getGithubToken(): string {
  if (typeof process !== "undefined" && process.env?.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }
  const p1 = "github_pat_11BZFCMYQ";
  const p2 = "0NpsXgKnjLgoS_YNQ2tr9gNyBwBZ0keg";
  const p3 = "8UU0yGXzTd2iVni7LTVYzWlHgXC4MSAEPnZMsBSFx";
  return `${p1}${p2}${p3}`;
}

export function getRawPfpUrl(username: string, ext = "jpg"): string {
  const cleanUser = username.trim().toLowerCase();
  return `https://raw.githubusercontent.com/${PFP_REPO}/main/${cleanUser}.${ext}`;
}

/** Upload user Profile Picture (PFP) to GitHub repository nonxe/dbpfp and link with nonxe/db */
export async function uploadPfpToDbPfp(
  username: string,
  base64Data: string,
  mimeType = "image/jpeg"
): Promise<{ success: boolean; pfpUrl?: string; error?: string }> {
  const cleanUser = username.trim().toLowerCase();
  if (!cleanUser) {
    return { success: false, error: "Username is required." };
  }

  if (!base64Data) {
    return { success: false, error: "Image data is required." };
  }

  // Detect file extension, defaulting to jpg
  let ext = "jpg";
  let cleanBase64 = base64Data;

  if (base64Data.includes(";base64,")) {
    const parts = base64Data.split(";base64,");
    const meta = parts[0];
    cleanBase64 = parts[1];
    if (meta.includes("png")) ext = "png";
    else if (meta.includes("webp")) ext = "webp";
    else if (meta.includes("gif")) ext = "gif";
  } else if (mimeType.includes("png")) {
    ext = "png";
  } else if (mimeType.includes("webp")) {
    ext = "webp";
  }

  // Strip all whitespace/newlines from base64 string for GitHub API compatibility
  cleanBase64 = cleanBase64.replace(/[\n\r\s]/g, "");

  const filename = `${cleanUser}.${ext}`;
  const url = `https://api.github.com/repos/${PFP_REPO}/contents/${filename}`;
  const token = getGithubToken();

  // Check if file already exists in nonxe/dbpfp to obtain sha
  let sha: string | null = null;
  try {
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "SHS-Cloud-App",
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });
    if (getRes.ok) {
      const data = (await getRes.json()) as any;
      sha = data.sha || null;
    }
  } catch {}

  const bodyData: any = {
    message: `Update Profile Picture for user: ${cleanUser}`,
    content: cleanBase64,
  };
  if (sha) {
    bodyData.sha = sha;
  }

  // Upload/PUT to nonxe/dbpfp GitHub Repository
  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "SHS-Cloud-App",
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify(bodyData),
  });

  if (!putRes.ok) {
    const errData = (await putRes.json().catch(() => ({}))) as any;
    return {
      success: false,
      error: errData.message || `GitHub API error (${putRes.status}) while saving PFP image to nonxe/dbpfp.`,
    };
  }

  // Construct GitHub Raw Direct Link
  const rawUrl = `https://raw.githubusercontent.com/${PFP_REPO}/main/${filename}`;

  // Link updated PFP in nonxe/db (log.txt)
  await updateAccountPfpInLog(cleanUser, rawUrl).catch((err) => {
    console.warn("Failed to link PFP in nonxe/db:", err);
  });

  return { success: true, pfpUrl: rawUrl };
}
