"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

export type SignaturePadHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  /** Returns a copy of the transparent ink canvas (or null if empty). */
  export: () => HTMLCanvasElement | null;
};

type Point = { x: number; y: number; t: number };

/** Smooth, velocity-weighted ink on a transparent canvas. */
export const SignaturePad = forwardRef<SignaturePadHandle, { color: string; onChange?: (empty: boolean) => void; className?: string }>(
  function SignaturePad({ color, onChange, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const pts = useRef<Point[]>([]);
    const width = useRef(3);
    const empty = useRef(true);
    const colorRef = useRef(color);
    colorRef.current = color;

    const setup = useCallback(() => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const r = c.getBoundingClientRect();
      // preserve existing ink across resizes
      const prev = document.createElement("canvas");
      prev.width = c.width;
      prev.height = c.height;
      if (c.width) prev.getContext("2d")!.drawImage(c, 0, 0);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = c.getContext("2d")!;
      if (prev.width > 1) ctx.drawImage(prev, 0, 0, c.width, c.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, []);

    useEffect(() => {
      setup();
      const ro = new ResizeObserver(setup);
      if (canvasRef.current) ro.observe(canvasRef.current);
      return () => ro.disconnect();
    }, [setup]);

    const pos = (e: React.PointerEvent): Point => {
      const r = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
    };

    const down = (e: React.PointerEvent) => {
      e.preventDefault();
      canvasRef.current!.setPointerCapture(e.pointerId);
      drawing.current = true;
      const p = pos(e);
      pts.current = [p];
      width.current = 3;
      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.fillStyle = colorRef.current;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      if (empty.current) {
        empty.current = false;
        onChange?.(false);
      }
    };

    const move = (e: React.PointerEvent) => {
      if (!drawing.current) return;
      const p = pos(e);
      const arr = pts.current;
      const last = arr[arr.length - 1];
      const dist = Math.hypot(p.x - last.x, p.y - last.y);
      if (dist < 1.2) return;
      const v = dist / Math.max(1, p.t - last.t);
      // faster strokes → thinner line, eased
      const target = Math.max(1.4, Math.min(4.2, 4.4 - v * 1.6));
      width.current = width.current * 0.7 + target * 0.3;
      arr.push(p);
      if (arr.length < 3) return;
      const [a, b, c] = arr.slice(-3);
      const m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const m2 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = width.current;
      ctx.beginPath();
      ctx.moveTo(m1.x, m1.y);
      ctx.quadraticCurveTo(b.x, b.y, m2.x, m2.y);
      ctx.stroke();
    };

    const up = () => {
      drawing.current = false;
      pts.current = [];
    };

    useImperativeHandle(ref, () => ({
      clear() {
        const c = canvasRef.current!;
        c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
        empty.current = true;
        onChange?.(true);
      },
      isEmpty: () => empty.current,
      export() {
        const c = canvasRef.current;
        if (!c || empty.current) return null;
        const out = document.createElement("canvas");
        out.width = c.width;
        out.height = c.height;
        out.getContext("2d")!.drawImage(c, 0, 0);
        return out;
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        aria-label="Signature pad: draw your signature"
        role="img"
        data-cursor="none"
        className={className}
        style={{ touchAction: "none" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
    );
  },
);
