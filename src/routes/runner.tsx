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
  Gamepad2,
  Gauge
} from "lucide-react";

export const Route = createFileRoute("/runner")({
  head: () => ({
    meta: [
      { title: "Modi Express Runner 3D — Enhanced Graphics & Smooth Gameplay" },
      { name: "description", content: "Subway Surfers-style 3D endless runner featuring Narendra Modi. Enhanced 3D graphics, progressive speed acceleration, collect lotuses, and dodge hurdles!" },
    ],
  }),
  component: ModiRunnerPage,
});

// Web Audio API Synthesizer
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
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  playSlide() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  playCrash() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
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
  rot: number;
}

function ModiRunnerPage() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lotusCount, setLotusCount] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState("1.0x");
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Engine State
  const gameRef = useRef<{
    lane: number; // -1, 0, 1
    targetLane: number;
    laneOffset: number; // smooth lerp x
    y: number; // jump height
    vy: number;
    isJumping: boolean;
    isSliding: boolean;
    slideTimer: number;
    speed: number;
    initialSpeed: number;
    distance: number;
    score: number;
    lotuses: number;
    obstacles: Obstacle[];
    items: Item[];
    nextId: number;
    animFrame: number;
    lastTime: number;
  }>({
    lane: 0,
    targetLane: 0,
    laneOffset: 0,
    y: 0,
    vy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: 4.5, // Start slow & comfortable
    initialSpeed: 4.5,
    distance: 0,
    score: 0,
    lotuses: 0,
    obstacles: [],
    items: [],
    nextId: 1,
    animFrame: 0,
    lastTime: 0,
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
      speed: 4.5, // Initially slow for smooth start
      initialSpeed: 4.5,
      distance: 0,
      score: 0,
      lotuses: 0,
      obstacles: [],
      items: [],
      nextId: 1,
      animFrame: 0,
      lastTime: performance.now(),
    };
    setScore(0);
    setLotusCount(0);
    setSpeedMultiplier("1.0x");
    setGameState("playing");
  };

  const moveLeft = () => {
    const g = gameRef.current;
    if (g.targetLane > -1) g.targetLane -= 1;
  };

  const moveRight = () => {
    const g = gameRef.current;
    if (g.targetLane < 1) g.targetLane += 1;
  };

  const jump = () => {
    const g = gameRef.current;
    if (!g.isJumping && !g.isSliding) {
      g.isJumping = true;
      g.vy = 14.5;
      sounds.playJump();
    }
  };

  const slide = () => {
    const g = gameRef.current;
    if (!g.isSliding) {
      g.isSliding = true;
      g.slideTimer = 35;
      if (g.isJumping) g.vy = -16; // Quick landing
      sounds.playSlide();
    }
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft();
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight();
      else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
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
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0 || gameState !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 25) moveRight();
      else if (dx < -25) moveLeft();
    } else {
      if (dy < -25) jump();
      else if (dy > 25) slide();
    }
    touchStartRef.current = null;
  };

  // 60FPS Enhanced 3D Canvas Game Engine
  useEffect(() => {
    if (gameState !== "playing") return;
    let running = true;

    const loop = (currentTime: number) => {
      if (!running) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Handle Canvas Sizing
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const g = gameRef.current;
      g.animFrame += 1;

      // Progressively accelerate speed over time
      // Starts slow (4.5) -> smoothly ramps up as distance increases
      g.speed = Math.min(18.0, g.initialSpeed + (g.distance * 0.0006));
      g.distance += g.speed;
      g.score = Math.floor(g.distance / 10) + g.lotuses * 10;
      
      setScore(g.score);
      setSpeedMultiplier((g.speed / g.initialSpeed).toFixed(1) + "x");

      // Smooth Lane Switching (Lerp)
      const targetOffset = g.targetLane * (width * 0.23);
      g.laneOffset += (targetOffset - g.laneOffset) * 0.22;

      // Jump Physics
      if (g.isJumping) {
        g.y += g.vy;
        g.vy -= 0.85;
        if (g.y <= 0) {
          g.y = 0;
          g.vy = 0;
          g.isJumping = false;
        }
      }

      // Slide Physics
      if (g.isSliding) {
        g.slideTimer -= 1;
        if (g.slideTimer <= 0) g.isSliding = false;
      }

      // Spawn Obstacles & 3D Lotuses
      const spawnInterval = Math.max(22, Math.floor(75 - g.speed * 2.8));
      if (g.animFrame % spawnInterval === 0) {
        const laneChoice = Math.floor(Math.random() * 3) - 1;
        const r = Math.random();

        if (r < 0.58) {
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
          for (let k = 0; k < 3; k++) {
            g.items.push({
              id: g.nextId++,
              lane: laneChoice,
              z: 1000 + k * 130,
              collected: false,
              rot: 0,
            });
          }
        }
      }

      // Move Obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        g.obstacles[i].z -= g.speed * 5;
        if (g.obstacles[i].z < -50) g.obstacles.splice(i, 1);
      }

      // Move Items & Rotate
      for (let i = g.items.length - 1; i >= 0; i--) {
        g.items[i].z -= g.speed * 5;
        g.items[i].rot += 0.08;
        if (g.items[i].z < -50) g.items.splice(i, 1);
      }

      // Collision Detection
      const playerZ = 85;
      for (const obs of g.obstacles) {
        if (Math.abs(obs.z - playerZ) < 38) {
          const obsLaneX = obs.lane * (width * 0.23);
          if (Math.abs(g.laneOffset - obsLaneX) < width * 0.13) {
            let hit = false;
            if (obs.type === "barricade" || obs.type === "train") hit = true;
            else if (obs.type === "lowHurdle" && g.y < 35) hit = true;
            else if (obs.type === "highBridge" && !g.isSliding) hit = true;

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
          const itemLaneX = item.lane * (width * 0.23);
          if (Math.abs(g.laneOffset - itemLaneX) < width * 0.13) {
            item.collected = true;
            g.lotuses += 1;
            setLotusCount(g.lotuses);
            sounds.playCollect();
          }
        }
      }

      // ==========================================
      // HIGH-GRAPHICS 3D CANVAS RENDERING PIPELINE
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // 1. Sky & Horizon Gradient
      const horizonY = height * 0.42;
      const horizonW = width * 0.16;
      const bottomW = width * 0.92;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, "#080d1a");
      skyGrad.addColorStop(0.5, "#172554");
      skyGrad.addColorStop(1, "#f97316"); // Saffron sunset glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Sun Glow Disk
      const sunGrad = ctx.createRadialGradient(width * 0.5, horizonY * 0.75, 10, width * 0.5, horizonY * 0.75, 90);
      sunGrad.addColorStop(0, "rgba(254, 240, 138, 0.9)");
      sunGrad.addColorStop(0.5, "rgba(251, 146, 60, 0.4)");
      sunGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, horizonY * 0.75, 90, 0, Math.PI * 2);
      ctx.fill();

      // Distant City / Mountain Silhouette
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 30) {
        const h = Math.sin(x * 0.04) * 15 + Math.cos(x * 0.1) * 8;
        ctx.lineTo(x, horizonY - 12 - h);
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // 2. 3D Track & Roadway
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, "#1e293b");
      roadGrad.addColorStop(0.6, "#0f172a");
      roadGrad.addColorStop(1, "#020617");
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(width * 0.5 - horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + bottomW * 0.5, height);
      ctx.lineTo(width * 0.5 - bottomW * 0.5, height);
      ctx.closePath();
      ctx.fill();

      // Metallic Side Rails
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.5 - horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 - bottomW * 0.5, height);
      ctx.moveTo(width * 0.5 + horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + bottomW * 0.5, height);
      ctx.stroke();

      // 3 Lanes Dividers with Neon Glow
      for (let laneIdx = -1.5; laneIdx <= 1.5; laneIdx += 1) {
        const topX = width * 0.5 + laneIdx * (horizonW / 3);
        const botX = width * 0.5 + laneIdx * (bottomW / 3);

        ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(botX, height);
        ctx.stroke();
      }

      // Moving Railway Ties / Road Strips (3D perspective scaling)
      const roadZOffset = (g.distance * 2.5) % 50;
      for (let zProgress = 0; zProgress <= 1000; zProgress += 50) {
        const adjustedZ = (zProgress - roadZOffset + 1000) % 1000;
        const scale = Math.pow(1 - adjustedZ / 1000, 2);
        const lineY = horizonY + (height - horizonY) * scale;
        const currentW = horizonW + (bottomW - horizonW) * scale;

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * scale})`;
        ctx.lineWidth = Math.max(1, 3 * scale);
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - currentW * 0.5, lineY);
        ctx.lineTo(width * 0.5 + currentW * 0.5, lineY);
        ctx.stroke();
      }

      // 3. Render 3D Lotus Collectibles
      for (const item of g.items) {
        if (item.collected || item.z < 0) continue;
        const scale = Math.pow(1 - item.z / 1000, 2);
        const objY = horizonY + (height - horizonY) * scale;
        const currentW = horizonW + (bottomW - horizonW) * scale;
        const objX = width * 0.5 + item.lane * (currentW / 3);
        const size = Math.max(6, 32 * scale);
        const bob = Math.sin(item.rot * 3) * (6 * scale);

        ctx.save();
        ctx.translate(objX, objY - size * 1.2 - bob);

        // Golden Aura Glow
        ctx.fillStyle = "rgba(251, 207, 232, 0.3)";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // 3D Petals
        ctx.fillStyle = "#ec4899"; // Pink Lotus
        for (let p = 0; p < 6; p++) {
          const angle = (p * Math.PI) / 3 + item.rot;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(angle) * (size * 0.4),
            Math.sin(angle) * (size * 0.4),
            size * 0.4,
            size * 0.2,
            angle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Center Gold Core
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. Render 3D Obstacles
      for (const obs of g.obstacles) {
        if (obs.z < 0) continue;
        const scale = Math.pow(1 - obs.z / 1000, 2);
        const objY = horizonY + (height - horizonY) * scale;
        const currentW = horizonW + (bottomW - horizonW) * scale;
        const objX = width * 0.5 + obs.lane * (currentW / 3);
        const obsWidth = Math.max(14, (currentW / 3) * 0.85);
        const obsHeight = Math.max(12, 55 * scale);
        const depth3D = obsWidth * 0.35;

        ctx.save();
        ctx.translate(objX, objY);

        if (obs.type === "barricade" || obs.type === "train") {
          // 3D Express Bus / Train Box
          // Front Face
          const faceGrad = ctx.createLinearGradient(0, -obsHeight, 0, 0);
          faceGrad.addColorStop(0, obs.type === "train" ? "#ef4444" : "#f97316");
          faceGrad.addColorStop(1, obs.type === "train" ? "#991b1b" : "#c2410c");
          ctx.fillStyle = faceGrad;
          ctx.fillRect(-obsWidth * 0.5, -obsHeight, obsWidth, obsHeight);

          // 3D Top Bevel Face
          ctx.fillStyle = "#fcd34d";
          ctx.beginPath();
          ctx.moveTo(-obsWidth * 0.5, -obsHeight);
          ctx.lineTo(-obsWidth * 0.5 + depth3D, -obsHeight - depth3D * 0.5);
          ctx.lineTo(obsWidth * 0.5 + depth3D, -obsHeight - depth3D * 0.5);
          ctx.lineTo(obsWidth * 0.5, -obsHeight);
          ctx.closePath();
          ctx.fill();

          // Front Headlights / Grill
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(-obsWidth * 0.4, -obsHeight * 0.3, obsWidth * 0.25, obsHeight * 0.15);
          ctx.fillRect(obsWidth * 0.15, -obsHeight * 0.3, obsWidth * 0.25, obsHeight * 0.15);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = Math.max(1, 2 * scale);
          ctx.strokeRect(-obsWidth * 0.5, -obsHeight, obsWidth, obsHeight);

        } else if (obs.type === "lowHurdle") {
          // Low Barrier (Jump Over)
          ctx.fillStyle = "#eab308";
          ctx.fillRect(-obsWidth * 0.5, -obsHeight * 0.45, obsWidth, obsHeight * 0.45);
          // Stripes
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-obsWidth * 0.2, -obsHeight * 0.45, obsWidth * 0.15, obsHeight * 0.45);
          ctx.fillRect(obsWidth * 0.1, -obsHeight * 0.45, obsWidth * 0.15, obsHeight * 0.45);

        } else if (obs.type === "highBridge") {
          // High Bridge Archway (Slide Under)
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(-obsWidth * 0.65, -obsHeight * 1.55, obsWidth * 1.3, obsHeight * 0.5);
          // 3D Pillars
          ctx.fillStyle = "#1d4ed8";
          ctx.fillRect(-obsWidth * 0.65, -obsHeight * 1.55, obsWidth * 0.16, obsHeight * 1.55);
          ctx.fillRect(obsWidth * 0.49, -obsHeight * 1.55, obsWidth * 0.16, obsHeight * 1.55);
          // Warning Lights
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(0, -obsHeight * 1.3, Math.max(2, 5 * scale), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 5. RENDER 3D NARENDRA MODI AVATAR
      const playerX = width * 0.5 + g.laneOffset;
      const playerY = height * 0.85 - g.y;
      const isSliding = g.isSliding;

      ctx.save();
      ctx.translate(playerX, playerY);

      // Dynamic 3D Shadow (Shrinks & Fades on Jump)
      const shadowScale = Math.max(0.2, 1 - g.y / 180);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(0, 6, 26 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Speed Trail Effect when moving fast
      if (g.speed > 8) {
        ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
        ctx.beginPath();
        ctx.ellipse(0, -30, 20, 40, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Avatar Body Animation
      const bounce = Math.sin(g.animFrame * 0.45) * 4;
      const bodyY = isSliding ? 14 : bounce;

      // Legs / White Pajama
      ctx.fillStyle = "#f8fafc";
      if (isSliding) {
        ctx.fillRect(-20, -bodyY - 14, 40, 14);
      } else {
        const legSwing = Math.sin(g.animFrame * 0.45) * 14;
        ctx.fillRect(-13, -bodyY - 26, 10, 26 + legSwing);
        ctx.fillRect(3, -bodyY - 26, 10, 26 - legSwing);
      }

      // Torso / 3D Modi Jacket (Saffron Vest with Gold Buttons)
      const vestGrad = ctx.createLinearGradient(-16, -bodyY - 54, 16, -bodyY - 24);
      vestGrad.addColorStop(0, "#f97316"); // Saffron top
      vestGrad.addColorStop(1, "#ea580c"); // Dark saffron shadow
      ctx.fillStyle = vestGrad;
      ctx.beginPath();
      ctx.roundRect(-17, -bodyY - 54, 34, 30, 7);
      ctx.fill();

      // Tricolor Pocket Accent Line
      ctx.fillStyle = "#16a34a"; // Green
      ctx.fillRect(-13, -bodyY - 54, 26, 4);

      // Gold Buttons
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(0, -bodyY - 44, 2, 0, Math.PI * 2);
      ctx.arc(0, -bodyY - 36, 2, 0, Math.PI * 2);
      ctx.fill();

      // Running Arms
      ctx.fillStyle = "#ffffff";
      if (!isSliding) {
        const armCycle = Math.cos(g.animFrame * 0.45) * 15;
        ctx.fillRect(-23, -bodyY - 48, 7, 22 + armCycle);
        ctx.fillRect(16, -bodyY - 48, 7, 22 - armCycle);
      }

      // Head & White Hair / Groomed Beard
      ctx.fillStyle = "#fef08a"; // Skin tone
      ctx.beginPath();
      ctx.arc(0, -bodyY - 64, 12.5, 0, Math.PI * 2);
      ctx.fill();

      // White Hair (Top)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -bodyY - 68, 13.5, Math.PI, Math.PI * 2);
      ctx.fill();

      // White Sculpted Beard
      ctx.beginPath();
      ctx.arc(0, -bodyY - 60, 11.5, 0, Math.PI);
      ctx.fill();

      // Glasses / Spectacles with Lens Highlight
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.2;
      ctx.strokeRect(-8, -bodyY - 67, 6, 5);
      ctx.strokeRect(2, -bodyY - 67, 6, 5);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(-7, -bodyY - 66, 2, 2);
      ctx.fillRect(3, -bodyY - 66, 2, 2);

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
                MODI EXPRESS RUNNER 3D
              </h1>
              <p className="text-[9.5px] text-amber-400 font-semibold tracking-wider mt-0.5">High-Graphics Endless Runner</p>
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

        {/* 3D Canvas Screen */}
        <div
          className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-2xl touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Playing HUD Overlay */}
          {gameState === "playing" && (
            <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none z-20">
              <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/40 text-amber-300 text-[12.5px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                <Zap className="size-4 text-amber-400 fill-amber-400" />
                <span>{score.toLocaleString()} m</span>
              </div>

              <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/40 text-sky-300 text-[11.5px] font-bold tracking-wider shadow-lg flex items-center gap-1">
                <Gauge className="size-3.5 text-sky-400" />
                <span>Speed: {speedMultiplier}</span>
              </div>

              <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-500/40 text-pink-300 text-[12.5px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                <Sparkles className="size-4 text-pink-400" />
                <span>{lotusCount} Lotuses</span>
              </div>
            </div>
          )}

          {/* Start Menu Overlay */}
          {gameState === "menu" && (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 z-30">
              <div className="size-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-bounce">
                <Gamepad2 className="size-10 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">MODI RUNNER 3D</h2>
                <p className="text-[13px] font-medium text-slate-300 max-w-xs">
                  Smooth 3D gameplay! Starts at a relaxed speed and accelerates over time. Collect lotuses & dodge obstacles!
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
                <p className="text-xs text-slate-400 font-medium">Obstacle collided on track</p>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Distance Run:</span>
                  <span className="text-amber-400 font-black text-sm">{score.toLocaleString()} m</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Max Speed Reached:</span>
                  <span className="text-sky-400 font-black text-sm">{speedMultiplier}</span>
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
