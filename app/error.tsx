"use client";

import React, { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#080810] flex items-center justify-center text-text-primary px-6">
      <div className="text-center space-y-5 max-w-md border border-[#1C1C30] bg-[#0E0E1C] p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-mono font-black text-[#FF4D00] uppercase tracking-wider">
          {"// APPLICATION_CRASH"}
        </h1>
        <p className="text-sm text-[#8888AA] leading-relaxed">
          An unexpected runtime anomaly occurred. The launcher has logged this event.
        </p>
        <div className="bg-[#080810] border border-[#1C1C30] p-4 rounded text-left overflow-auto max-h-36">
          <p className="text-xs font-mono text-[#F59E0B]">
            {error.message || "Unknown error"}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#FF4D00] border border-[#FF4D00]/45 text-[#080810] hover:bg-[#FF4D00]/90 font-mono text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
          >
            Retry Launch
          </button>
          <a
            href="/"
            className="inline-block px-4 py-2 border border-[#1C1C30] text-[#8888AA] hover:text-[#F0F0FF] font-mono text-xs uppercase tracking-wider rounded transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
