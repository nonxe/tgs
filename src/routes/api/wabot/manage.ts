import {
  fetchWabotSessions,
  saveWabotSession,
  deleteWabotSession,
  triggerWorkflowDispatch,
  fetchWorkflowRuns,
} from "../../../lib/github-wabot";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export async function GET() {
  try {
    const [{ sessions }, runs] = await Promise.all([
      fetchWabotSessions(),
      fetchWorkflowRuns(),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        sessions,
        runs,
        totalActive: sessions.filter((s) => s.status === "active").length,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to fetch wabot sessions." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { action, session, id, sessionId, botName, sudo, mode, status, addedBy } = body;

    // Action: Save / Add Session
    if (action === "save_session" || action === "add_session") {
      const dataToSave = session || {
        id,
        sessionId,
        botName: botName || "OIEN BOT",
        sudo,
        mode: mode || "public",
        status: status || "active",
        addedBy: addedBy || "anonymous",
      };

      if (!dataToSave.sessionId) {
        return new Response(
          JSON.stringify({ success: false, error: "WhatsApp Session ID is required." }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const res = await saveWabotSession(dataToSave);
      return new Response(JSON.stringify(res), {
        status: res.success ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    // Action: Delete Session
    if (action === "delete_session") {
      const targetId = id || sessionId;
      if (!targetId) {
        return new Response(
          JSON.stringify({ success: false, error: "Session ID required for deletion." }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const ok = await deleteWabotSession(targetId);
      return new Response(JSON.stringify({ success: ok }), {
        status: ok ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    // Action: Trigger GitHub Action Workflow Dispatch
    if (action === "trigger_workflow" || action === "restart_bot") {
      const res = await triggerWorkflowDispatch();
      return new Response(JSON.stringify(res), {
        status: res.success ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action." }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Server error." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
