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
  Gauge,
  Users,
  Sun,
  Moon,
  Shield,
  Rocket,
  Footprints
} from "lucide-react";

export const Route = createFileRoute("/runner")({
  head: () => ({
    meta: [
      { title: "Modi Express Runner 3D — Official Subway Surfers Edition" },
      { name: "description", content: "Subway Surfers-style 3D endless runner featuring Narendra Modi. Outrun protestors, collect lotuses, use Jetpacks, Hoverboards, and Jumping Boots!" },
    ],
  }),
  component: ModiRunner3DPage,
});

// Web Audio SFX Synthesizer
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
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.15);
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

  playPowerUp() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
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
  z: number; // 0 to 1000
  type: "barricade" | "train" | "lowHurdle" | "highBridge";
}

interface Item {
  id: number;
  lane: number;
  z: number;
  collected: boolean;
  type: "lotus" | "boots" | "jetpack" | "hoverboard";
  rot: number;
}

function ModiRunner3DPage() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lotusCount, setLotusCount] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState("1.0x");
  const [protestorStatus, setProtestorStatus] = useState("Close Behind! (5m)");
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<"day" | "neon">("day");
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Engine state refs
  const gameRef = useRef<{
    lane: number; // -1, 0, 1
    targetLane: number;
    laneOffset: number; // smooth lerp
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
    protestorGap: number;
    powerUpType: "boots" | "jetpack" | "hoverboard" | null;
    powerUpTimer: number;
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
    speed: 4.5, // Start slow & smooth
    initialSpeed: 4.5,
    distance: 0,
    score: 0,
    lotuses: 0,
    obstacles: [],
    items: [],
    protestorGap: 15,
    powerUpType: null,
    powerUpTimer: 0,
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
      speed: 4.5,
      initialSpeed: 4.5,
      distance: 0,
      score: 0,
      lotuses: 0,
      obstacles: [],
      items: [],
      protestorGap: 15,
      powerUpType: null,
      powerUpTimer: 0,
      nextId: 1,
      animFrame: 0,
    };
    setScore(0);
    setLotusCount(0);
    setActivePowerUp(null);
    setSpeedMultiplier("1.0x");
    setProtestorStatus("Close Behind! (5m)");
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
      g.vy = g.powerUpType === "boots" ? 22 : 14.5; // Super Jump Boots!
      sounds.playJump();
    }
  };

  const slide = () => {
    const g = gameRef.current;
    if (!g.isSliding) {
      g.isSliding = true;
      g.slideTimer = 35;
      if (g.isJumping) g.vy = -16;
      sounds.playSlide();
    }
  };

  // Controls Listener
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

  // 60FPS Subway Surfers Game Engine
  useEffect(() => {
    if (gameState !== "playing") return;
    let running = true;

    const loop = () => {
      if (!running) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const g = gameRef.current;
      g.animFrame += 1;

      // Speed acceleration over time
      g.speed = Math.min(19.5, g.initialSpeed + (g.distance * 0.00075));
      g.distance += g.speed;
      g.score = Math.floor(g.distance / 10) + g.lotuses * 10;

      // Protestor Gap Calculation
      const speedDiff = g.speed - g.initialSpeed;
      g.protestorGap = 15 + speedDiff * 38;

      setScore(g.score);
      setSpeedMultiplier((g.speed / g.initialSpeed).toFixed(1) + "x");

      if (g.protestorGap < 40) setProtestorStatus("Close Behind! (5m)");
      else if (g.protestorGap < 120) setProtestorStatus("Falling Behind (30m)");
      else if (g.protestorGap < 300) setProtestorStatus("Far Behind (100m)");
      else setProtestorStatus("Outran Protestors! 🚀");

      // Power-Up Timer
      if (g.powerUpType) {
        g.powerUpTimer -= 1;
        if (g.powerUpTimer <= 0) {
          g.powerUpType = null;
          setActivePowerUp(null);
        }
      }

      // Smooth Lane Switching
      const targetOffset = g.targetLane * (width * 0.23);
      g.laneOffset += (targetOffset - g.laneOffset) * 0.22;

      // Jetpack Flying Boost Logic
      if (g.powerUpType === "jetpack") {
        g.y = 90; // Fly above ground & obstacles!
      } else {
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
      }

      // Slide Physics
      if (g.isSliding) {
        g.slideTimer -= 1;
        if (g.slideTimer <= 0) g.isSliding = false;
      }

      // Spawning Items & Power-ups
      const spawnInterval = Math.max(22, Math.floor(75 - g.speed * 2.8));
      if (g.animFrame % spawnInterval === 0) {
        const laneChoice = Math.floor(Math.random() * 3) - 1;
        const r = Math.random();

        if (r < 0.52) {
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
        } else if (r < 0.85) {
          // Lotus line
          for (let k = 0; k < 3; k++) {
            g.items.push({
              id: g.nextId++,
              lane: laneChoice,
              z: 1000 + k * 130,
              collected: false,
              type: "lotus",
              rot: 0,
            });
          }
        } else {
          // Power-up Item Spawn!
          const pTypes: ("boots" | "jetpack" | "hoverboard")[] = ["boots", "jetpack", "hoverboard"];
          const chosenP = pTypes[Math.floor(Math.random() * pTypes.length)];
          g.items.push({
            id: g.nextId++,
            lane: laneChoice,
            z: 1000,
            collected: false,
            type: chosenP,
            rot: 0,
          });
        }
      }

      // Move Obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        g.obstacles[i].z -= g.speed * 5;
        if (g.obstacles[i].z < -50) g.obstacles.splice(i, 1);
      }

      // Move Items
      for (let i = g.items.length - 1; i >= 0; i--) {
        g.items[i].z -= g.speed * 5;
        g.items[i].rot += 0.08;
        if (g.items[i].z < -50) g.items.splice(i, 1);
      }

      // Collision Detection
      const playerZ = 85;
      if (g.powerUpType !== "jetpack") {
        for (const obs of g.obstacles) {
          if (Math.abs(obs.z - playerZ) < 38) {
            const obsLaneX = obs.lane * (width * 0.23);
            if (Math.abs(g.laneOffset - obsLaneX) < width * 0.13) {
              let hit = false;
              if (obs.type === "barricade" || obs.type === "train") hit = true;
              else if (obs.type === "lowHurdle" && g.y < 35) hit = true;
              else if (obs.type === "highBridge" && !g.isSliding) hit = true;

              if (hit) {
                // Check if protected by Hoverboard shield
                if (g.powerUpType === "hoverboard") {
                  g.powerUpType = null;
                  setActivePowerUp(null);
                  obs.z = -100; // Consume obstacle
                  sounds.playCrash();
                } else {
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
        }
      }

      // Item & Power-up Collection
      for (const item of g.items) {
        if (!item.collected && Math.abs(item.z - playerZ) < 45) {
          const itemLaneX = item.lane * (width * 0.23);
          if (Math.abs(g.laneOffset - itemLaneX) < width * 0.13) {
            item.collected = true;

            if (item.type === "lotus") {
              g.lotuses += 1;
              setLotusCount(g.lotuses);
              sounds.playCollect();
            } else {
              // Power-up Acquired!
              g.powerUpType = item.type;
              g.powerUpTimer = 300; // 5 seconds duration
              setActivePowerUp(item.type.toUpperCase());
              sounds.playPowerUp();
            }
          }
        }
      }

      // RENDER CANVAS
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * 0.42;
      const horizonW = width * 0.16;
      const bottomW = width * 0.92;

      // 1. Sky & Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      if (themeMode === "day") {
        skyGrad.addColorStop(0, "#080d1a");
        skyGrad.addColorStop(0.5, "#172554");
        skyGrad.addColorStop(1, "#f97316");
      } else {
        skyGrad.addColorStop(0, "#030712");
        skyGrad.addColorStop(0.5, "#31104b");
        skyGrad.addColorStop(1, "#c026d3");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Sun / Neon Disc
      const sunGrad = ctx.createRadialGradient(width * 0.5, horizonY * 0.75, 10, width * 0.5, horizonY * 0.75, 90);
      sunGrad.addColorStop(0, themeMode === "day" ? "rgba(254, 240, 138, 0.9)" : "rgba(244, 114, 182, 0.9)");
      sunGrad.addColorStop(0.5, themeMode === "day" ? "rgba(251, 146, 60, 0.4)" : "rgba(192, 38, 211, 0.4)");
      sunGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, horizonY * 0.75, 90, 0, Math.PI * 2);
      ctx.fill();

      // Skyline
      ctx.fillStyle = themeMode === "day" ? "rgba(15, 23, 42, 0.85)" : "rgba(8, 13, 26, 0.95)";
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 30) {
        const h = Math.sin(x * 0.04) * 15 + Math.cos(x * 0.1) * 8;
        ctx.lineTo(x, horizonY - 12 - h);
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // 2. Track & Roadway
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
      ctx.strokeStyle = themeMode === "day" ? "#38bdf8" : "#e879f9";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.5 - horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 - bottomW * 0.5, height);
      ctx.moveTo(width * 0.5 + horizonW * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + bottomW * 0.5, height);
      ctx.stroke();

      // 3 Lanes Dividers
      for (let laneIdx = -1.5; laneIdx <= 1.5; laneIdx += 1) {
        const topX = width * 0.5 + laneIdx * (horizonW / 3);
        const botX = width * 0.5 + laneIdx * (bottomW / 3);

        ctx.strokeStyle = themeMode === "day" ? "rgba(249, 115, 22, 0.4)" : "rgba(192, 38, 211, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(botX, height);
        ctx.stroke();
      }

      // Road Lines
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

      // 3. PURSUING PROTESTORS (BEHIND MODI)
      const protestorZ = Math.max(-400, playerZ - g.protestorGap);

      if (protestorZ > -350) {
        const pScale = Math.pow(1 - Math.max(0, protestorZ) / 1000, 2);
        const pY = horizonY + (height - horizonY) * (0.88 + (15 / g.protestorGap));
        const pW = horizonW + (bottomW - horizonW) * pScale;

        [-0.8, 0, 0.8].forEach((pLaneOffset, pIndex) => {
          const pX = width * 0.5 + pLaneOffset * (pW / 3) + Math.sin(g.animFrame * 0.3 + pIndex) * 8;
          const pBounce = Math.sin(g.animFrame * 0.5 + pIndex) * 5;

          ctx.save();
          ctx.translate(pX, pY + pBounce);

          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(0, 4, 16 * pScale, 5 * pScale, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = pIndex === 0 ? "#ef4444" : pIndex === 1 ? "#3b82f6" : "#10b981";
          ctx.fillRect(-10, -32, 20, 24);

          ctx.fillStyle = "#1e293b";
          const legLeg = Math.sin(g.animFrame * 0.5 + pIndex) * 10;
          ctx.fillRect(-8, -10, 6, 12 + legLeg);
          ctx.fillRect(2, -10, 6, 12 - legLeg);

          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.arc(0, -40, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#78350f";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(8, -25);
          ctx.lineTo(14, -58);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(8, -68, 22, 12);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 1;
          ctx.strokeRect(8, -68, 22, 12);

          ctx.fillStyle = "#dc2626";
          ctx.font = "bold 7px sans-serif";
          ctx.fillText("STOP", 10, -60);

          ctx.restore();
        });
      }

      // 4. Render Items & Power-ups
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

        if (item.type === "lotus") {
          ctx.fillStyle = "rgba(251, 207, 232, 0.3)";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ec4899";
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

          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Power-up Icon Badge (Boots / Jetpack / Hoverboard)
          ctx.fillStyle = item.type === "boots" ? "#f59e0b" : item.type === "jetpack" ? "#3b82f6" : "#a855f7";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.max(8, size * 0.5)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const iconText = item.type === "boots" ? "🥾" : item.type === "jetpack" ? "🚀" : "🛹";
          ctx.fillText(iconText, 0, 0);
        }

        ctx.restore();
      }

      // 5. Render Obstacles
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
          const faceGrad = ctx.createLinearGradient(0, -obsHeight, 0, 0);
          faceGrad.addColorStop(0, obs.type === "train" ? "#ef4444" : "#f97316");
          faceGrad.addColorStop(1, obs.type === "train" ? "#991b1b" : "#c2410c");
          ctx.fillStyle = faceGrad;
          ctx.fillRect(-obsWidth * 0.5, -obsHeight, obsWidth, obsHeight);

          ctx.fillStyle = "#fcd34d";
          ctx.beginPath();
          ctx.moveTo(-obsWidth * 0.5, -obsHeight);
          ctx.lineTo(-obsWidth * 0.5 + depth3D, -obsHeight - depth3D * 0.5);
          ctx.lineTo(obsWidth * 0.5 + depth3D, -obsHeight - depth3D * 0.5);
          ctx.lineTo(obsWidth * 0.5, -obsHeight);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#fef08a";
          ctx.fillRect(-obsWidth * 0.4, -obsHeight * 0.3, obsWidth * 0.25, obsHeight * 0.15);
          ctx.fillRect(obsWidth * 0.15, -obsHeight * 0.3, obsWidth * 0.25, obsHeight * 0.15);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = Math.max(1, 2 * scale);
          ctx.strokeRect(-obsWidth * 0.5, -obsHeight, obsWidth, obsHeight);

        } else if (obs.type === "lowHurdle") {
          ctx.fillStyle = "#eab308";
          ctx.fillRect(-obsWidth * 0.5, -obsHeight * 0.45, obsWidth, obsHeight * 0.45);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-obsWidth * 0.2, -obsHeight * 0.45, obsWidth * 0.15, obsHeight * 0.45);
          ctx.fillRect(obsWidth * 0.1, -obsHeight * 0.45, obsWidth * 0.15, obsHeight * 0.45);

        } else if (obs.type === "highBridge") {
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(-obsWidth * 0.65, -obsHeight * 1.55, obsWidth * 1.3, obsHeight * 0.5);
          ctx.fillStyle = "#1d4ed8";
          ctx.fillRect(-obsWidth * 0.65, -obsHeight * 1.55, obsWidth * 0.16, obsHeight * 1.55);
          ctx.fillRect(obsWidth * 0.49, -obsHeight * 1.55, obsWidth * 0.16, obsHeight * 1.55);
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(0, -obsHeight * 1.3, Math.max(2, 5 * scale), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. RENDER NARENDRA MODI AVATAR
      const playerX = width * 0.5 + g.laneOffset;
      const playerY = height * 0.85 - g.y;
      const isSliding = g.isSliding;

      ctx.save();
      ctx.translate(playerX, playerY);

      // Hoverboard Shield Glow Effect
      if (g.powerUpType === "hoverboard") {
        ctx.strokeStyle = "#c026d3";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -30, 30, 45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Shadow
      const shadowScale = Math.max(0.2, 1 - g.y / 180);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(0, 6, 26 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jetpack Thruster Flames if active
      if (g.powerUpType === "jetpack") {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(-12, 15, 5, 15, 0, 0, Math.PI * 2);
        ctx.ellipse(12, 15, 5, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Body Animation
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

      // Torso / Modi Jacket
      const vestGrad = ctx.createLinearGradient(-16, -bodyY - 54, 16, -bodyY - 24);
      vestGrad.addColorStop(0, "#f97316");
      vestGrad.addColorStop(1, "#ea580c");
      ctx.fillStyle = vestGrad;
      ctx.beginPath();
      ctx.roundRect(-17, -bodyY - 54, 34, 30, 7);
      ctx.fill();

      ctx.fillStyle = "#16a34a";
      ctx.fillRect(-13, -bodyY - 54, 26, 4);

      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(0, -bodyY - 44, 2, 0, Math.PI * 2);
      ctx.arc(0, -bodyY - 36, 2, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.fillStyle = "#ffffff";
      if (!isSliding) {
        const armCycle = Math.cos(g.animFrame * 0.45) * 15;
        ctx.fillRect(-23, -bodyY - 48, 7, 22 + armCycle);
        ctx.fillRect(16, -bodyY - 48, 7, 22 - armCycle);
      }

      // Head & White Beard
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(0, -bodyY - 64, 12.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -bodyY - 68, 13.5, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -bodyY - 60, 11.5, 0, Math.PI);
      ctx.fill();

      // Glasses
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
  }, [gameState, themeMode]);

  return (
    <main className="min-h-screen bg-[#030712] text-white flex flex-col font-sans relative overflow-x-hidden select-none pb-10">
      {/* Navigation Header */}
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
              <p className="text-[9.5px] text-amber-400 font-semibold tracking-wider mt-0.5">Official Subway Surfers Edition</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeMode(themeMode === "day" ? "neon" : "day")}
            className="size-9 rounded-full bg-slate-900 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95"
            title="Toggle 3D Theme (Day / Cyberpunk Neon)"
          >
            {themeMode === "day" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-sky-400" />}
          </button>

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

        {/* 3D CANVAS VIEWPORT */}
        <div
          className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-2xl touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Playing HUD Overlay */}
          {gameState === "playing" && (
            <div className="absolute top-3 inset-x-3 flex flex-col gap-2 pointer-events-none z-20">
              <div className="flex justify-between items-center">
                <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/40 text-amber-300 text-[12px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                  <Zap className="size-3.5 text-amber-400 fill-amber-400" />
                  <span>{score.toLocaleString()} m</span>
                </div>

                <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/40 text-sky-300 text-[11.5px] font-bold tracking-wider shadow-lg flex items-center gap-1">
                  <Gauge className="size-3.5 text-sky-400" />
                  <span>Speed: {speedMultiplier}</span>
                </div>

                <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-500/40 text-pink-300 text-[12.5px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-pink-400" />
                  <span>{lotusCount} Lotuses</span>
                </div>
              </div>

              {/* Active Power-up Badge */}
              {activePowerUp && (
                <div className="self-center bg-purple-950/90 backdrop-blur-md px-4 py-1 rounded-full border border-purple-500/50 text-[11.5px] font-black text-purple-300 shadow-xl flex items-center gap-1.5 animate-pulse">
                  <Zap className="size-4 text-purple-400 fill-purple-400" />
                  <span>POWER-UP: {activePowerUp}</span>
                </div>
              )}

              {/* Protestors Banner */}
              <div className="self-center bg-slate-950/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-red-500/30 text-[11px] font-bold text-red-300 shadow-md flex items-center gap-1.5">
                <Users className="size-3.5 text-red-400 animate-pulse" />
                <span>Protestors: {protestorStatus}</span>
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
                <h2 className="text-3xl font-black text-white tracking-tight">SUBWAY SURFERS 3D</h2>
                <p className="text-[13px] font-medium text-slate-300 max-w-xs leading-relaxed">
                  Imported Subway Surfers engine! Features Jetpacks 🚀, Jumping Boots 🥾, Hoverboard Shields 🛹, Pursuing Protestors, and 3D Lotuses!
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
                <span>START 3D RUN</span>
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
                <p className="text-xs text-slate-400 font-medium">Obstacle impact on 3D track</p>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Distance Run:</span>
                  <span className="text-amber-400 font-black text-sm">{score.toLocaleString()} m</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Protestor Status:</span>
                  <span className="text-emerald-400 font-black text-xs">{protestorStatus}</span>
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

        {/* CONTROLS */}
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
