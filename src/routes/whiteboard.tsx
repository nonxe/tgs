import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import rough from "roughjs";
import { getStroke } from "perfect-freehand";
import {
  Pencil,
  Eraser,
  Type,
  Square,
  Circle,
  MoveRight,
  Minus,
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
  Palette,
  X,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Gem,
  Code,
  Image as ImageIcon,
  Sliders,
  Sun,
  Moon,
} from "lucide-react";
import { WhiteboardElement, WhiteboardBoard } from "../lib/github-whiteboard";

// Preset Color Palettes (Theme Aware)
const STROKE_COLORS = [
  "#ffffff", // White
  "#e0e7ff", // Soft Slate
  "#f43f5e", // Rose
  "#38bdf8", // Cyan / Sky
  "#34d399", // Emerald
  "#a855f7", // Purple
  "#fbbf24", // Amber
  "#000000", // Dark
];

const FILL_COLORS = [
  "transparent",
  "rgba(244, 63, 94, 0.2)",
  "rgba(56, 189, 248, 0.2)",
  "rgba(52, 211, 153, 0.2)",
  "rgba(168, 85, 247, 0.2)",
  "rgba(251, 191, 36, 0.2)",
];

// Rough.js Fill Styles
const FILL_STYLES: Array<"hachure" | "solid" | "zigzag" | "cross-hatch" | "dots"> = [
  "hachure",
  "solid",
  "zigzag",
  "cross-hatch",
  "dots",
];

// Extended Element Interface for LetMeSketch
export interface SketchElement {
  id: string;
  type: "pen" | "eraser" | "text" | "rect" | "circle" | "line" | "arrow" | "diamond" | "image";
  points?: Array<[number, number, number?]>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  fillColor?: string;
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots";
  strokeWidth: number;
  roughness: number; // 0 = clean, 1 = hand-drawn, 2 = cartoon
  fontSize?: number;
  src?: string; // For images
}

function LetMeSketchPage() {
  // Active Tool: select, pan, pen, eraser, text, rect, diamond, circle, arrow, line, image
  const [tool, setTool] = useState<
    "select" | "pan" | "pen" | "eraser" | "text" | "rect" | "diamond" | "circle" | "arrow" | "line" | "image"
  >("pen");

  // Style Settings
  const [strokeColor, setStrokeColor] = useState("#38bdf8");
  const [fillColor, setFillColor] = useState("transparent");
  const [fillStyle, setFillStyle] = useState<"hachure" | "solid" | "zigzag" | "cross-hatch" | "dots">("hachure");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [roughness, setRoughness] = useState(1); // 1 = Hand-drawn Excalidraw style
  const [fontSize, setFontSize] = useState(18);
  const [gridType, setGridType] = useState<"dots" | "mesh" | "none">("dots");

  // Canvas State & History
  const [elements, setElements] = useState<SketchElement[]>([]);
  const [undoStack, setUndoStack] = useState<SketchElement[][]>([]);
  const [redoStack, setRedoStack] = useState<SketchElement[][]>([]);

  // Selection & Drag State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan & Zoom
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Array<[number, number, number]>>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Active Text / Image Input Overlay
  const [activeTextInput, setActiveTextInput] = useState<{ x: number; y: number; text: string } | null>(null);

  // Board Metadata & Cloud Save
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState("LetMeSketch Board");
  const [savedBoards, setSavedBoards] = useState<WhiteboardBoard[]>([]);
  const [showBoardsModal, setShowBoardsModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [rawJsonCode, setRawJsonCode] = useState("");
  const [userAccount, setUserAccount] = useState<{ id: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cloud_user_account");
      if (stored) setUserAccount(JSON.parse(stored));
    } catch {}
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

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

  // Convert perfect-freehand stroke points into SVG Path data string
  const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return "";
    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        return `${acc} ${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
      },
      `M ${stroke[0][0]},${stroke[0][1]} Q`
    );
    return `${d} Z`;
  };

  // Main LetMeSketch Render Loop using Rough.js + Perfect-Freehand
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rc = rough.canvas(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // ── Grid Background ──
    if (gridType === "dots") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      const dotSpacing = 28;
      const startX = Math.floor(-panOffset.x / zoom / dotSpacing) * dotSpacing - dotSpacing;
      const endX = startX + canvas.width / zoom + dotSpacing * 2;
      const startY = Math.floor(-panOffset.y / zoom / dotSpacing) * dotSpacing - dotSpacing;
      const endY = startY + canvas.height / zoom + dotSpacing * 2;

      for (let x = startX; x < endX; x += dotSpacing) {
        for (let y = startY; y < endY; y += dotSpacing) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    } else if (gridType === "mesh") {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 32;
      const startX = Math.floor(-panOffset.x / zoom / gridSize) * gridSize - gridSize;
      const endX = startX + canvas.width / zoom + gridSize * 2;
      const startY = Math.floor(-panOffset.y / zoom / gridSize) * gridSize - gridSize;
      const endY = startY + canvas.height / zoom + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    // ── Render Elements using Rough.js & Perfect-Freehand ──
    elements.forEach((el) => {
      if (el.type === "pen" || el.type === "eraser") {
        if (el.points && el.points.length > 0) {
          const stroke = getStroke(el.points, {
            size: el.strokeWidth * 4,
            thinning: 0.6,
            smoothing: 0.5,
            streamline: 0.55,
          });
          const pathData = getSvgPathFromStroke(stroke);
          const p = new Path2D(pathData);

          if (el.type === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "#000000";
            ctx.fill(p);
            ctx.globalCompositeOperation = "source-over";
          } else {
            ctx.fillStyle = el.color;
            ctx.fill(p);
          }
        }
      } else if (el.type === "rect" && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        rc.rectangle(el.x, el.y, el.width, el.height, {
          stroke: el.color,
          fill: el.fillColor !== "transparent" ? el.fillColor : undefined,
          fillStyle: el.fillStyle || "hachure",
          strokeWidth: el.strokeWidth,
          roughness: el.roughness,
        });
      } else if (el.type === "diamond" && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const top: [number, number] = [cx, el.y];
        const right: [number, number] = [el.x + el.width, cy];
        const bottom: [number, number] = [cx, el.y + el.height];
        const left: [number, number] = [el.x, cy];

        rc.polygon([top, right, bottom, left], {
          stroke: el.color,
          fill: el.fillColor !== "transparent" ? el.fillColor : undefined,
          fillStyle: el.fillStyle || "hachure",
          strokeWidth: el.strokeWidth,
          roughness: el.roughness,
        });
      } else if (el.type === "circle" && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        rc.ellipse(cx, cy, Math.abs(el.width), Math.abs(el.height), {
          stroke: el.color,
          fill: el.fillColor !== "transparent" ? el.fillColor : undefined,
          fillStyle: el.fillStyle || "hachure",
          strokeWidth: el.strokeWidth,
          roughness: el.roughness,
        });
      } else if (el.type === "line" && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
        rc.line(el.x, el.y, el.x + el.width, el.y + el.height, {
          stroke: el.color,
          strokeWidth: el.strokeWidth,
          roughness: el.roughness,
        });
      } else if (el.type === "arrow" && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
        const x1 = el.x;
        const y1 = el.y;
        const x2 = el.x + el.width;
        const y2 = el.y + el.height;
        rc.line(x1, y1, x2, y2, {
          stroke: el.color,
          strokeWidth: el.strokeWidth,
          roughness: el.roughness,
        });

        // Hand-drawn arrow head lines
        const headlen = 16;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowP1: [number, number] = [
          x2 - headlen * Math.cos(angle - Math.PI / 6),
          y2 - headlen * Math.sin(angle - Math.PI / 6),
        ];
        const arrowP2: [number, number] = [
          x2 - headlen * Math.cos(angle + Math.PI / 6),
          y2 - headlen * Math.sin(angle + Math.PI / 6),
        ];

        rc.line(x2, y2, arrowP1[0], arrowP1[1], { stroke: el.color, strokeWidth: el.strokeWidth, roughness: el.roughness });
        rc.line(x2, y2, arrowP2[0], arrowP2[1], { stroke: el.color, strokeWidth: el.strokeWidth, roughness: el.roughness });
      } else if (el.type === "text" && el.x !== undefined && el.y !== undefined && el.text) {
        ctx.fillStyle = el.color;
        ctx.font = `600 ${el.fontSize || 18}px "Caveat", "Kalam", system-ui, sans-serif`;
        const lines = el.text.split("\n");
        const lineHeight = (el.fontSize || 18) * 1.3;
        lines.forEach((l, i) => {
          ctx.fillText(l, el.x!, el.y! + i * lineHeight);
        });
      }

      // Render Selection Bounding Box & Handles
      if (selectedId === el.id && el.x !== undefined && el.y !== undefined) {
        const w = el.width || 120;
        const h = el.height || 60;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(el.x - 8, el.y - 8, w + 16, h + 16);
        ctx.setLineDash([]);
      }
    });

    // ── Render In-Progress Freehand Stroke ──
    if (isDrawing && currentPoints.length > 0 && (tool === "pen" || tool === "eraser")) {
      const stroke = getStroke(currentPoints, {
        size: strokeWidth * 4,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.55,
      });
      const pathData = getSvgPathFromStroke(stroke);
      const p = new Path2D(pathData);

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000000";
        ctx.fill(p);
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.fillStyle = strokeColor;
        ctx.fill(p);
      }
    }

    ctx.restore();
  }, [elements, isDrawing, currentPoints, tool, strokeColor, fillColor, fillStyle, strokeWidth, roughness, panOffset, zoom, gridType, selectedId]);

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
  }, [drawCanvas]);

  // Pointer Coordinates Translation
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left - panOffset.x) / zoom,
      y: (clientY - rect.top - panOffset.y) / zoom,
    };
  };

  // Pointer Down Event
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasCoords(e);

    // Pan Mode (Hand or Middle click)
    if (tool === "pan" || ("button" in e && e.button === 1)) {
      setIsPanning(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPanStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
      return;
    }

    // Select Tool (Selection & Dragging)
    if (tool === "select") {
      const clickedEl = [...elements].reverse().find((el) => {
        if (el.x === undefined || el.y === undefined) return false;
        const w = el.width || 120;
        const h = el.height || 60;
        return pos.x >= el.x && pos.x <= el.x + w && pos.y >= el.y && pos.y <= el.y + h;
      });

      if (clickedEl) {
        setSelectedId(clickedEl.id);
        setIsDraggingElement(true);
        setDragOffset({ x: pos.x - (clickedEl.x || 0), y: pos.y - (clickedEl.y || 0) });
        saveState();
      } else {
        setSelectedId(null);
      }
      return;
    }

    // Text Tool (Double click or click to type)
    if (tool === "text") {
      setActiveTextInput({ x: pos.x, y: pos.y, text: "" });
      return;
    }

    // Drawing Tools
    setIsDrawing(true);
    setStartPos(pos);
    const pressure = "touches" in e ? 0.5 : (e.nativeEvent as MouseEvent).buttons === 1 ? 0.5 : 0.5;
    setCurrentPoints([[pos.x, pos.y, pressure]]);
    saveState();
  };

  // Pointer Move Event
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPanOffset({ x: clientX - panStart.x, y: clientY - panStart.y });
      return;
    }

    const pos = getCanvasCoords(e);

    if (isDraggingElement && selectedId) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === selectedId) {
            return {
              ...el,
              x: pos.x - dragOffset.x,
              y: pos.y - dragOffset.y,
            };
          }
          return el;
        })
      );
      return;
    }

    if (!isDrawing) return;
    setCurrentPoints((prev) => [...prev, [pos.x, pos.y, 0.5]]);
  };

  // Pointer Up Event
  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDraggingElement) {
      setIsDraggingElement(false);
      return;
    }

    if (!isDrawing || !startPos) return;
    const endPos = getCanvasCoords(e);
    setIsDrawing(false);

    const newElId = "sketch_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    if (tool === "pen" || tool === "eraser") {
      if (currentPoints.length > 0) {
        setElements((prev) => [
          ...prev,
          {
            id: newElId,
            type: tool,
            points: currentPoints,
            color: strokeColor,
            strokeWidth,
            roughness,
          },
        ]);
      }
    } else if (tool === "rect" || tool === "diamond" || tool === "circle" || tool === "line" || tool === "arrow") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: tool,
          x: Math.min(startPos.x, endPos.x),
          y: Math.min(startPos.y, endPos.y),
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          color: strokeColor,
          fillColor,
          fillStyle,
          strokeWidth,
          roughness,
        },
      ]);
    }

    setStartPos(null);
    setCurrentPoints([]);
  };

  // Commit Text Overlay Input
  const commitTextInput = () => {
    if (!activeTextInput || !activeTextInput.text.trim()) {
      setActiveTextInput(null);
      return;
    }
    saveState();
    setElements((prev) => [
      ...prev,
      {
        id: "sketch_" + Date.now(),
        type: "text",
        x: activeTextInput.x,
        y: activeTextInput.y,
        text: activeTextInput.text,
        color: strokeColor,
        strokeWidth: 2,
        roughness: 0,
        fontSize,
      },
    ]);
    setActiveTextInput(null);
  };

  // Save Board to nonxe/database
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
            title: boardTitle.trim() || "LetMeSketch Board",
            ownerId,
            ownerName: userAccount?.id || "Anonymous",
            codeData: {
              elements,
              background: "#070b14",
              grid: gridType !== "none",
            },
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.board) {
        setBoardId(data.board.id);
        showToast(`Saved '${data.board.title}' to nonxe/database!`);
      } else {
        showToast(data.error || "Failed to save board.", "error");
      }
    } catch (err: any) {
      showToast("Cloud save error: " + err.message, "error");
    }
    setSaving(false);
  };

  // Fetch Cloud Boards
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

  const loadBoard = (b: WhiteboardBoard) => {
    saveState();
    setBoardId(b.id);
    setBoardTitle(b.title);
    if (b.codeData && Array.isArray(b.codeData.elements)) {
      setElements(b.codeData.elements as any);
    }
    setShowBoardsModal(false);
    showToast(`Loaded '${b.title}'`);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${boardTitle.toLowerCase().replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Downloaded LetMeSketch PNG Image!");
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-foreground font-sans flex flex-col relative overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-border/30 bg-[#090d16]/95 backdrop-blur-2xl px-4 flex items-center justify-between z-30 flex-shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="size-9 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            title="Back to Home"
          >
            <ArrowLeft className="size-4" />
          </a>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <input
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                className="bg-transparent text-sm font-black text-foreground outline-none border-b border-transparent hover:border-border/40 focus:border-pink-500 transition-all w-48 sm:w-64"
                placeholder="LetMeSketch Title..."
              />
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
                <span className="text-pink-400 font-mono font-bold">LetMeSketch • Rough.js</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">nonxe/database</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-secondary/20 border border-border/30 text-xs font-mono">
            <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))} className="p-1 text-muted-foreground hover:text-foreground" title="Zoom Out">
              <ZoomOut className="size-3.5" />
            </button>
            <span className="px-1 text-[11px] font-bold">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))} className="p-1 text-muted-foreground hover:text-foreground" title="Zoom In">
              <ZoomIn className="size-3.5" />
            </button>
            <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="p-1 text-muted-foreground hover:text-foreground ml-1" title="Reset Zoom">
              <RotateCcw className="size-3" />
            </button>
          </div>

          <button
            onClick={() => {
              setRawJsonCode(JSON.stringify({ title: boardTitle, elements }, null, 2));
              setShowCodeModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Code className="size-3.5 text-cyan-400" />
            <span className="hidden sm:inline">JSON Code</span>
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
            <span className="hidden sm:inline">Export PNG</span>
          </button>

          <button
            onClick={handleSaveToCloud}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-pink-600/20 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            <span>{saving ? "Saving..." : "Save to Cloud"}</span>
          </button>
        </div>
      </header>

      {/* Main LetMeSketch Canvas Workspace */}
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
            style={{ left: activeTextInput.x * zoom + panOffset.x, top: activeTextInput.y * zoom + panOffset.y }}
            className="absolute z-30 -translate-y-4"
          >
            <textarea
              autoFocus
              value={activeTextInput.text}
              onChange={(e) => setActiveTextInput({ ...activeTextInput, text: e.target.value })}
              onBlur={commitTextInput}
              placeholder="Type sketch text..."
              style={{ color: strokeColor, fontSize }}
              className="p-3 rounded-xl border border-pink-500/50 bg-slate-950/95 shadow-2xl outline-none min-w-[200px] min-h-[60px] font-sans font-bold text-foreground"
            />
            <div className="flex justify-end pt-1">
              <button onClick={commitTextInput} className="px-3 py-1 rounded-lg bg-pink-600 text-white text-[11px] font-bold">
                Done
              </button>
            </div>
          </div>
        )}

        {/* Floating LetMeSketch Style Controls Panel (Top Left) */}
        <div className="absolute top-4 left-4 z-20 p-3 rounded-2xl bg-[#090d16]/95 border border-border/40 ios-glass shadow-2xl space-y-3 max-w-xs">
          <div>
            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Stroke Color
            </label>
            <div className="flex items-center gap-1.5">
              {STROKE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStrokeColor(c)}
                  style={{ backgroundColor: c }}
                  className={`size-5 rounded-full border transition-all ${
                    strokeColor === c ? "border-white scale-110 shadow-lg ring-2 ring-pink-500/50" : "border-white/20 opacity-70"
                  }`}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="size-5 rounded-full bg-transparent border-0 cursor-pointer p-0"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Fill Style & Color
            </label>
            <div className="flex items-center gap-1.5 mb-1.5">
              {FILL_COLORS.map((fc, i) => (
                <button
                  key={i}
                  onClick={() => setFillColor(fc)}
                  style={{ backgroundColor: fc === "transparent" ? "#1e293b" : fc }}
                  className={`size-5 rounded-full border transition-all ${
                    fillColor === fc ? "border-white scale-110 shadow-lg ring-2 ring-cyan-500/50" : "border-white/20 opacity-70"
                  }`}
                  title={fc}
                />
              ))}
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {FILL_STYLES.map((fs) => (
                <button
                  key={fs}
                  onClick={() => setFillStyle(fs)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                    fillStyle === fs ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fs}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-foreground mb-1">
              <span>Sloppiness (Excalidraw Style)</span>
              <span className="text-pink-400">{roughness === 0 ? "Architect" : roughness === 1 ? "Artist" : "Cartoon"}</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoughness(r)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    roughness === r ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" : "text-muted-foreground hover:text-foreground bg-secondary/20"
                  }`}
                >
                  {r === 0 ? "Clean" : r === 1 ? "Hand-drawn" : "Rough"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating LetMeSketch Main Toolbar Dock (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#090d16]/95 border border-pink-500/30 ios-glass shadow-2xl max-w-[95vw] overflow-x-auto scrollbar-none">
          {/* Main Drawing Tools */}
          <div className="flex items-center gap-1 pr-2 border-r border-border/30">
            <button
              onClick={() => setTool("select")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "select" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Select & Move Tool"
            >
              <MousePointer className="size-4" />
            </button>
            <button
              onClick={() => setTool("pan")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "pan" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Hand Pan Canvas"
            >
              <Hand className="size-4" />
            </button>
            <button
              onClick={() => setTool("pen")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "pen" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Freehand Pencil (Perfect-Freehand)"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => setTool("rect")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "rect" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rough Rectangle"
            >
              <Square className="size-4" />
            </button>
            <button
              onClick={() => setTool("diamond")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "diamond" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rough Diamond"
            >
              <Gem className="size-4" />
            </button>
            <button
              onClick={() => setTool("circle")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "circle" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rough Ellipse"
            >
              <Circle className="size-4" />
            </button>
            <button
              onClick={() => setTool("arrow")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "arrow" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rough Arrow"
            >
              <MoveRight className="size-4" />
            </button>
            <button
              onClick={() => setTool("line")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "line" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rough Line"
            >
              <Minus className="size-4" />
            </button>
            <button
              onClick={() => setTool("text")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "text" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Handwritten Text"
            >
              <Type className="size-4" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "eraser" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Eraser"
            >
              <Eraser className="size-4" />
            </button>
          </div>

          {/* Grid Toggle & Undo/Redo */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() => setGridType((g) => (g === "dots" ? "mesh" : g === "mesh" ? "none" : "dots"))}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all"
              title="Grid Style"
            >
              <Grid className="size-4" />
            </button>
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
              title="Clear All"
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

      {/* Saved Cloud Boards Modal */}
      {showBoardsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#090d16] border border-pink-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <FolderOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Saved LetMeSketch Boards</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">Stored in nonxe/database repo</p>
                </div>
              </div>
              <button onClick={() => setShowBoardsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin">
              {loadingBoards ? (
                <div className="py-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-pink-400" />
                  <span>Fetching saved boards...</span>
                </div>
              ) : savedBoards.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs font-semibold">
                  No saved boards found. Click "Save to Cloud" to store your first sketch!
                </div>
              ) : (
                savedBoards.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-secondary/10 border border-border/30 hover:border-pink-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadBoard(b)}>
                      <h4 className="text-xs font-black text-foreground truncate">{b.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ID: {b.id} • {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => loadBoard(b)}
                      className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 text-[11px] font-bold hover:bg-pink-500/30 transition-all"
                    >
                      Load
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw Code / JSON Live Editor Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#090d16] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div className="flex items-center gap-2">
                <Code className="size-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-black text-foreground">LetMeSketch Code Representation (JSON)</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">Stored as code in nonxe/database repository</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rawJsonCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
                <button onClick={() => setShowCodeModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <pre className="max-h-96 overflow-y-auto p-4 rounded-2xl bg-black/90 border border-border/40 text-emerald-400 font-mono text-[11.5px] scrollbar-thin select-text">
              {rawJsonCode}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}

export const Route = createFileRoute("/whiteboard")({
  component: LetMeSketchPage,
  head: () => ({
    meta: [
      { title: "LetMeSketch • Collaborative Excalidraw Whiteboard" },
      { name: "description", content: "Hand-drawn sketch diagrams, wireframes, and pressure-sensitive drawing powered by Rough.js and Perfect-Freehand." },
    ],
  }),
});
