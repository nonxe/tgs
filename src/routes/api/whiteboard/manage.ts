import { createFileRoute } from "@tanstack/react-router";
import { fetchWhiteboards, saveWhiteboard, deleteWhiteboard } from "../../../lib/github-whiteboard";

function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export const Route = createFileRoute("/api/whiteboard/manage")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const ownerId = url.searchParams.get("ownerId");
          const { boards } = await fetchWhiteboards();

          let result = boards;
          if (ownerId) {
            result = boards.filter((b) => b.ownerId === ownerId || b.isPublic);
          }

          return new Response(JSON.stringify({ success: true, boards: result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { action, board, boardId, ownerId } = body as any;
          const clientIp = getClientIp(request);

          if (action === "save") {
            if (!board || !board.title || !board.ownerId || !board.codeData) {
              return new Response(JSON.stringify({ success: false, error: "Missing required whiteboard fields." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }
            const res = await saveWhiteboard(board, clientIp);
            return new Response(JSON.stringify(res), {
              status: res.success ? 200 : 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (action === "delete") {
            if (!boardId || !ownerId) {
              return new Response(JSON.stringify({ success: false, error: "boardId and ownerId required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }
            const res = await deleteWhiteboard(boardId, ownerId, clientIp);
            return new Response(JSON.stringify(res), {
              status: res.success ? 200 : 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: false, error: "Invalid action." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
