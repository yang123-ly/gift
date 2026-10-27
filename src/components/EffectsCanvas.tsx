import { useEffect, useRef } from 'react';
import { EffectType } from '../types';

interface Props {
  effect: EffectType | null;
  onDone: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle' | 'star';
}

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#facc15', '#22d3ee'];
const GOLD = ['#fbbf24', '#f59e0b', '#fcd34d', '#d97706'];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeConfetti(w: number): Particle[] {
  return Array.from({ length: 180 }, () => ({
    x: rand(0, w),
    y: rand(-400, -20),
    vx: rand(-1.5, 1.5),
    vy: rand(2, 6),
    size: rand(6, 14),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.15, 0.15),
    life: 0,
    maxLife: 999,
    shape: 'rect' as const
  }));
}

function makeGoldRain(w: number): Particle[] {
  return Array.from({ length: 160 }, () => ({
    x: rand(0, w),
    y: rand(-500, -20),
    vx: rand(-1, 1),
    vy: rand(3, 8),
    size: rand(10, 22),
    color: GOLD[Math.floor(Math.random() * GOLD.length)],
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.1, 0.1),
    life: 0,
    maxLife: 999,
    shape: 'circle' as const
  }));
}

function makeFireworks(w: number, h: number): Particle[] {
  const ps: Particle[] = [];
  for (let b = 0; b < 6; b++) {
    const cx = rand(w * 0.15, w * 0.85);
    const cy = rand(h * 0.15, h * 0.45);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 36; i++) {
      const a = (Math.PI * 2 * i) / 36 + rand(-0.1, 0.1);
      const sp = rand(2, 7);
      ps.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: rand(2, 4),
        color,
        rot: 0,
        vr: 0,
        life: -b * 18,
        maxLife: rand(50, 80),
        shape: 'circle'
      });
    }
  }
  return ps;
}

function makeStarBurst(w: number, h: number): Particle[] {
  const ps: Particle[] = [];
  for (let i = 0; i < 170; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(3, 14);
    ps.push({
      x: w / 2,
      y: h / 2,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      size: rand(4, 12),
      color: Math.random() > 0.5 ? '#fde047' : COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      life: 0,
      maxLife: rand(40, 70),
      shape: 'star'
    });
  }
  return ps;
}

function drawStar(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const inner = outer + Math.PI / 5;
    ctx.lineTo(Math.cos(outer) * p.size, Math.sin(outer) * p.size);
    ctx.lineTo(Math.cos(inner) * p.size * 0.45, Math.sin(inner) * p.size * 0.45);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function EffectsCanvas({ effect, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!effect || effect === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    let particles: Particle[] = [];
    if (effect === 'confetti') particles = makeConfetti(w);
    else if (effect === 'goldRain') particles = makeGoldRain(w);
    else if (effect === 'fireworks') particles = makeFireworks(w, h);
    else particles = makeStarBurst(w, h);

    let raf = 0;
    const start = performance.now();
    const DURATION = 3500;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const elapsed = performance.now() - start;
      const fade = elapsed > DURATION - 600 ? Math.max(0, (DURATION - elapsed) / 600) : 1;

      for (const p of particles) {
        p.life++;
        if (p.life < 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if (effect === 'fireworks' || effect === 'starBurst') {
          p.vy += 0.08;
          p.vx *= 0.985;
          p.vy *= 0.985;
        }
        if (effect === 'confetti') {
          p.vx += Math.sin(p.life * 0.05) * 0.05;
          if (p.y > h + 30) {
            p.y = -20;
            p.x = rand(0, w);
          }
        }
        if (effect === 'goldRain') {
          if (p.y > h + 30) {
            p.y = -20;
            p.x = rand(0, w);
          }
        }

        const alpha =
          (effect === 'fireworks' || effect === 'starBurst')
            ? Math.max(0, 1 - p.life / p.maxLife) * fade
            : fade;
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;

        if (p.shape === 'rect') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          if (effect === 'goldRain') {
            const sx = Math.abs(Math.cos(p.rot));
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(Math.max(0.15, sx), 1);
            ctx.fillStyle = p.color;
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            if (sx > 0.6) {
              ctx.fillStyle = 'rgba(120,53,15,0.8)';
              ctx.font = `bold ${p.size * 0.6}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('$', 0, 1);
            }
            ctx.restore();
          } else {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else {
          drawStar(ctx, p);
        }
      }
      ctx.globalAlpha = 1;

      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
        onDone();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [effect, onDone]);

  if (!effect || effect === 'none') return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />;
}
