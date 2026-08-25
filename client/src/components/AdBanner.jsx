import React from 'react';

export default function AdBanner({ slot, type = 'banner' }) {
  // Toggle this flag or set process.env.VITE_ENABLE_ADS to true when live!
  const showAds = import.meta.env.VITE_ENABLE_ADS === 'true';

  if (!showAds) return null;

  return (
    <div className="my-6 p-4 bg-slate-900/60 border border-indigo-500/20 rounded-2xl text-center overflow-hidden">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2 font-bold">
        Sponsored Advertisement
      </span>

      {/* Google AdSense or Custom Ad Banner */}
      <div className="min-h-[90px] bg-slate-800/40 rounded-xl flex items-center justify-center border border-slate-700/50">
        <p className="text-xs text-indigo-300 font-medium">
          📢 Ad Space Available • Target 1,000+ Active Students
        </p>
      </div>
    </div>
  );
}
