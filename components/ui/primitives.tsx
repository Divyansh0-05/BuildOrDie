"use client";

import React, { useState } from "react";
import { ProjectStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

// ─── STONECARD ───
interface StoneCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ember" | "gold";
}

export function StoneCard({
  children,
  variant = "default",
  className,
  ...props
}: StoneCardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-md transition-all duration-200 relative",
        variant === "ember" && "border-t-2 border-t-brand-orange",
        variant === "gold" && "border-t-2 border-t-gold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── SECTION LABEL ───
interface SectionLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function SectionLabel({ label, className, ...props }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "font-mono text-[11px] font-bold tracking-[0.15em] text-text-muted uppercase flex items-center gap-3 py-2.5 mb-4 select-none",
        className
      )}
      {...props}
    >
      <span>{"// "}{label}</span>
      <span className="flex-1 h-[1px] bg-border" />
    </div>
  );
}

// ─── STATUS BADGE ───
interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    [ProjectStatus.BUILDING]: "bg-brand-orange/10 border border-brand-orange/30 text-brand-orange",
    [ProjectStatus.LAUNCHED]: "bg-brand-green/10 border border-brand-green/30 text-brand-green",
    [ProjectStatus.WARNED]: "bg-brand-amber/10 border border-brand-amber/30 text-brand-amber",
    [ProjectStatus.KICKED]: "bg-danger/10 border border-danger/30 text-danger",
  };

  const label = {
    [ProjectStatus.BUILDING]: "BUILDING",
    [ProjectStatus.LAUNCHED]: "SHIPPED",
    [ProjectStatus.WARNED]: "AT THE CLIFF",
    [ProjectStatus.KICKED]: "KICKED",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-mono select-none",
        styles[status],
        className
      )}
    >
      {label[status]}
    </span>
  );
}

// ─── BUILDER AVATAR ───
interface BuilderAvatarProps {
  xHandle?: string | null;
  displayName: string;
  size?: number;
  className?: string;
}

export function BuilderAvatar({
  xHandle,
  displayName,
  size = 40,
  className,
}: BuilderAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div
      className={cn(
        "rounded-full border-2 border-surface overflow-hidden shrink-0 select-none flex items-center justify-center font-mono font-bold text-xs tracking-tight bg-rock-3 text-text-secondary",
        className
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {xHandle && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://unavatar.io/x/${xHandle}`}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ─── STAT BAR ───
interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface StatBarProps {
  stats: StatItem[];
  className?: string;
}

export function StatBar({ stats, className }: StatBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-md overflow-hidden select-none",
        className
      )}
    >
      {stats.map((stat, i) => (
        <div key={i} className="bg-surface p-5">
          <div
            className={cn(
              "font-mono text-3xl font-extrabold tracking-tight line-clamp-1",
              stat.color || "text-text-primary"
            )}
          >
            {stat.value}
          </div>
          <div className="font-mono text-[11px] font-bold text-text-muted mt-1.5 uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PASS CARD ───
interface PassCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  onBuy: () => void;
  isPopular?: boolean;
  ctaText?: string;
  className?: string;
}

export function PassCard({
  name,
  price,
  period,
  features,
  onBuy,
  isPopular = false,
  ctaText = "Buy once",
  className,
}: PassCardProps) {
  return (
    <StoneCard
      variant={isPopular ? "ember" : "default"}
      className={cn("p-8 flex flex-col justify-between relative", className)}
    >
      {isPopular && (
        <span className="absolute -top-3.5 right-4 bg-brand-orange text-white text-[10px] font-black tracking-widest px-3 py-1 rounded uppercase">
          MOST POPULAR
        </span>
      )}

      <div>
        <div className="text-2xl font-bold font-gothic text-text-primary tracking-wide mb-1 flex items-center gap-1.5">
          <span>{isPopular ? "🏆" : "🔥"}</span>
          <span>{name}</span>
        </div>
        <div className="flex items-baseline gap-1 mt-2.5">
          <span className="font-mono text-4xl font-extrabold text-brand-orange tracking-tighter">
            {price}
          </span>
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider font-bold">
            {period}
          </span>
        </div>

        <div className="h-[1px] bg-border my-5" />

        <ul className="space-y-2.5 mb-8">
          {features.map((feat, i) => (
            <li key={i} className="text-sm text-text-secondary flex items-start gap-2.5 leading-relaxed">
              <span className="text-brand-orange shrink-0 select-none font-bold">✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onBuy}
        className={cn(
          "w-full py-3 rounded font-mono font-bold text-sm uppercase tracking-wider transition-all hover:bg-brand-amber text-white bg-brand-orange border border-brand-orange",
          !isPopular && "bg-transparent border-border text-text-muted hover:border-brand-orange hover:text-brand-orange hover:bg-transparent"
        )}
      >
        {ctaText}
      </button>
    </StoneCard>
  );
}
