import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Gamepad2
} from "lucide-react";

export const Route = createFileRoute("/runner")({
  head: () => ({
    meta: [
      { title: "Modi Express Runner — 3D Endless Subway Runner" },
      { name: "description", content: "Subway Surfers-style 3D endless runner featuring Narendra Modi. Collect lotuses, dodge obstacles, and beat high scores on mobile & PC!" },
    ],
  }),
  component: ModiRunnerPage,
});

// Sound Effects Synthesizer using Web Audio API
class SoundEngine {
  ctx: AudioContext | null = null;
  muted: boolean = false;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playCollect() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  playSlide() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  playCrash() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }
}

const sounds = new SoundEngine();

interface Obstacle {
  id: number;
  lane: number; // -1, 0, 1
  z: number; // distance 0 to 1000
  type: "barricade" | "train" | "lowHurdle" | "highBridge";
}

interface Item {
  id: number;
  lane: number;
  z: number;
  collected: boolean;
}

function ModiRunnerPage() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lotusCount, setLotusCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Touch swipe handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Game Engine State Refs
  const gameRef = useRef<{
    lane: number; // -1, 0, 1
    targetLane: number;
    laneOffset: number; // smooth x transition
    y: number; // jump height
    vy: number; // jump velocity
    isJumping: boolean;
    isSliding: boolean;
    slideTimer: number;
    speed: number;
    distance: number;
    score: number;
    lotuses: number;
    obstacles: Obstacle[];
    items: Item[];
    nextId: number;
    animFrame: number;
  }>({
    lane: 0,
    targetLane: 0,
    laneOffset: 0,
    y: 0,
    vy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: 6,
    distance: 0,
    score: 0,
    lotuses: 0,
    obstacles: [],
    items: [],
    nextId: 1,
    animFrame: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("modi_runner_highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    sounds.init();
    gameRef.current = {
      lane: 0,
      targetLane: 0,
      laneOffset: 0,
      y: 0,
      vy: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      speed: 7,
      distance: 0,
      score: 0,
      lotuses: 0,
      obstacles: [],
      items: [],
      nextId: 1,
      animFrame: 0,
    };
    setScore(0);
    setLotusCount(0);
    setGameState("playing");
  };

  // Movement Trigger Helpers
  const moveLeft = () => {
    const g = gameRef.current;
    if (g.targetLane > -1) {
      g.targetLane -= 1;
    }
  };

  const moveRight = () => {
    const g = gameRef.current;
    if (g.targetLane < 1) {
      g.targetLane += 1;
    }
  };

  const jump = () => {
    const g = gameRef.current;
    if (!g.isJumping && !g.isSliding) {
      g.isJumping = true;
      g.vy = 14;
      sounds.playJump();
    }
  };

  const slide = () => {
    const g = gameRef.current;
    if (!g.isSliding) {
      g.isSliding = true;
      g.slideTimer = 35;
      if (g.isJumping) {
        g.vy = -15; // fast descent
      }
      sounds.playSlide();
    }
  };

  // Global Keydown Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        moveLeft();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        moveRight();
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
        e.preventDefault();
        jump();
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0 || gameState !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) moveRight();
      else if (dx < -30) moveLeft();
    } else {
      if (dy < -30) jump();
      else if (dy > 30) slide();
    }
    touchStartRef.current = null;
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let running = true;

    const loop = () => {
      if (!running) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Handle Device Pixel Ratio Scaling
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const g = gameRef.current;
      g.animFrame += 1;

      // Accelerate speed gradually
      g.speed += 0.0015;
      g.distance += g.speed;
      g.score = Math.floor(g.distance / 10) + g.lotuses * 10;
      setScore(g.score);

      // Smooth Lane Transition
      const targetOffset = g.targetLane * (width * 0.22);
      g.laneOffset += (targetOffset - g.laneOffset) * 0.25;

      // Jump Physics
      if (g.isJumping) {
        g.y += g.vy;
        g.vy -= 0.85; // Gravity
        if (g.y <= 0) {
          g.y = 0;
          g.vy = 0;
          g.isJumping = false;
        }
      }

      // Slide Timer
      if (g.isSliding) {
        g.slideTimer -= 1;
        if (g.slideTimer <= 0) {
          g.isSliding = false;
        }
      }

      // Spawn Obstacles & Lotuses
      if (g.animFrame % Math.max(25, Math.floor(65 - g.speed * 2)) === 0) {
        const laneChoice = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const r = Math.random();

        if (r < 0.6) {
          // Obstacle
          const types: ("barricade" | "train" | "lowHurdle" | "highBridge")[] = [
            "barricade",
            "lowHurdle",
            "highBridge",
            "train",
          ];
          const chosenType = types[Math.floor(Math.random() * types.length)];
          g.obstacles.push({
            id: g.nextId++,
            lane: laneChoice,
            z: 1000,
            type: chosenType,
          });
        } else {
          // Lotus item line
          for (let k = 0; k < 3; k++) {
            g.items.push({
              id: g.nextId++,
              lane: laneChoice,
              z: 1000 + k * 120,
              collected: false,
            });
          }
        }
      }

      // Move Obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        g.obstacles[i].z -= g.speed * 5;
        if (g.obstacles[i].z < -50) {
          g.obstacles.splice(i, 1);
        }
      }

      // Move Items
      for (let i = g.items.length - 1; i >= 0; i--) {
        g.items[i].z -= g.speed * 5;
        if (g.items[i].z < -50) {
          g.items.splice(i, 1);
        }
      }

      // Collision Detection
      const playerZ = 80;
      for (const obs of g.obstacles) {
        if (Math.abs(obs.z - playerZ) < 40) {
          const obsLaneX = obs.lane * (width * 0.22);
          if (Math.abs(g.laneOffset - obsLaneX) < width * 0.12) {
            // Check vertical collision based on type
            let hit = false;

            if (obs.type === "barricade" || obs.type === "train") {
              hit = true; // Block full lane
            } else if (obs.type === "lowHurdle") {
              if (g.y < 35) hit = true; // Must jump over
            } else if (obs.type === "highBridge") {
              if (!g.isSliding) hit = true; // Must slide under
            }

            if (hit) {
              sounds.playCrash();
              running = false;
              setGameState("gameover");

              const finalScore = g.score;
              setHighScore((prev) => {
                const nextHigh = Math.max(prev, finalScore);
                localStorage.setItem("modi_runner_highscore", nextHigh.toString());
                return nextHigh;
              });
              return;
            }
          }
        }
      }

      // Collect Lotus Items
      for (const item of g.items) {
        if (!item.collected && Math.abs(item.z - playerZ) < 45) {
          const itemLaneX = item.lane * (width * 0.22);
          if (Math.abs(g.laneOffset - itemLaneX) < width * 0.12) {
            item.collected = true;
            g.lotuses += 1;
            setLotusCount(g.lotuses);
            sounds.playCollect();
          }
        }
      }

      // RENDER CANVAS
      ctx.clearRect(0, 0, width, height);

      // Sky Background Gradient (Sunset/Tricolor Ambient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      skyGrad.addColorStop(0, "#0b1329");
      skyGrad.addColorStop(0.5, "#1e294b");
      skyGrad.addColorStop(1, "#fb923c"); // Saffron horizon glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Sun & Skyline Silhouettes
      ctx.fillStyle = "rgba(253, 224, 71, 0.3)";
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.38, 70, 0, Math.PI * 2);
      ctx.fill();

      // Track Road Projection
      const horizonY = height * 0.45;
      const horizonW = width * 0.15;
      const bottomW = width * 0.85;

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, "#1f2937");
      roadGrad.addColorStop(1, "#111827");
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(width * 0.5 - horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + bottomW * 0.5, height);
      ctx.lineTo(width * 0.5 - bottomW * 0.5, height);
      ctx.closePath();
      ctx.fill();

      // Render 3 Lanes Dividers
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 2;
      const roadZOffset = (g.distance * 2) % 40;

      for (let laneIdx = -1.5; laneIdx <= 1.5; laneIdx += 1) {
        const topX = width * 0.5 + laneIdx * (horizonW / 3);
        const botX = width * 0.5 + laneIdx * (bottomW / 3);

        ctx.strokeStyle = "rgba(251, 146, 60, 0.4)";
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(botX, height);
        ctx.stroke();
      }

      // Moving Grid Speed Lines
      for (let zProgress = 0; zProgress <= 1000; zProgress += 100) {
        const adjustedZ = (zProgress - roadZOffset + 1000) % 1000;
        const scale = 1 - adjustedZ / 1000;
        const lineY = horizonY + (height - horizonY) * Math.pow(scale, 2);
        const currentW = horizonW + (bottomW - horizonW) * Math.pow(scale, 2);

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * scale})`;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - currentW * 0.5, lineY);
        ctx.lineTo(width * 0.5 + currentW * 0.5, lineY);
        ctx.stroke();
      }

      // Render Items (Lotus Flowers)
      for (const item of g.items) {
        if (item.collected || item.z < 0) continue;
        const scale = Math.pow(1 - item.z / 1000, 2);
        const objY = horizonY + (height - horizonY) * scale;
        const currentW = horizonW + (bottomW - horizonW) * scale;
        const objX = width * 0.5 + item.lane * (currentW / 3);
        const size = Math.max(6, 28 * scale);

        ctx.save();
        ctx.translate(objX, objY - size);
        ctx.fillStyle = "#ec4899"; // Pink Lotus
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#facc15"; // Gold Lotus Core
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Obstacles
      for (const obs of g.obstacles) {
        if (obs.z < 0) continue;
        const scale = Math.pow(1 - obs.z / 1000, 2);
        const objY = horizonY + (height - horizonY) * scale;
        const currentW = horizonW + (bottomW - horizonW) * scale;
        const objX = width * 0.5 + obs.lane * (currentW / 3);
        const obsWidth = Math.max(12, (currentW / 3) * 0.8);
        const obsHeight = Math.max(10, 50 * scale);

        ctx.save();
        ctx.translate(objX, objY);

        if (obs.type === "barricade" || obs.type === "train") {
          // Barricade / Express Bus
          ctx.fillStyle = obs.type === "train" ? "#dc2626" : "#f97316";
          ctx.fillRect(-obsWidth * 0.5, -obsHeight, obsWidth, obsHeight);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = Math.max(1, 3 * scale);
          ctx.strokeRect(-obsWidth * 0.5, -obsHeight, obsWidth, obsHeight);
        } else if (obs.type === "lowHurdle") {
          // Low Barricade (Jump Over)
          ctx.fillStyle = "#eab308";
          ctx.fillRect(-obsWidth * 0.5, -obsHeight * 0.4, obsWidth, obsHeight * 0.4);
        } else if (obs.type === "highBridge") {
          // High Bridge Overhead (Slide Under)
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(-obsWidth * 0.6, -obsHeight * 1.5, obsWidth * 1.2, obsHeight * 0.6);
          // Legs
          ctx.fillRect(-obsWidth * 0.6, -obsHeight * 1.5, obsWidth * 0.15, obsHeight * 1.5);
          ctx.fillRect(obsWidth * 0.45, -obsHeight * 1.5, obsWidth * 0.15, obsHeight * 1.5);
        }
        ctx.restore();
      }

      // RENDER NARENDRA MODI RUNNER AVATAR
      const playerX = width * 0.5 + g.laneOffset;
      const playerY = height * 0.86 - g.y;
      const isSliding = g.isSliding;

      ctx.save();
      ctx.translate(playerX, playerY);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 5, 24, 8 * (1 - g.y / 200), 0, 0, Math.PI * 2);
      ctx.fill();

      // Modi Character Body Layout
      const bounce = Math.sin(g.animFrame * 0.4) * 4;
      const bodyY = isSliding ? 12 : bounce;

      // Legs / Lower Body
      ctx.fillStyle = "#ffffff"; // White Kurta/Pajama
      if (isSliding) {
        ctx.fillRect(-18, -bodyY - 14, 36, 14);
      } else {
        const legLeg = Math.sin(g.animFrame * 0.4) * 12;
        ctx.fillRect(-12, -bodyY - 24, 10, 24 + legLeg);
        ctx.fillRect(2, -bodyY - 24, 10, 24 - legLeg);
      }

      // Torso / Modi Jacket (Saffron & Blue Kurta Vest)
      ctx.fillStyle = "#f97316"; // Saffron Vest
      ctx.beginPath();
      ctx.roundRect(-16, -bodyY - 50, 32, 28, 6);
      ctx.fill();

      // Tricolor Collar Accent
      ctx.fillStyle = "#16a34a"; // Green Collar Line
      ctx.fillRect(-12, -bodyY - 50, 24, 4);

      // Arms Running Animation
      ctx.fillStyle = "#ffffff";
      if (!isSliding) {
        const armCycle = Math.cos(g.animFrame * 0.4) * 14;
        ctx.fillRect(-22, -bodyY - 46, 7, 20 + armCycle);
        ctx.fillRect(15, -bodyY - 46, 7, 20 - armCycle);
      }

      // Head & White Hair/Beard
      ctx.fillStyle = "#fde047"; // Skin tone accent
      ctx.beginPath();
      ctx.arc(0, -bodyY - 60, 12, 0, Math.PI * 2);
      ctx.fill();

      // White Hair & Signature Beard
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -bodyY - 64, 13, Math.PI, Math.PI * 2); // Hair top
      ctx.fill();

      // White Beard
      ctx.beginPath();
      ctx.arc(0, -bodyY - 57, 11, 0, Math.PI); // Beard bottom
      ctx.fill();

      // Spectacles / Glasses
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.strokeRect(-8, -bodyY - 63, 6, 5);
      ctx.strokeRect(2, -bodyY - 63, 6, 5);

      ctx.restore();

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  return (
    <main className="min-h-screen bg-[#030712] text-white flex flex-col font-sans relative overflow-x-hidden select-none pb-10">
      {/* Header */}
      <header className="px-5 py-4 border-b border-white/10 backdrop-blur-2xl sticky top-0 z-40 bg-[#030712]/85 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9.5 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all text-white shadow-md"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-9.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Gamepad2 className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight leading-none text-white">
                MODI EXPRESS RUNNER
              </h1>
              <p className="text-[9.5px] text-amber-400 font-semibold tracking-wider mt-0.5">3D Subway Endless Runner</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.muted = !isMuted;
              setIsMuted(!isMuted);
            }}
            className="size-9 rounded-full bg-slate-900 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Game Container */}
      <section className="relative max-w-4xl mx-auto w-full px-4 pt-4 flex-1 flex flex-col items-center justify-center space-y-4">

        {/* Canvas Screen */}
        <div
          className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-amber-500/30 bg-slate-950 shadow-2xl touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Playing HUD Overlay */}
          {gameState === "playing" && (
            <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none z-20">
              <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/40 text-amber-300 text-[13px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                <Zap className="size-4 text-amber-400 fill-amber-400" />
                <span>{score.toLocaleString()} m</span>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-500/40 text-pink-300 text-[13px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                <Sparkles className="size-4 text-pink-400" />
                <span>{lotusCount} Lotuses</span>
              </div>
            </div>
          )}

          {/* Start Menu Overlay */}
          {gameState === "menu" && (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 z-30">
              <div className="size-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-bounce">
                <Gamepad2 className="size-10 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">MODI RUNNER 3D</h2>
                <p className="text-[13px] font-medium text-slate-300 max-w-xs">
                  Run through 3 lanes, collect lotus flowers, dodge hurdles & buses!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-2xl text-xs font-bold text-amber-400">
                <Trophy className="size-4 text-amber-400" />
                <span>High Score: {highScore.toLocaleString()}</span>
              </div>

              <button
                onClick={startGame}
                className="w-full max-w-xs h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all active:scale-95"
              >
                <Play className="size-5 fill-white" />
                <span>START RUNNING</span>
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center space-y-6 z-30 animate-spring-scale">
              <div className="size-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Zap className="size-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">RUN COMPLETED!</h2>
                <p className="text-xs text-slate-400 font-medium">Collision detected on track</p>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Distance Run:</span>
                  <span className="text-amber-400 font-black text-sm">{score.toLocaleString()} m</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Lotuses Collected:</span>
                  <span className="text-pink-400 font-black text-sm">{lotusCount}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Best Record:</span>
                  <span className="text-emerald-400 font-black text-sm">{highScore.toLocaleString()} m</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full max-w-xs h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all active:scale-95"
              >
                <RotateCcw className="size-4" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE & PC TOUCH CONTROL PAD */}
        <div className="w-full max-w-md space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={moveLeft}
              className="h-12 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 active:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md transition-all"
            >
              <ChevronLeft className="size-5" />
              <span>LEFT</span>
            </button>

            <button
              onClick={jump}
              className="h-12 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 active:bg-amber-600 text-amber-300 flex items-center justify-center font-bold text-xs shadow-md transition-all"
            >
              <ChevronUp className="size-5" />
              <span>JUMP</span>
            </button>

            <button
              onClick={slide}
              className="h-12 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 active:bg-purple-600 text-purple-300 flex items-center justify-center font-bold text-xs shadow-md transition-all"
            >
              <ChevronDown className="size-5" />
              <span>SLIDE</span>
            </button>

            <button
              onClick={moveRight}
              className="h-12 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 active:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md transition-all"
            >
              <span>RIGHT</span>
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 text-center text-[11.5px] font-medium text-slate-400 flex justify-around">
            <span>💻 <strong>PC Controls:</strong> Arrow Keys / W, A, S, D / Space</span>
            <span>📱 <strong>Mobile Controls:</strong> Swipe Gestures or Buttons</span>
          </div>
        </div>

      </section>
    </main>
  );
}
