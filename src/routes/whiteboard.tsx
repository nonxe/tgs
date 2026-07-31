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
  MousePointer,
  Hand,
  StickyNote,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Edit3,
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
  "#ef4444", // Red
];

const STICKY_BG_COLORS = [
  { name: "Yellow", bg: "#fef08a", text: "#713f12" },
  { name: "Cyan", bg: "#99f6e4", text: "#115e59" },
  { name: "Pink", bg: "#fbcfe8", text: "#831843" },
  { name: "Emerald", bg: "#a7f3d0", text: "#065f46" },
  { name: "Purple", bg: "#e9d5ff", text: "#581c87" },
];

function WhiteboardPage() {
  // Tools: select, pan, pen, eraser, text, sticky, code, rect, circle, line, arrow
  const [tool, setTool] = useState<"select" | "pan" | "pen" | "eraser" | "text" | "sticky" | "code" | "rect" | "circle" | "line" | "arrow">("select");
  const [color, setColor] = useState("#38bdf8");
  const [stickyBg, setStickyBg] = useState(STICKY_BG_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [gridType, setGridType] = useState<"dots" | "mesh" | "none">("dots");

  // Elements & History
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [undoStack, setUndoStack] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  // Selection & Drag State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan & Zoom
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // In-progress Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Active Text / Sticky / Code Editor Overlay
  const [activeOverlay, setActiveOverlay] = useState<{
    id?: string;
    type: "text" | "sticky" | "code";
    x: number;
    y: number;
    text: string;
    title?: string;
  } | null>(null);

  // Board Metadata & Cloud Storage
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState("Untitled Whiteboard");
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

  // Smooth quadratic curves renderer for freehand strokes
  const drawSmoothPath = (ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return;
    if (points.length < 3) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  };

  // Main Canvas Rendering Engine
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply pan & zoom transform
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // ── Render Background Grid ──
    if (gridType === "dots") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      const dotSpacing = 28;
      const startX = Math.floor(-panOffset.x / zoom / dotSpacing) * dotSpacing - dotSpacing;
      const endX = startX + (canvas.width / zoom) + dotSpacing * 2;
      const startY = Math.floor(-panOffset.y / zoom / dotSpacing) * dotSpacing - dotSpacing;
      const endY = startY + (canvas.height / zoom) + dotSpacing * 2;

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
      const endX = startX + (canvas.width / zoom) + gridSize * 2;
      const startY = Math.floor(-panOffset.y / zoom / gridSize) * gridSize - gridSize;
      const endY = startY + (canvas.height / zoom) + gridSize * 2;

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

    // ── Render Elements ──
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
          drawSmoothPath(ctx, el.points);
        }
        ctx.globalCompositeOperation = "source-over";
      } else if (el.type === "sticky" && el.x !== undefined && el.y !== undefined) {
        // Sticky Note Card (Excalidraw Post-It style)
        const w = el.width || 180;
        const h = el.height || 140;
        const cardBg = el.bgColor || "#fef08a";

        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = cardBg;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, w, h, 14);
        ctx.fill();

        ctx.shadowColor = "transparent";

        // Sticky note top pin strip
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, w, 24, [14, 14, 0, 0]);
        ctx.fill();

        if (el.text) {
          ctx.fillStyle = el.color || "#713f12";
          ctx.font = `600 ${el.fontSize || 14}px system-ui, -apple-system, sans-serif`;
          const lines = el.text.split("\n");
          lines.forEach((l, i) => {
            ctx.fillText(l, el.x! + 12, el.y! + 44 + i * ((el.fontSize || 14) * 1.3));
          });
        }
      } else if (el.type === "code" && el.x !== undefined && el.y !== undefined) {
        // Code Block Card Element
        const lines = (el.text || "").split("\n");
        const fontSz = el.fontSize || 13;
        const lineHeight = fontSz * 1.4;

        ctx.font = `500 ${fontSz}px monospace`;
        const maxLineWidth = Math.max(160, ...lines.map((l) => ctx.measureText(l).width));
        const boxWidth = maxLineWidth + 36;
        const boxHeight = Math.max(70, lines.length * lineHeight + 38);

        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 8;

        ctx.fillStyle = "#0b1329";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, boxWidth, boxHeight, 14);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = "transparent";

        // IDE Header Bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, boxWidth, 26, [14, 14, 0, 0]);
        ctx.fill();

        // Window controls dots
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.arc(el.x + 14, el.y + 13, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#eab308";
        ctx.beginPath(); ctx.arc(el.x + 24, el.y + 13, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath(); ctx.arc(el.x + 34, el.y + 13, 3.5, 0, Math.PI * 2); ctx.fill();

        // Code text with line numbers
        lines.forEach((lineStr, i) => {
          const lineY = el.y! + 46 + i * lineHeight;
          // Line Number
          ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
          ctx.fillText(String(i + 1).padStart(2, " "), el.x! + 10, lineY);
          // Code Text
          ctx.fillStyle = el.color || "#38bdf8";
          ctx.fillText(lineStr, el.x! + 36, lineY);
        });
      } else if (el.type === "text" && el.x !== undefined && el.y !== undefined && el.text) {
        ctx.font = `600 ${el.fontSize || 16}px system-ui, -apple-system, sans-serif`;
        const lines = el.text.split("\n");
        const lineHeight = (el.fontSize || 16) * 1.3;
        lines.forEach((l, i) => {
          ctx.fillText(l, el.x!, el.y! + i * lineHeight);
        });
      } else if (el.type === "rect" && el.x !== undefined && el.y !== undefined && el.width && el.height) {
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, 8);
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
        const headlen = 14;
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

      // Highlight Selected Element
      if (selectedId === el.id && el.x !== undefined && el.y !== undefined) {
        const w = el.width || 120;
        const h = el.height || 60;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(el.x - 6, el.y - 6, w + 12, h + 12);
        ctx.setLineDash([]);
      }
    });

    // Render active in-progress drawing stroke
    if (isDrawing && startPos) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = strokeWidth;

      if (tool === "pen" && currentPoints.length > 0) {
        drawSmoothPath(ctx, currentPoints);
      } else if (tool === "eraser" && currentPoints.length > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = strokeWidth * 4;
        drawSmoothPath(ctx, currentPoints);
        ctx.globalCompositeOperation = "source-over";
      }
    }

    ctx.restore();
  }, [elements, isDrawing, currentPoints, startPos, tool, color, strokeWidth, panOffset, zoom, gridType, selectedId]);

  // Handle Canvas Resize
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

  // Translate pointer coordinates considering pan & zoom
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    return {
      x: (screenX - panOffset.x) / zoom,
      y: (screenY - panOffset.y) / zoom,
    };
  };

  // Pointer Down
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasCoords(e);

    // Pan Mode (Hand tool or middle click)
    if (tool === "pan" || ("button" in e && e.button === 1)) {
      setIsPanning(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPanStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
      return;
    }

    // Select Tool (Drag & Drop existing elements)
    if (tool === "select") {
      const clickedEl = [...elements].reverse().find((el) => {
        if (el.x === undefined || el.y === undefined) return false;
        const w = el.width || 140;
        const h = el.height || 80;
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

    // Overlay Creation Tools (Text, Sticky Note, Code Card)
    if (tool === "text" || tool === "sticky" || tool === "code") {
      setActiveOverlay({
        type: tool,
        x: pos.x,
        y: pos.y,
        text: "",
      });
      return;
    }

    // Drawing Tools
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPoints([pos]);
    saveState();
  };

  // Pointer Move
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
    setCurrentPoints((prev) => [...prev, pos]);
  };

  // Pointer Up
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

  // Commit Overlay Text / Sticky Note / Code Snippet
  const commitOverlayInput = () => {
    if (!activeOverlay || !activeOverlay.text.trim()) {
      setActiveOverlay(null);
      return;
    }
    saveState();

    const newElId = "el_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    if (activeOverlay.type === "sticky") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "sticky",
          x: activeOverlay.x,
          y: activeOverlay.y,
          width: 200,
          height: 150,
          text: activeOverlay.text,
          color: stickyBg.text,
          bgColor: stickyBg.bg,
          strokeWidth: 1,
          fontSize: 14,
        },
      ]);
    } else if (activeOverlay.type === "code") {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "code",
          x: activeOverlay.x,
          y: activeOverlay.y,
          text: activeOverlay.text,
          color,
          strokeWidth: 1,
          fontSize: 13,
        },
      ]);
    } else {
      setElements((prev) => [
        ...prev,
        {
          id: newElId,
          type: "text",
          x: activeOverlay.x,
          y: activeOverlay.y,
          text: activeOverlay.text,
          color,
          strokeWidth: 2,
          fontSize,
        },
      ]);
    }

    setActiveOverlay(null);
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
              background: "#070b14",
              grid: gridType !== "none",
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

  // Apply JSON Code Changes from Code Editor Modal
  const handleApplyCodeJson = () => {
    try {
      const parsed = JSON.parse(rawJsonCode);
      const targetEls = Array.isArray(parsed) ? parsed : parsed.elements;
      if (Array.isArray(targetEls)) {
        saveState();
        setElements(targetEls);
        setShowCodeModal(false);
        showToast("Successfully applied JSON code state to whiteboard!");
      } else {
        showToast("Invalid JSON format. Expected an array or { elements: [...] }", "error");
      }
    } catch (err: any) {
      showToast("JSON Code Syntax Error: " + err.message, "error");
    }
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
      {/* Top Floating Navigation Header */}
      <header className="h-16 border-b border-border/30 bg-[#090d16]/95 backdrop-blur-2xl px-4 flex items-center justify-between z-30 flex-shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="size-9 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            title="Back to Dashboard"
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
                placeholder="Whiteboard Title..."
              />
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
                <span className="text-pink-400 font-mono font-bold">Excalidraw Cloud Engine</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">nonxe/database</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="p-1 text-muted-foreground hover:text-foreground ml-1" title="Reset View">
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

      {/* Main Canvas Canvas Container */}
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

        {/* Text / Sticky / Code Overlay Input Editor */}
        {activeOverlay && (
          <div
            style={{ left: activeOverlay.x * zoom + panOffset.x, top: activeOverlay.y * zoom + panOffset.y }}
            className="absolute z-30 -translate-y-4 shadow-2xl animate-spring-scale"
          >
            {activeOverlay.type === "sticky" ? (
              <div
                style={{ backgroundColor: stickyBg.bg }}
                className="w-64 p-3 rounded-2xl border border-black/10 space-y-2 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-1 text-xs font-bold" style={{ color: stickyBg.text }}>
                  <span>Sticky Note</span>
                  <div className="flex gap-1">
                    {STICKY_BG_COLORS.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setStickyBg(s)}
                        style={{ backgroundColor: s.bg }}
                        className={`size-3.5 rounded-full border ${stickyBg.name === s.name ? "border-black scale-110" : "border-black/20"}`}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  autoFocus
                  value={activeOverlay.text}
                  onChange={(e) => setActiveOverlay({ ...activeOverlay, text: e.target.value })}
                  placeholder="Type sticky note content..."
                  style={{ color: stickyBg.text }}
                  className="w-full h-24 bg-transparent outline-none resize-none font-sans text-sm font-semibold placeholder:text-black/30"
                />
                <div className="flex justify-end">
                  <button onClick={commitOverlayInput} className="px-3 py-1 rounded-lg bg-black/80 text-white text-[11px] font-bold">
                    Done
                  </button>
                </div>
              </div>
            ) : activeOverlay.type === "code" ? (
              <div className="w-80 p-3 rounded-2xl bg-[#0b1329] border border-cyan-500/50 space-y-2 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 border-b border-cyan-500/20 pb-1">
                  <span>Code Snippet Editor</span>
                  <Code className="size-3.5" />
                </div>
                <textarea
                  autoFocus
                  value={activeOverlay.text}
                  onChange={(e) => setActiveOverlay({ ...activeOverlay, text: e.target.value })}
                  placeholder="// Paste or write code snippet here..."
                  className="w-full h-32 bg-black/50 text-cyan-300 font-mono text-xs p-2 rounded-xl border border-cyan-500/20 outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActiveOverlay(null)} className="px-3 py-1 rounded-lg bg-secondary/40 text-muted-foreground text-[11px] font-bold">
                    Cancel
                  </button>
                  <button onClick={commitOverlayInput} className="px-3 py-1 rounded-lg bg-cyan-600 text-white text-[11px] font-bold">
                    Add Code Card
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/90 p-2.5 rounded-2xl border border-purple-500/50 space-y-2 shadow-2xl">
                <textarea
                  autoFocus
                  value={activeOverlay.text}
                  onChange={(e) => setActiveOverlay({ ...activeOverlay, text: e.target.value })}
                  placeholder="Type text note..."
                  style={{ color, fontSize }}
                  className="w-60 h-20 bg-transparent text-foreground outline-none resize-none font-sans font-semibold placeholder:text-muted-foreground/30"
                />
                <div className="flex justify-end">
                  <button onClick={commitOverlayInput} className="px-3 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Excalidraw Tool Dock (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#090d16]/95 border border-pink-500/30 ios-glass shadow-2xl max-w-[95vw] overflow-x-auto scrollbar-none">
          {/* Main Tools Switcher */}
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
              title="Pan / Hand Drag Canvas"
            >
              <Hand className="size-4" />
            </button>
            <button
              onClick={() => setTool("pen")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "pen" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Smooth Freehand Pen"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "eraser" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Precision Eraser"
            >
              <Eraser className="size-4" />
            </button>
            <button
              onClick={() => setTool("sticky")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "sticky" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Add Sticky Note Card"
            >
              <StickyNote className="size-4" />
            </button>
            <button
              onClick={() => setTool("code")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "code" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Insert Code Snippet Card"
            >
              <Code className="size-4" />
            </button>
            <button
              onClick={() => setTool("text")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "text" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Type Text Note"
            >
              <Type className="size-4" />
            </button>
            <button
              onClick={() => setTool("rect")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "rect" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rectangle Shape"
            >
              <Square className="size-4" />
            </button>
            <button
              onClick={() => setTool("circle")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "circle" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Circle Shape"
            >
              <Circle className="size-4" />
            </button>
            <button
              onClick={() => setTool("arrow")}
              className={`p-2.5 rounded-xl transition-all ${
                tool === "arrow" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Arrow Pointer"
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
                className={`size-5.5 rounded-full border transition-all ${
                  color === c ? "border-white scale-110 shadow-lg shadow-pink-500/30 ring-2 ring-pink-500/50" : "border-white/20 opacity-70 hover:opacity-100"
                }`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-5.5 rounded-full bg-transparent border-0 cursor-pointer p-0"
              title="Custom Color Picker"
            />
          </div>

          {/* Grid Style & Stroke Width */}
          <div className="flex items-center gap-2 px-2 border-r border-border/30">
            <button
              onClick={() => setGridType((g) => (g === "dots" ? "mesh" : g === "mesh" ? "none" : "dots"))}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1"
              title="Toggle Grid Type"
            >
              <Grid className="size-3.5" />
              <span className="capitalize text-[10px]">{gridType}</span>
            </button>
            <span className="text-[10px] font-mono text-muted-foreground font-bold">{strokeWidth}px</span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-14 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-pink-400"
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
                  showToast("Cleared whiteboard canvas.");
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
                  <h3 className="text-base font-black text-foreground">Saved Cloud Whiteboards</h3>
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
                    className="p-3.5 rounded-2xl bg-secondary/10 border border-border/30 hover:border-pink-500/40 flex items-center justify-between gap-3 transition-all"
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
                        className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 text-[11px] font-bold hover:bg-pink-500/30 transition-all"
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

      {/* Raw Code / JSON Live Editor Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#090d16] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div className="flex items-center gap-2">
                <Code className="size-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-black text-foreground">Whiteboard Code State (JSON Editor)</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">Edit JSON below and click Apply Code Changes to update canvas live</p>
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

            <textarea
              value={rawJsonCode}
              onChange={(e) => setRawJsonCode(e.target.value)}
              className="w-full h-96 p-4 rounded-2xl bg-black/90 border border-border/40 text-emerald-400 font-mono text-[12px] outline-none focus:border-cyan-500 scrollbar-thin select-text"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground font-mono">Stored in nonxe/database repository</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCodeJson}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-black shadow-lg shadow-cyan-600/20"
                >
                  Apply Code Changes
                </button>
              </div>
            </div>
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
      { title: "Cloud Whiteboard • Excalidraw Engine" },
      { name: "description", content: "Ultra-smooth interactive hand drawing, sticky notes, code cards, and infinite canvas backed by code storage in nonxe/database." },
    ],
  }),
});
