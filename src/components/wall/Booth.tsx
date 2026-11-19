"use client";

import { Camera, Check, ImageUp, Loader2, PenLine, RotateCcw, Type, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { wallConfig } from "@/data/wall";
import { cn, EASE_OUT } from "@/lib/utils";
import { applyFilter, CARD, composePolaroid, FILTERS, type FilterName, type Signature, squareCrop, STRIP } from "./compose";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";

export type WallFont = { label: string; family: string; scale: number };
export type Submitted = { id: string; dataUrl: string; createdAt: string };

const INKS = [
  { id: "ink", label: "Black ink", color: "#1b1b19" },
  { id: "blue", label: "Blue pen", color: "#2a4bb8" },
  { id: "pink", label: "Pink marker", color: "#c2418f" },
];

// strip position inside the card, as percentages (matches compose.ts)
const stripStyle = {
  left: `${(STRIP.x / CARD.w) * 100}%`,
  top: `${(STRIP.y / CARD.h) * 100}%`,
  width: `${(STRIP.w / CARD.w) * 100}%`,
  height: `${(STRIP.h / CARD.h) * 100}%`,
};

type CamState = "idle" | "starting" | "live" | "error";

export function Booth({
  fonts,
  notice,
  onClose,
  onSubmitted,
}: {
  fonts: WallFont[];
  notice?: string;
  onClose: () => void;
  onSubmitted: (s: Submitted) => void;
}) {
  const [step, setStep] = useState<"photo" | "sign" | "done">("photo");
  const [cam, setCam] = useState<CamState>("idle");
  const [camError, setCamError] = useState("");
  const [raw, setRaw] = useState<HTMLCanvasElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterName>("natural");
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [ink, setInk] = useState(INKS[0].color);
  const [text, setText] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const [padEmpty, setPadEmpty] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [finalUrl, setFinalUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const padRef = useRef<SignaturePadHandle>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // escape to close, lock scroll, stop camera on unmount
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      stopCamera();
    };
  }, [onClose, stopCamera]);

  // re-render the filtered photo when the source or filter changes
  useEffect(() => {
    if (!raw) return setPhotoUrl(null);
    const c = document.createElement("canvas");
    c.width = raw.width;
    c.height = raw.height;
    c.getContext("2d")!.drawImage(raw, 0, 0);
    applyFilter(c, filter);
    setPhotoUrl(c.toDataURL("image/jpeg", 0.92));
  }, [raw, filter]);

  const startCamera = async () => {
    setCamError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam("error");
      setCamError("This browser can't open the camera here. Upload a photo instead.");
      return;
    }
    setCam("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCam("live");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch (e) {
      setCam("error");
      setCamError(
        (e as DOMException)?.name === "NotAllowedError"
          ? "Camera access was blocked. Allow it in your browser, or upload a photo instead."
          : "Couldn't start the camera. You can upload a photo instead.",
      );
    }
  };

  const shoot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const capture = () => {
      setRaw(squareCrop(v, v.videoWidth, v.videoHeight, CARD.photo, true));
      setFlash(true);
      window.setTimeout(() => setFlash(false), 260);
      stopCamera();
      setCam("idle");
      setCount(null);
    };
    if (reduced) return capture();
    let n = 3;
    setCount(n);
    const tick = () => {
      n -= 1;
      if (n === 0) capture();
      else {
        setCount(n);
        window.setTimeout(tick, 700);
      }
    };
    window.setTimeout(tick, 700);
  };

  const onFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setRaw(squareCrop(img, img.naturalWidth, img.naturalHeight));
      URL.revokeObjectURL(url);
      stopCamera();
      setCam("idle");
    };
    img.src = url;
  };

  const retake = () => {
    setRaw(null);
    setStep("photo");
    startCamera();
  };

  const canSubmit = mode === "draw" ? !padEmpty : text.trim().length > 0;

  const submit = async () => {
    if (!raw || !canSubmit) return;
    setBusy(true);
    setError("");
    try {
      const photo = document.createElement("canvas");
      photo.width = raw.width;
      photo.height = raw.height;
      photo.getContext("2d")!.drawImage(raw, 0, 0);
      applyFilter(photo, filter);
      let sig: Signature | null = null;
      if (mode === "draw") {
        const c = padRef.current?.export();
        if (c) sig = { kind: "draw", canvas: c };
      } else {
        const f = fonts[fontIdx];
        sig = { kind: "type", text: text.trim(), fontFamily: f.family, color: ink, scale: f.scale };
      }
      const dataUrl = await composePolaroid(photo, sig);
      const res = await fetch("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, website: honeypot }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong. Try again?");
      setFinalUrl(dataUrl);
      onSubmitted({ id: json.id, dataUrl, createdAt: new Date().toISOString() });
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const font = fonts[fontIdx];

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/92 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Add your polaroid"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="relative w-full max-w-5xl border-line bg-ink-2 sm:border"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[10px] text-accent">{step === "photo" ? "01" : step === "sign" ? "02" : "✓"}</span>
            <span className="label text-paper">{step === "photo" ? "Take your photo" : step === "sign" ? "Sign it" : "Pinned"}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center text-muted hover:text-paper">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10 md:p-8">
          {/* polaroid preview */}
          <div className="mx-auto w-full max-w-[380px]">
            {finalUrl ? (
              <motion.img
                src={finalUrl}
                alt="Your finished polaroid"
                initial={{ rotate: 0, y: 0 }}
                animate={{ rotate: -2.5, y: -4 }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                className="w-full shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)]"
              />
            ) : (
            <div
              className="relative w-full bg-[#f4f1ea] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] [container-type:inline-size]"
              style={{ aspectRatio: `${CARD.w}/${CARD.h}` }}
            >
              <div
                className="absolute overflow-hidden bg-[#1a1a18]"
                style={{
                  left: `${(CARD.pad / CARD.w) * 100}%`,
                  top: `${(CARD.pad / CARD.h) * 100}%`,
                  width: `${(CARD.photo / CARD.w) * 100}%`,
                  aspectRatio: "1",
                }}
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Your photo" className="h-full w-full object-cover" />
                ) : cam === "live" || cam === "starting" ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="h-full w-full -scale-x-100 object-cover"
                    style={{ filter: FILTERS.find((f) => f.id === filter)!.css }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[#77746c]">
                    <Camera size={22} strokeWidth={1.5} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{cam === "error" ? "no camera" : "say cheese"}</span>
                  </div>
                )}
                <AnimatePresence>
                  {count !== null && (
                    <motion.span
                      key={count}
                      initial={{ scale: 1.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center font-pixel text-[64px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
                {flash && <span className="absolute inset-0 bg-white" />}
              </div>

              {/* signature strip */}
              <div className="absolute" style={stripStyle}>
                {step === "sign" && mode === "draw" && (
                  <SignaturePad ref={padRef} color={ink} onChange={setPadEmpty} className="h-full w-full cursor-crosshair" />
                )}
                {step === "sign" && mode === "type" && (
                  <div
                    className="flex h-full items-center justify-center overflow-hidden whitespace-nowrap leading-none"
                    style={{ fontFamily: font.family, color: ink, fontSize: `${(92 / CARD.w) * 100 * font.scale}cqw` }}
                  >
                    {text || <span className="opacity-25">your name</span>}
                  </div>
                )}
                {step === "sign" && mode === "draw" && padEmpty && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#1b1b19]/30">
                    sign here
                  </span>
                )}
              </div>
            </div>
            )}
          </div>

          {/* controls */}
          <div className="flex min-w-0 flex-col">
            {step === "photo" && (
              <>
                <p className="text-[15px] leading-relaxed text-muted">
                  Snap a photo for the wall. Use your camera, or upload one if you&apos;d rather.
                </p>
                {notice && (
                  <p className="mt-4 border-l-2 border-accent/60 pl-3 font-mono text-[11.5px] leading-relaxed text-accent">{notice}</p>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  {!raw && cam !== "live" && (
                    <button type="button" onClick={startCamera} disabled={cam === "starting"} className="inline-flex h-11 items-center gap-2 bg-paper px-5 text-[14px] font-medium text-ink transition-colors hover:bg-accent disabled:opacity-60">
                      {cam === "starting" ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                      Open camera
                    </button>
                  )}
                  {cam === "live" && !raw && (
                    <button type="button" onClick={shoot} disabled={count !== null} className="inline-flex h-11 items-center gap-2 bg-accent px-5 text-[14px] font-medium text-ink disabled:opacity-60">
                      <span className="h-3 w-3 rounded-full border-2 border-ink" /> Take photo
                    </button>
                  )}
                  {raw && (
                    <button type="button" onClick={retake} className="inline-flex h-11 items-center gap-2 border border-line-strong px-4 text-[14px] text-paper hover:border-paper">
                      <RotateCcw size={14} /> Retake
                    </button>
                  )}
                  <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-11 items-center gap-2 border border-line-strong px-4 text-[14px] text-paper hover:border-paper">
                    <ImageUp size={15} /> {raw ? "Use a different photo" : "Upload instead"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </div>
                {camError && <p className="mt-4 font-mono text-[12px] text-accent">{camError}</p>}

                <fieldset className="mt-8">
                  <legend className="label mb-3">Filter</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={filter === f.id}
                        onClick={() => setFilter(f.id)}
                        className={cn(
                          "h-8 border px-3 font-mono text-[11px] transition-colors",
                          filter === f.id ? "border-accent/60 bg-accent/10 text-accent" : "border-line text-muted hover:text-paper",
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-auto flex justify-end pt-10">
                  <button type="button" disabled={!raw} onClick={() => setStep("sign")} className="inline-flex h-11 items-center gap-2 bg-paper px-5 text-[14px] font-medium text-ink transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30">
                    Next: sign it →
                  </button>
                </div>
              </>
            )}

            {step === "sign" && (
              <>
                <div className="flex border border-line p-0.5 font-mono text-[12px]" role="tablist">
                  {(["draw", "type"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={cn("flex h-9 flex-1 items-center justify-center gap-2 transition-colors", mode === m ? "bg-paper text-ink" : "text-muted hover:text-paper")}
                    >
                      {m === "draw" ? <PenLine size={13} /> : <Type size={13} />}
                      {m === "draw" ? "Draw it" : "Type it"}
                    </button>
                  ))}
                </div>

                {mode === "draw" ? (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-[14px] text-muted">Sign on the bottom of the polaroid.</p>
                    <button type="button" onClick={() => padRef.current?.clear()} className="shrink-0 font-mono text-[11px] text-dim underline-offset-4 hover:text-paper hover:underline">
                      clear
                    </button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <label htmlFor="sig-text" className="label">
                      Your name
                    </label>
                    <input
                      id="sig-text"
                      value={text}
                      maxLength={wallConfig.maxSignature}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type your name"
                      autoComplete="off"
                      className="mt-2 h-11 w-full border border-line bg-ink px-3 text-[15px] text-paper outline-none placeholder:text-faint focus:border-accent/60"
                    />
                    <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {fonts.map((f, i) => (
                        <button
                          key={f.label}
                          type="button"
                          aria-pressed={fontIdx === i}
                          aria-label={`Font: ${f.label}`}
                          onClick={() => setFontIdx(i)}
                          className={cn(
                            "flex h-12 items-center justify-center overflow-hidden border px-2 text-[20px] leading-none transition-colors",
                            fontIdx === i ? "border-accent/60 bg-accent/10 text-paper" : "border-line text-muted hover:text-paper",
                          )}
                          style={{ fontFamily: f.family, fontSize: 20 * f.scale }}
                        >
                          {text.trim().split(" ")[0] || "Signed"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <fieldset className="mt-6">
                  <legend className="label mb-3">Ink</legend>
                  <div className="flex gap-2">
                    {INKS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-label={c.label}
                        aria-pressed={ink === c.color}
                        onClick={() => setInk(c.color)}
                        className={cn("h-8 w-8 rounded-full border-2 transition-transform hover:scale-105", ink === c.color ? "border-paper" : "border-transparent")}
                        style={{ background: c.color }}
                      />
                    ))}
                  </div>
                </fieldset>

                {/* honeypot */}
                <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />

                <p className="mt-8 font-mono text-[11px] leading-relaxed text-dim">
                  Polaroids go up after a quick approval. By pinning, you&apos;re okay with yours being shown publicly on this site.
                </p>
                {error && <p className="mt-3 font-mono text-[12px] text-accent">{error}</p>}

                <div className="mt-auto flex items-center justify-between gap-3 pt-8">
                  <button type="button" onClick={() => setStep("photo")} className="font-mono text-[12px] text-muted hover:text-paper">
                    ← Back
                  </button>
                  <button type="button" disabled={!canSubmit || busy} onClick={submit} className="inline-flex h-11 items-center gap-2 bg-accent px-5 text-[14px] font-medium text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-30">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                    Pin it to the wall
                  </button>
                </div>
              </>
            )}

            {step === "done" && (
              <div className="flex h-full flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-ink">
                  <Check size={18} />
                </div>
                <h3 className="mt-5 text-[26px] font-medium tracking-[-0.03em]">You&apos;re on the wall.</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
                  You can see your polaroid now. Everyone else will see it once I&apos;ve approved it. Want a redo? You can
                  retake it anytime from the wall.
                </p>
                <div className="mt-auto pt-10">
                  <button type="button" onClick={onClose} className="inline-flex h-11 items-center bg-paper px-5 text-[14px] font-medium text-ink hover:bg-accent">
                    See the wall
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
