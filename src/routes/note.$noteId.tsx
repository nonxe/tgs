import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Copy,
  Calendar,
  User
} from "lucide-react";

interface TelegraphNode {
  tag?: string;
  attrs?: Record<string, string>;
  children?: (string | TelegraphNode)[];
}

interface TelegraphPage {
  path: string;
  url: string;
  title: string;
  description: string;
  author_name?: string;
  views: number;
  content?: (string | TelegraphNode)[];
}

export const Route = createFileRoute("/note/$noteId")({
  loader: async ({ params }) => {
    try {
      const res = await fetch(`https://api.telegra.ph/getPage/${params.noteId}?return_content=true`);
      const data = await res.json();
      if (data.ok && data.result) {
        return { note: data.result as TelegraphPage };
      }
      throw new Error(data.error || "Note not found");
    } catch {
      throw new Error("Note not found or connection failed");
    }
  },
  component: ViewNotePage,
  errorComponent: ({ error }) => (
    <section className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-[32px] font-black tracking-tight text-destructive">Note not found</h1>
        <p className="text-[15px] text-muted-foreground">
          The note you're trying to read doesn't exist, was deleted, or the link is incorrect.
        </p>
        <div className="pt-2">
          <Link
            to="/note"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground text-background px-6 font-bold text-[14px] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Create New Note
          </Link>
        </div>
      </div>
    </section>
  ),
});

function ViewNotePage() {
  const { note } = useLoaderData({ from: "/note/$noteId" });
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderNodes = (nodes: (string | TelegraphNode)[] | undefined): React.ReactNode => {
    if (!nodes) return null;
    return nodes.map((node, i) => {
      if (typeof node === "string") {
        return node;
      }
      const tag = node.tag || "p";
      
      if (tag === "p") {
        return (
          <p key={i} className="mb-4 text-[17px] leading-[1.7] text-foreground/90">
            {renderNodes(node.children)}
          </p>
        );
      }

      if (tag === "b" || tag === "strong") {
        return <strong key={i} className="font-bold text-foreground">{renderNodes(node.children)}</strong>;
      }

      if (tag === "i" || tag === "em") {
        return <em key={i} className="italic text-foreground/80">{renderNodes(node.children)}</em>;
      }

      if (tag === "br") {
        return <br key={i} />;
      }

      // Fallback renderer
      const Tag = tag as keyof JSX.IntrinsicElements;
      try {
        return (
          <Tag key={i}>
            {renderNodes(node.children)}
          </Tag>
        );
      } catch {
        return <span key={i}>{renderNodes(node.children)}</span>;
      }
    });
  };

  return (
    <article className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full space-y-6 animate-slide-up">
      {/* Sub Header / Action */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/note"
          className="h-10 px-4 rounded-full border border-border/70 hover:bg-secondary flex items-center gap-1.5 font-bold text-[13px] active:scale-95 transition-all select-none"
        >
          <ArrowLeft className="size-4" />
          <span>All Notes</span>
        </Link>

        <button
          onClick={copyUrl}
          className="h-10 px-4 rounded-full border border-border/70 hover:bg-secondary flex items-center gap-1.5 font-bold text-[13px] active:scale-95 transition-all select-none"
        >
          <Copy className="size-4" />
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      {/* Title */}
      <h1 className="text-[34px] md:text-[44px] font-black tracking-tight leading-[1.1] select-none text-foreground pt-4">
        {note.title}
      </h1>

      {/* Meta details */}
      <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground border-y border-border/30 py-3.5 select-none">
        <div className="flex items-center gap-1.5">
          <User className="size-4 opacity-60" />
          <span>{note.author_name || "Anonymous"}</span>
        </div>
        <div className="size-1 rounded-full bg-border" />
        <div className="flex items-center gap-1.5">
          <Calendar className="size-4 opacity-60" />
          <span>Published on Telegraph</span>
        </div>
      </div>

      {/* Note Body */}
      <div className="pt-2 text-foreground/95 select-text font-serif">
        {renderNodes(note.content)}
      </div>

      {/* Footer Actions */}
      <div className="pt-10 border-t border-border/20 flex justify-center">
        <Link
          to="/note"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-6 font-bold text-[14px] hover:scale-[1.02] active:scale-[0.98] transition-all gap-1.5"
        >
          <Plus className="size-4" />
          <span>Create New Note</span>
        </Link>
      </div>
    </article>
  );
}
