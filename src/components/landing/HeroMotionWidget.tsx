"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface EmojiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

// Compact Waveform Bar Heights for Audio Player Pill
const WAVEFORM_HEIGHTS = [
  25, 42, 65, 38, 80, 95, 50, 75, 90, 60, 45, 82, 58, 88, 42, 70, 52, 78, 92, 45, 68, 40,
];

export function HeroMotionWidget() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const [loopStep, setLoopStep] = useState(0);

  // -----------------------------------------------------------
  // Looping Messaging Timeline
  // -----------------------------------------------------------
  useEffect(() => {
    // Timings for each step in milliseconds
    const stepDurations = [2600, 2000, 3200, 2800, 3800];
    const timer = setTimeout(() => {
      setLoopStep((prev) => (prev + 1) % 5);
    }, stepDurations[loopStep]);

    return () => clearTimeout(timer);
  }, [loopStep]);

  // -----------------------------------------------------------
  // Canvas Motion: Ambient Floating Constellation Mesh
  // -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleCount = 28;
    const particlesArray = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: Math.random() > 0.5 ? "rgba(113, 44, 249, 0.4)" : "rgba(0, 150, 200, 0.45)",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particlesArray.length; i++) {
        for (let j = i + 1; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120, 110, 245, ${0.18 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }

      particlesArray.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Emoji Burst Trigger
  const triggerEmojiBurst = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newParticles: EmojiParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      x: (Math.random() - 0.5) * 60,
      y: -25 - Math.random() * 50,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1100);
  };

  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-[560px] h-[480px] sm:h-[510px] select-none">
      {/* Background Interactive Motion Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60 dark:opacity-40"
        aria-hidden="true"
      />

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#0096c8]/25 via-cyan-500/25 to-blue-500/15 blur-3xl opacity-75 dark:opacity-50"
        aria-hidden="true"
      />

      {/* ---------------------------------------------------- */}
      {/* 1. CENTRAL MAIN CHAT WINDOW                          */}
      {/* ---------------------------------------------------- */}
      <div className="absolute left-0 sm:left-2 top-0 z-10 w-[275px] sm:w-[315px] overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 text-slate-800 shadow-[0_22px_50px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur-2xl dark:border-slate-800/90 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.01]">
        {/* Blue Header: Sokha Online */}
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#008ec0] to-[#0096c8] px-4 py-3 text-white shadow-sm">
          {/* Chevron Back Arrow */}
          <button
            type="button"
            aria-label="Back"
            className="text-white/90 hover:text-white transition-opacity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Sokha Avatar with White Ring & Online Indicator */}
          <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/80 shadow-sm bg-white/20">
            <Image
              src="/chat/avatar-sokha.png"
              alt="Sokha"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white leading-tight">Sokha</h3>
            <p className="flex items-center gap-1.5 text-[11px] text-cyan-100 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
              Online
            </p>
          </div>
        </div>

        {/* Looping Message Thread Body */}
        <div className="space-y-3.5 p-4 pb-14 min-h-[310px] max-h-[350px] overflow-hidden flex flex-col justify-start">
          <AnimatePresence mode="popLayout">
            {/* Message 1: Sophea (Always visible) */}
            <motion.div
              key="msg-1"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5"
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src="/chat/avatar-sophea.png"
                  alt="Sophea"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Sophea</span>
                <div className="mt-1 inline-block rounded-2xl rounded-tl-sm bg-slate-100/90 px-3.5 py-1.5 text-xs font-normal text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                  Hi, there! 👋
                </div>
              </div>
            </motion.div>

            {/* Loop Step 1: Maly Typing Indicator */}
            {loopStep === 1 && (
              <motion.div
                key="typing-maly"
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2.5"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <Image
                    src="/chat/avatar-maly.png"
                    alt="Maly"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Maly</span>
                  <div className="mt-1 flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100/90 px-3.5 py-2 shadow-sm dark:bg-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "160ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "320ms" }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loop Step 2+: Maly Voice Note Message with Full-Width Audio Wave */}
            {loopStep >= 2 && (
              <motion.div
                key="msg-2-audio"
                layout
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-start gap-2.5 w-full"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <Image
                    src="/chat/avatar-maly.png"
                    alt="Maly"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Maly</span>
                  {/* Full-width voice note waveform card inside message bubble */}
                  <div className="mt-1 flex w-full items-center gap-2 rounded-2xl rounded-tl-sm bg-cyan-50/80 dark:bg-cyan-950/40 p-2 border border-cyan-100 dark:border-cyan-900/60 shadow-sm">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0096c8] text-white shadow-sm">
                      <svg className="h-2.5 w-2.5 fill-current translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {/* Full width mini waveform bars */}
                    <div className="flex flex-1 items-center justify-between gap-[2px] h-4 min-w-0">
                      {[30, 60, 40, 85, 100, 48, 75, 42, 90, 65, 38, 72, 85, 50, 30].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}%`, width: "2px" }}
                          className={`rounded-full ${i < 8 ? "bg-[#0096c8]" : "bg-[#0096c8]/30"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-[#0096c8] dark:text-cyan-400 shrink-0">
                      0:14
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loop Step 3+: Outbound Reply Message */}
            {loopStep >= 3 && (
              <motion.div
                key="msg-3-reply"
                layout
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-end w-full"
              >
                <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#008ec0] to-[#0096c8] px-3.5 py-1.5 text-xs text-white shadow-sm shadow-cyan-500/20">
                  Sounds great! Let&apos;s ship it 🚀
                </div>
                <span className="mt-0.5 text-[9px] text-slate-400 font-medium">Just now</span>
              </motion.div>
            )}

            {/* Loop Step 4: Incoming Reaction from Sophea */}
            {loopStep >= 4 && (
              <motion.div
                key="msg-4-reaction"
                layout
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-start gap-2.5"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <Image
                    src="/chat/avatar-sophea.png"
                    alt="Sophea"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Sophea</span>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100/90 px-3 py-1 text-xs text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                    <span>Awesome!</span>
                    <span className="text-sm">🙌</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. FLOATING VANNAK VIDEO CARD (Top Right)            */}
      {/* ---------------------------------------------------- */}
      <div className="absolute right-0 sm:right-2 top-0 z-20 flex w-[230px] sm:w-[265px] items-start gap-2.5 rounded-2xl border border-white/80 bg-white/95 p-3.5 text-slate-800 shadow-[0_16px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/95 dark:text-slate-100 transition-transform duration-300 hover:scale-[1.02]">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200/80 shadow-sm dark:border-slate-700">
          <Image
            src="/chat/avatar-vannak.png"
            alt="Vannak"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
          {/* Blue Video Camera Badge */}
          <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#0096c8] text-white shadow">
            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
            Vannak sent you a video
          </h4>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
            Great product! It fits great and I love the texture.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. FLOATING VIDEO THUMBNAIL PREVIEW (Middle Right)   */}
      {/* ---------------------------------------------------- */}
      <div className="group absolute right-0 sm:right-3 top-24 z-20 w-[190px] sm:w-[220px] overflow-hidden rounded-2xl border-2 border-white/90 shadow-[0_20px_42px_rgba(0,0,0,0.18)] backdrop-blur-md dark:border-slate-800 transition-transform duration-300 hover:scale-[1.02]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
          <Image
            src="/chat/video-poster.jpg"
            alt="Vannak Video Thumbnail"
            width={300}
            height={225}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

          {/* Translucent Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/45 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0096c8]/90 shadow-md">
              <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. COMPACT AUDIO WAVEFORM PILL (Bottom Left)         */}
      {/* ---------------------------------------------------- */}
      <div
        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
        className="absolute -bottom-1 left-0 sm:left-3 z-30 flex w-[265px] sm:w-[310px] items-center gap-3 rounded-2xl bg-gradient-to-r from-[#008ec0] to-[#009dc8] p-3 text-white shadow-[0_16px_36px_rgba(0,150,200,0.38),0_4px_12px_rgba(0,0,0,0.15)] border border-white/30 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          aria-label={isPlayingAudio ? "Pause audio" : "Play audio"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0096c8] shadow-md transition-transform duration-200 hover:scale-105"
        >
          {isPlayingAudio ? (
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Dynamic Animated Equalizer Waveform */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex h-5 items-center gap-[2.5px] sm:gap-[3px] overflow-hidden">
            {WAVEFORM_HEIGHTS.map((h, idx) => {
              const isPlayed = idx < 10;
              return (
                <motion.span
                  key={idx}
                  animate={
                    isPlayingAudio
                      ? { scaleY: [1, 0.35 + (idx % 4) * 0.2, 1.25, 0.5, 1] }
                      : { scaleY: 1 }
                  }
                  transition={{
                    repeat: isPlayingAudio ? Infinity : 0,
                    duration: 1.1,
                    ease: "easeInOut",
                    delay: (idx % 6) * 0.08,
                  }}
                  style={{
                    height: `${h * 0.2}px`,
                    width: "2.5px",
                    transformOrigin: "center",
                  }}
                  className={`rounded-full transition-colors ${
                    isPlayed ? "bg-white" : "bg-white/40"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-0.5 flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-cyan-100">
            <span>00:08</span>
            <span>00:48</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 5. FLOATING EMOJI REACTION PILL (Bottom Right)      */}
      {/* ---------------------------------------------------- */}
      <div className="absolute right-0 sm:right-6 bottom-4 sm:bottom-6 z-30 flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 transition-transform duration-300 hover:scale-[1.02]">
        {["😍", "😆", "👍", "😋", "🙌"].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={(e) => triggerEmojiBurst(emoji, e)}
            className="text-base sm:text-lg transition-transform duration-150 hover:scale-135 active:scale-95 focus:outline-none"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Interactive Emoji Burst Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, scale: 0.8, x: p.x, y: 0 }}
            animate={{
              opacity: 0,
              scale: 1.6,
              x: p.x + (Math.random() - 0.5) * 25,
              y: p.y - 70,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="pointer-events-none absolute text-2xl z-50 select-none"
            style={{ right: "12%", bottom: "40px" }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default HeroMotionWidget;
