"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  deadlineAt: string;
  ideaDeclaredAt?: string;
  variant?: "default" | "small";
}

export function CountdownTimer({
  deadlineAt,
  ideaDeclaredAt,
  variant = "default",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    elapsedPercent: number;
    declaredText: string;
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const deadline = new Date(deadlineAt).getTime();
      const declared = ideaDeclaredAt
        ? new Date(ideaDeclaredAt).getTime()
        : deadline - 96 * 3600 * 1000; // default 4 days window
      
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          elapsedPercent: 100,
          declaredText: "Time is up",
        };
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Calculate elapsed percentage
      const totalDuration = deadline - declared;
      const elapsed = now - declared;
      const elapsedPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      // Calculate "declared X ago" text
      const declaredDiff = now - declared;
      const declaredDays = Math.floor(declaredDiff / (24 * 3600 * 1000));
      const declaredHours = Math.floor((declaredDiff % (24 * 3600 * 1000)) / (3600 * 1000));
      let declaredText = "declared just now";
      if (declaredDays > 0) {
        declaredText = `declared ${declaredDays}d ${declaredHours}h ago`;
      } else if (declaredHours > 0) {
        declaredText = `declared ${declaredHours}h ago`;
      }

      return { hours, minutes, seconds, totalSeconds, elapsedPercent, declaredText };
    };

    // Calculate immediately
    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineAt, ideaDeclaredAt]);

  if (!timeLeft) {
    return (
      <div className="font-mono text-text-muted animate-pulse">
        {variant === "small" ? "00:00:00" : "LOADING..."}
      </div>
    );
  }

  const { hours, minutes, seconds, totalSeconds, elapsedPercent, declaredText } = timeLeft;
  const pad = (n: number) => String(n).padStart(2, "0");

  const isExpired = totalSeconds === 0;
  const isCritical = totalSeconds < 12 * 3600; // < 12h
  const isWarning = totalSeconds < 24 * 3600; // < 24h

  // Colors
  let colorClass = "text-brand-orange";
  if (isExpired) {
    colorClass = "text-text-muted";
  } else if (isCritical) {
    colorClass = "text-brand-orange animate-pulse";
  } else if (isWarning) {
    colorClass = "text-brand-amber";
  }

  if (variant === "small") {
    return (
      <span className={cn("font-mono font-bold tracking-wider select-none", colorClass)}>
        {isExpired ? "SHIPPED/KICKED" : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
      </span>
    );
  }

  // Dynamic warning message
  let subtext = `// ${hours} hours left — stop reading this. start building.`;
  if (isExpired) {
    subtext = "// time is up. countdown showed no mercy.";
  } else if (isCritical) {
    subtext = `// under 12 hours left. this is your last stand. go.`;
  } else if (isWarning) {
    subtext = `// 24h warning — community is watching. ship it.`;
  }

  return (
    <div className="bg-rock border border-border rounded p-6 select-none relative">
      {/* Top indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11.5px] font-mono text-text-muted font-bold tracking-[0.1em] uppercase">
          {"// TIME REMAINING TO SHIP OR DIE"}
        </span>
        {isCritical && !isExpired && (
          <span className="text-[10px] font-mono text-brand-orange font-black tracking-widest uppercase animate-pulse border border-brand-orange/30 bg-brand-orange/10 px-2 py-0.5 rounded">
            CRITICAL
          </span>
        )}
      </div>

      {/* Digits Display */}
      <div className="flex items-end gap-1 sm:gap-2">
        <div className="flex flex-col items-center">
          <div className={cn("font-mono text-3xl xs:text-5xl sm:text-6xl font-black tracking-tighter leading-none", colorClass)}>
            {pad(hours)}
          </div>
          <div className="text-[10.5px] font-mono text-text-muted mt-1.5 uppercase tracking-wider font-bold">HRS</div>
        </div>

        <div className="font-mono text-2xl xs:text-4xl sm:text-5xl text-border-strong pb-3 sm:pb-4 leading-none select-none">:</div>

        <div className="flex flex-col items-center">
          <div className={cn("font-mono text-3xl xs:text-5xl sm:text-6xl font-black tracking-tighter leading-none", colorClass)}>
            {pad(minutes)}
          </div>
          <div className="text-[10.5px] font-mono text-text-muted mt-1.5 uppercase tracking-wider font-bold">MIN</div>
        </div>

        <div className="font-mono text-2xl xs:text-4xl sm:text-5xl text-border-strong pb-3 sm:pb-4 leading-none select-none">:</div>

        <div className="flex flex-col items-center">
          <div className={cn("font-mono text-3xl xs:text-5xl sm:text-6xl font-black tracking-tighter leading-none", colorClass)}>
            {pad(seconds)}
          </div>
          <div className="text-[10.5px] font-mono text-text-muted mt-1.5 uppercase tracking-wider font-bold">SEC</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              isExpired ? "bg-text-muted" : isCritical ? "bg-brand-orange" : "bg-brand-amber"
            )}
            style={{ width: `${elapsedPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2.5 text-[11.5px] font-mono text-text-muted font-bold">
          <span>{declaredText}</span>
          <span>{elapsedPercent.toFixed(0)}% elapsed</span>
        </div>
      </div>

      {/* Subtext */}
      <div className="mt-5 text-xs font-mono text-text-muted italic leading-relaxed">
        {subtext}
      </div>
    </div>
  );
}
