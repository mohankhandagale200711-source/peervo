import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const brandLetters = ['P', 'E', 'E', 'R', 'V', 'O'];
  const [visibleCount, setVisibleCount] = useState(0);

  // 1. Reveal letters P - E - E - R - V - O one by one sequentially
  useEffect(() => {
    const letterTimer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < brandLetters.length) {
          return prev + 1;
        } else {
          clearInterval(letterTimer);
          return brandLetters.length;
        }
      });
    }, 150);

    return () => clearInterval(letterTimer);
  }, []);

  // Move into the app shortly after the brand animation completes.
  useEffect(() => {
    const finishTimer = setTimeout(() => onFinish?.(), 2600);
    return () => clearTimeout(finishTimer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 p-6 select-none">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(129,140,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-600/25 via-purple-600/15 to-pink-600/20 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -top-32 right-[12%] h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/40 bg-slate-900/80 text-white shadow-2xl shadow-indigo-600/30">
          <Sparkles className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
        </div>

        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4">
          {brandLetters.map((letter, idx) => (
            <span
              key={idx}
              className={`text-5xl sm:text-7xl font-black tracking-tight transition-all duration-500 transform ${
                idx < visibleCount
                  ? 'opacity-100 scale-100 translate-y-0 text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                  : 'opacity-0 scale-50 translate-y-4'
              }`}
            >
              {letter}
            </span>
          ))}
        </div>

        <p
          className={`max-w-sm text-xs sm:text-sm font-semibold leading-6 text-slate-400 mb-8 transition-all duration-700 ${
            visibleCount >= brandLetters.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Your student space for standout portfolios, shared knowledge, and meaningful connections.
        </p>

      </div>
    </div>
  );
}
