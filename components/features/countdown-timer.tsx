"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadlineAt: string;
  variant?: "default" | "small";
}

export function CountdownTimer({ deadlineAt, variant = "default" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = new Date(deadlineAt).getTime();
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds, totalSeconds };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineAt]);

  if (!timeLeft) {
    return (
      <div className="font-mono text-text-muted animate-pulse">
        {variant === "small" ? "00:00:00" : "LOADING..."}
      </div>
    );
  }

  const { hours, minutes, seconds, totalSeconds } = timeLeft;

  // Format with leading zeros
  const pad = (n: number) => String(n).padStart(2, "0");
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Determine urgency and colors
  // >24h = brand-orange
  // <24h = brand-amber
  // <6h = brand-orange + animate-pulse
  const isExpired = totalSeconds === 0;
  const isCritical = totalSeconds < 6 * 3600; // < 6h
  const isWarning = totalSeconds < 24 * 3600; // < 24h

  let timerColorClass = "text-brand-orange";
  if (isExpired) {
    timerColorClass = "text-text-muted";
  } else if (isCritical) {
    timerColorClass = "text-brand-orange animate-pulse";
  } else if (isWarning) {
    timerColorClass = "text-brand-amber";
  }

  if (variant === "small") {
    return (
      <span className={`font-mono font-bold tracking-wider ${timerColorClass}`}>
        {formattedTime}
      </span>
    );
  }

  // Calculate elapsed progress based on standard 96 hour (4 day) window
  const totalWindowSeconds = 96 * 3600;
  const elapsedSeconds = Math.max(0, totalWindowSeconds - totalSeconds);
  const progressPercent = Math.min(100, (elapsedSeconds / totalWindowSeconds) * 100);

  // Contextual subtext
  let subtext = "Still time. Stop reading. Start building.";
  if (isExpired) {
    subtext = "Time is up. Project kicked.";
  } else if (isCritical) {
    subtext = "Final hours. This is your last chance. Go.";
  } else if (isWarning) {
    subtext = "24h left — ship something, anything.";
  }

  return (
    <div className="w-full flex flex-col gap-3.5 bg-surface border border-border p-5 rounded-lg">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-mono text-text-muted font-semibold uppercase tracking-wider">
          {"// countdown.remaining"}
        </span>
        {isCritical && !isExpired && (
          <span className="text-[10px] font-mono text-brand-orange uppercase tracking-wider font-bold animate-pulse">
            CRITICAL
          </span>
        )}
      </div>

      <div className={`text-4xl sm:text-5xl font-mono font-black tracking-widest leading-none ${timerColorClass}`}>
        {formattedTime}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-border h-2 rounded-full overflow-hidden">
        <div
          className="bg-brand-orange h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-text-muted uppercase tracking-wider font-semibold">
          {progressPercent.toFixed(0)}% elapsed
        </span>
        <span className="text-text-secondary font-semibold">{subtext}</span>
      </div>
    </div>
  );
}
