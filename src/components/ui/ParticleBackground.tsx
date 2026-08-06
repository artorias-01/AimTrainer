import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface FloatingTarget {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  shapeType: 'target-ring' | 'crosshair' | 'cube' | 'diamond';
  alpha: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const performanceMode = useSettingsStore((s) => s.performanceMode);
  const themeAccentColor = useSettingsStore((s) => s.themeAccentColor) || '#f5b8c9';

  useEffect(() => {
    if (performanceMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create tactical floating geometric target elements
    const targetShapes: FloatingTarget[] = [];
    const shapeTypes: FloatingTarget['shapeType'][] = ['target-ring', 'crosshair', 'cube', 'diamond'];
    const count = 16;

    for (let i = 0; i < count; i++) {
      targetShapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 14 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        shapeType: shapeTypes[i % shapeTypes.length],
        alpha: Math.random() * 0.18 + 0.08,
      });
    }

    let radarAngle = 0;

    const renderTacticalBackground = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Tactical Coordinate Grid Lines & Intersection Plus Icons
      const gridSize = 80;
      ctx.strokeStyle = '#262626';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.15;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw intersection '+' marks
      ctx.strokeStyle = themeAccentColor;
      ctx.globalAlpha = 0.22;
      for (let x = gridSize; x < width; x += gridSize * 2) {
        for (let y = gridSize; y < height; y += gridSize * 2) {
          ctx.beginPath();
          ctx.moveTo(x - 3, y);
          ctx.lineTo(x + 3, y);
          ctx.moveTo(x, y - 3);
          ctx.lineTo(x, y + 3);
          ctx.stroke();
        }
      }

      // 2. Draw Subtle Radar Sweep Line across Screen Center
      if (!prefersReducedMotion) {
        radarAngle += 0.008;
        const centerX = width / 2;
        const centerY = height / 2;
        const sweepRadius = Math.max(width, height);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(radarAngle);

        const gradient = ctx.createConicGradient(0, 0, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.12, themeAccentColor);
        gradient.addColorStop(0.13, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.04;
        ctx.beginPath();
        ctx.arc(0, 0, sweepRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Tactical Drifting Target Wireframe Geometry
      for (let i = 0; i < targetShapes.length; i++) {
        const item = targetShapes[i];

        if (!prefersReducedMotion) {
          item.x += item.vx;
          item.y += item.vy;
          item.rotation += item.rotSpeed;

          if (item.x < -30) item.x = width + 30;
          if (item.x > width + 30) item.x = -30;
          if (item.y < -30) item.y = height + 30;
          if (item.y > height + 30) item.y = -30;
        }

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        ctx.strokeStyle = themeAccentColor;
        ctx.globalAlpha = item.alpha;
        ctx.lineWidth = 1;

        const r = item.size;

        if (item.shapeType === 'target-ring') {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
          ctx.stroke();
        } else if (item.shapeType === 'crosshair') {
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-r, 0);
          ctx.lineTo(r, 0);
          ctx.moveTo(0, -r);
          ctx.lineTo(0, r);
          ctx.stroke();
        } else if (item.shapeType === 'cube') {
          ctx.strokeRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
        } else if (item.shapeType === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.lineTo(r, 0);
          ctx.moveTo(r, 0);
          ctx.lineTo(0, r);
          ctx.moveTo(0, r);
          ctx.lineTo(-r, 0);
          ctx.moveTo(-r, 0);
          ctx.lineTo(0, -r);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderTacticalBackground);
    };

    animationFrameId = requestAnimationFrame(renderTacticalBackground);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [performanceMode, themeAccentColor]);

  if (performanceMode) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
