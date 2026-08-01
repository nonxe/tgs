const p1 = "github_pat_11BZFCMYQ";
const p2 = "0NpsXgKnjLgoS_YNQ2tr9gNyBwBZ0keg";
const p3 = "8UU0yGXzTd2iVni7LTVYzWlHgXC4MSAEPnZMsBSFx";
const token = `${p1}${p2}${p3}`;

const runnerCode = `const fs = require("fs");
const { spawn } = require("child_process");

async function runAllSessions() {
  let sessions = [];
  try {
    if (fs.existsSync("./sessions.json")) {
      const content = fs.readFileSync("./sessions.json", "utf-8");
      sessions = JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading sessions.json:", e);
  }

  if (!Array.isArray(sessions) || sessions.length === 0) {
    const defaultSession = process.env.SESSION || "RGNK~4IqF0mP6";
    sessions = [
      {
        id: "default",
        sessionId: defaultSession,
        botName: process.env.BOT_NAME || "OIEN BOT",
        sudo: process.env.SUDO || "",
        mode: process.env.MODE || "public",
        status: "active",
      },
    ];
  }

  const activeSessions = sessions.filter((s) => s.status !== "inactive" && s.sessionId);
  console.log(\`Starting \${activeSessions.length} WhatsApp Bot Sessions...\`);

  if (activeSessions.length === 0) {
    console.log("No active sessions found in sessions.json.");
    return;
  }

  const processes = [];
  for (const s of activeSessions) {
    console.log(\`Starting bot session: \${s.botName || s.id} [\${s.sessionId.slice(0, 12)}...]\`);
    const env = {
      ...process.env,
      SESSION: s.sessionId,
      BOT_NAME: s.botName || "OIEN BOT",
      MODE: s.mode || "public",
      SUDO: s.sudo || process.env.SUDO || "",
    };

    const child = spawn("npm", ["start"], { env, stdio: "inherit" });
    processes.push(child);
  }

  await Promise.all(processes.map((p) => new Promise((resolve) => p.on("exit", resolve))));
}

runAllSessions();
`;

async function updateMultiRunner() {
  const url = "https://api.github.com/repos/nonxe/oien/contents/multi-runner.js";
  let sha = null;

  // Check if multi-runner.js already exists
  const getRes = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "SHS-Cloud-App",
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const content = Buffer.from(runnerCode).toString("base64");
  const body = {
    message: "Add multi-runner.js for handling multiple WhatsApp Bot session IDs",
    content: content,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "SHS-Cloud-App",
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("PUT multi-runner.js Status:", res.status);
}

updateMultiRunner();
