import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Type,
  Square,
  Circle,
  MoveRight,
  Minus,
  Code,
  Download,
  Trash2,
  Undo,
  Redo,
  Save,
  FolderOpen,
  Sparkles,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Layers,
  Palette,
  Eye,
  Plus,
  X,
} from "lucide-react";
import { WhiteboardElement, WhiteboardBoard } from "../lib/github-whiteboard";

const PRESET_COLORS = [
  "#ffffff", // White
  "#38bdf8", // Sky blue / Cyan
  "#34d399", // Emerald
  "#fb7185", // Rose
  "#c084fc", // Purple
  "#fbbf24", // Amber
  "#94a3b8", // Slate
  "#1e293b", // Dark Slate (Eraser look)
];

function WhiteboardPage() {
  const [tool, setTool] = useState<"pen" | "eraser" | "text" | "rect" | "circle" | "line" | "arrow" | "code">("pen");
  const [color, setColor] = useState("#38bdf8");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [undoStack, setUndoStack] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  // Current drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Text input overlay state
  const [activeTextInput, setActiveTextInput] = useState<{ x: number; y: number; text: string; isCode?: boolean } | null>(null);

  // Board metadata & cloud save
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState("Untitled Whiteboard");
  const [savedBoards, setSavedBoards] = useState<WhiteboardBoard[]>([]);
  const [showBoardsModal, setShowBoardsModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [userAccount, setUserAccount] = useState<{ id: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (stored) {
        setUserAccount(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Push history state
  const saveState = useCallback(() => {
    setUndoStack((prev) => [...prev, [...elements]]);
    setRedoStack([]);
  }, [elements]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, [...elements]]);
    setElements(previous);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, [...elements]]);
    setElements(next);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  // Redraw Canvas Elements
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render stored elements
    elements.forEach((el) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.type === "pen" || el.type === "eraser") {
        if (el.type === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = el.strokeWidth * 4;
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        if (el.points && el.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      } else if (el.type === "text" || el.type === "code") {
        if (el.text && el.x !== undefined && el.y !== undefined) {
          ctx.font = el.type === "code" 
            ? `bold ${el.fontSize || 14}px monospace`
            : `${el.fontSize || 16}px system-ui, sans-serif`;
          
          const lines = el.text.split("\n");
          const lineHeight = (el.fontSize || 16) * 1.3;

          if (el.type === "code") {
            // Draw background box for code snippet
            const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.strokeStyle = el.color;
            ctx.lineWidth = 1;
            ctx.fillRect(el.x - 8, el.y - 18, maxLineWidth + 20, lines.length * lineHeight + 12);
            ctx.strokeRect(el.x - 8, el.y - 18, maxLineWidth + 20, lines.length * lineHeight + 12);
            ctx.fillStyle = el.color;
          }

          lines.forEach((l, i) => {
            ctx.fillText(l, el.x!, el.y! + i * lineHeight);
          });
        }
      } else if (el.type === "rect" && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        ctx.beginPath();
        ctx.rect(el.x, el.y, el.width, el.height);
        ctx.stroke();
      } else if (el.type === "circle" && el.x !== undefined && el.y !== undefined && el.width) {
        ctx.beginPath();
        const radius = Math.abs(el.width) / 2;
        const centerX = el.x + el.width / 2;
        const centerY = el.y + (el.height || el.width) / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === "line" && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.stroke();
      } else if (el.type === "arrow" && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
        const fromX = el.x;
        const fromY = el.y;
        const toX = el.x + el.width;
        const toY = el.y + el.height;
        const headlen = 12;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(toX, toY);
        ctx.fillStyle = el.color;
        ctx.fill();
      }
    });

    // Draw active in-progress shape
    if (isDrawing && startPos) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = strokeWidth;

      if (tool === "pen" && currentPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
      } else if (tool === "eraser" && currentPoints.length > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = strokeWidth * 4;
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
    }
  }, [elements, isDrawing, currentPoints, startPos, tool, color, strokeWidth]);

  // Resize canvas to fill container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [elements, drawCanvas]);

  // Get pointer coordinates relative to canvas
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasCoords(e);

    if (tool === "text" || tool === "code") {
      setActiveTextInput({ x: pos.x, y: pos.y, text: "", isCode: tool === "code" });
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPoints([pos]);
    saveState();
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);
    setCurrentPoints((prev) => [...prev, pos]);
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPos) return;
    const endPos = getCanvasCoords(e);
    setIsDrawing(false);

    const newElId = "el_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    if (tool === "pen" || tool === "eraser") {
      if (currentPoints.length > 0) {
        setElements((prev) => [
          ...prev,
          {
            id: newElId,
            type: tool,
            points: currentPoints,
            color,
            strokeWidth,
          },
        ]);
      }
    } else if (tool === "rect") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "rect",
          x: Math.min(startPos.x, endPos.x),
          y: Math.min(startPos.y, endPos.y),
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          color,
          strokeWidth,
        },
      ]);
    } else if (tool === "circle") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "circle",
          x: Math.min(startPos.x, endPos.x),
          y: Math.min(startPos.y, endPos.y),
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          color,
          strokeWidth,
        },
      ]);
    } else if (tool === "line") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "line",
          x: startPos.x,
          y: startPos.y,
          width: endPos.x - startPos.x,
          height: endPos.y - startPos.y,
          color,
          strokeWidth,
        },
      ]);
    } else if (tool === "arrow") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "arrow",
          x: startPos.x,
          y: startPos.y,
          width: endPos.x - startPos.x,
          height: endPos.y - startPos.y,
          color,
          strokeWidth,
        },
      ]);
    }

    setStartPos(null);
    setCurrentPoints([]);
  };

  const commitTextInput = () => {
    if (!activeTextInput || !activeTextInput.text.trim()) {
      setActiveTextInput(null);
      return;
    }
    saveState();
    setElements((prev) => [
      ...prev,
      {
        id: "el_" + Date.now(),
        type: activeTextInput.isCode ? "code" : "text",
        x: activeTextInput.x,
        y: activeTextInput.y,
        text: activeTextInput.text,
        color,
        strokeWidth: 2,
        fontSize,
      },
    ]);
    setActiveTextInput(null);
  };

  // Cloud Save to nonxe/database
  const handleSaveToCloud = async () => {
    const ownerId = userAccount?.id || "guest_" + Math.random().toString(36).substring(2, 6);
    setSaving(true);
    try {
      const res = await fetch("/api/whiteboard/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          board: {
            id: boardId || undefined,
            title: boardTitle.trim() || "Untitled Whiteboard",
            ownerId,
            ownerName: userAccount?.id || "Anonymous",
            codeData: {
              elements,
              background: "#090d16",
              grid: true,
            },
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.board) {
        setBoardId(data.board.id);
        showToast(`Whiteboard '${data.board.title}' saved to nonxe/database!`);
      } else {
        showToast(data.error || "Failed to save whiteboard.", "error");
      }
    } catch (err: any) {
      showToast("Cloud save error: " + err.message, "error");
    }
    setSaving(false);
  };

  // Fetch Saved Boards from Cloud
  const handleFetchBoards = async () => {
    setLoadingBoards(true);
    setShowBoardsModal(true);
    try {
      const ownerId = userAccount?.id || "guest";
      const res = await fetch(`/api/whiteboard/manage?ownerId=${encodeURIComponent(ownerId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.boards)) {
        setSavedBoards(data.boards);
      }
    } catch {}
    setLoadingBoards(false);
  };

  // Load a Saved Board
  const loadBoard = (b: WhiteboardBoard) => {
    saveState();
    setBoardId(b.id);
    setBoardTitle(b.title);
    if (b.codeData && Array.isArray(b.codeData.elements)) {
      setElements(b.codeData.elements);
    }
    setShowBoardsModal(false);
    showToast(`Loaded whiteboard '${b.title}'`);
  };

  // Delete Saved Board
  const handleDeleteBoard = async (bId: string) => {
    if (!userAccount?.id) return;
    try {
      const res = await fetch("/api/whiteboard/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", boardId: bId, ownerId: userAccount.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedBoards((prev) => prev.filter((b) => b.id !== bId));
        if (boardId === bId) setBoardId(null);
        showToast("Deleted whiteboard.");
      }
    } catch {}
  };

  // Export PNG Image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${boardTitle.toLowerCase().replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Downloaded whiteboard PNG image!");
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-foreground font-sans flex flex-col relative overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-border/30 bg-[#090d16]/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="size-9 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft className="size-4" />
          </a>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <input
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                className="bg-transparent text-sm font-black text-foreground outline-none border-b border-transparent hover:border-border/40 focus:border-cyan-500 transition-all w-48 sm:w-64"
                placeholder="Whiteboard Title..."
              />
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
                <span>Code-backed Canvas</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">nonxe/database</span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodeModal(true)}
            className="px-3 py-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5"
            title="View Raw Code Data"
          >
            <Code className="size-3.5 text-cyan-400" />
            <span className="hidden sm:inline">View Code</span>
          </button>
          <button
            onClick={handleFetchBoards}
            className="px-3 py-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FolderOpen className="size-3.5 text-sky-400" />
            <span className="hidden sm:inline">My Boards</span>
          </button>
          <button
            onClick={exportImage}
            className="px-3 py-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="size-3.5 text-emerald-400" />
            <span className="hidden sm:inline">PNG</span>
          </button>
          <button
            onClick={handleSaveToCloud}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            <span>{saving ? "Saving..." : "Save to Cloud"}</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 relative bg-[#070b14] overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 block touch-none"
        />

        {/* Text Input Overlay */}
        {activeTextInput && (
          <div
            style={{ left: activeTextInput.x, top: activeTextInput.y }}
            className="absolute z-20 -translate-y-4"
          >
            <textarea
              autoFocus
              value={activeTextInput.text}
              onChange={(e) => setActiveTextInput({ ...activeTextInput, text: e.target.value })}
              onBlur={commitTextInput}
              placeholder={activeTextInput.isCode ? "// Type code snippet..." : "Type text here..."}
              style={{ color, fontSize: activeTextInput.isCode ? 14 : fontSize }}
              className={`p-2 rounded-xl border bg-slate-950/90 shadow-2xl outline-none min-w-[200px] min-h-[60px] ${
                activeTextInput.isCode
                  ? "font-mono border-cyan-500/50 text-cyan-300"
                  : "font-sans border-purple-500/50 text-foreground"
              }`}
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                onClick={commitTextInput}
                className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-[11px] font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Floating Tools Toolbar (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#090d16]/95 border border-cyan-500/30 ios-glass shadow-2xl max-w-[95vw] overflow-x-auto scrollbar-none">
          {/* Tool Switchers */}
          <div className="flex items-center gap-1 pr-2 border-r border-border/30">
            <button
              onClick={() => setTool("pen")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "pen" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Freehand Pen Tool"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "eraser" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Eraser Tool"
            >
              <Eraser className="size-4" />
            </button>
            <button
              onClick={() => setTool("text")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "text" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Type Text Note"
            >
              <Type className="size-4" />
            </button>
            <button
              onClick={() => setTool("code")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "code" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Insert Code Snippet"
            >
              <Code className="size-4" />
            </button>
            <button
              onClick={() => setTool("rect")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "rect" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rectangle Shape"
            >
              <Square className="size-4" />
            </button>
            <button
              onClick={() => setTool("circle")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "circle" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Circle Shape"
            >
              <Circle className="size-4" />
            </button>
            <button
              onClick={() => setTool("arrow")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "arrow" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Arrow Line"
            >
              <MoveRight className="size-4" />
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 px-2 border-r border-border/30">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`size-6 rounded-full border transition-all ${
                  color === c ? "border-white scale-110 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/50" : "border-white/20 opacity-70 hover:opacity-100"
                }`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-6 rounded-full bg-transparent border-0 cursor-pointer p-0"
              title="Custom Color"
            />
          </div>

          {/* Stroke Width Slider */}
          <div className="flex items-center gap-2 px-2 border-r border-border/30">
            <span className="text-[10px] font-mono text-muted-foreground font-bold">{strokeWidth}px</span>
            <input
              type="range"
              min="1"
              max="24"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              title="Undo"
            >
              <Undo className="size-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              title="Redo"
            >
              <Redo className="size-4" />
            </button>
            <button
              onClick={() => {
                if (elements.length > 0) {
                  saveState();
                  setElements([]);
                  showToast("Cleared canvas.");
                }
              }}
              className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              title="Clear Canvas"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-xl animate-spring-scale ${
            toastMsg.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/20 border-red-500/40 text-red-300"
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Saved Boards Modal */}
      {showBoardsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#090d16] border border-cyan-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FolderOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Saved Cloud Whiteboards</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">Stored in nonxe/database repo</p>
                </div>
              </div>
              <button
                onClick={() => setShowBoardsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin">
              {loadingBoards ? (
                <div className="py-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-cyan-400" />
                  <span>Fetching boards from nonxe/database...</span>
                </div>
              ) : savedBoards.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs font-semibold">
                  No saved whiteboards found. Click "Save to Cloud" to store your first canvas!
                </div>
              ) : (
                savedBoards.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-secondary/10 border border-border/30 hover:border-cyan-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadBoard(b)}>
                      <h4 className="text-xs font-black text-foreground truncate">{b.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {b.id} • {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => loadBoard(b)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/30 transition-all"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteBoard(b.id)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-red-400 transition-all"
                        title="Delete Board"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw Code / JSON Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#090d16] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div className="flex items-center gap-2">
                <Code className="size-5 text-cyan-400" />
                <h3 className="text-base font-black text-foreground">Whiteboard Code Data (JSON)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({ elements }, null, 2));
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
                <button onClick={() => setShowCodeModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <pre className="max-h-96 overflow-y-auto p-4 rounded-2xl bg-black/80 border border-border/40 text-emerald-400 font-mono text-[11.5px] scrollbar-thin select-text">
              {JSON.stringify({ title: boardTitle, ownerId: userAccount?.id || "guest", elements }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}

export const Route = createFileRoute("/whiteboard")({
  component: WhiteboardPage,
  head: () => ({
    meta: [
      { title: "Cloud Whiteboard • Code Canvas" },
      { name: "description", content: "Interactive freehand drawing, typing, and diagram canvas backed by code storage in nonxe/database." },
    ],
  }),
});
