"use client";

import Link from "next/link";
import { useState } from "react";
import { CountdownTimer } from "./countdown-timer";

interface LiveFounder {
  projectId: string;
  projectTitle: string;
  deadlineAt: string;
  username: string;
  displayName: string;
  xHandle?: string | null;
  avatarUrl?: string | null;
}

interface LiveFoundersTableProps {
  builders: LiveFounder[];
  totalBuildersCount?: number;
  totalShippedCount?: number;
}

export function LiveFoundersTable({
  builders,
  totalBuildersCount = 47,
  totalShippedCount = 834,
}: LiveFoundersTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initialLimit = 4;
  const hasMore = builders.length > initialLimit;
  const visibleBuilders = isExpanded ? builders : builders.slice(0, initialLimit);

  // Take first 5 builders with X handles for the avatar stack
  const stackBuilders = builders.filter((b) => !!b.xHandle).slice(0, 5);

  return (
    <div className="bg-surface border border-border rounded-md p-4 mb-6 select-none">
      {/* Tribe Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-text-muted uppercase">
          {"// THE LIVING TRIBE — BUILDING NOW"}
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-brand-orange">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          LIVE FEED
        </span>
      </div>

      {/* Avatar Stack Summary Row */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="flex items-center -space-x-2">
          {stackBuilders.map((builder) => (
            <div
              key={builder.username}
              className="w-8 h-8 rounded-full border-2 border-surface bg-rock-3 overflow-hidden shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://unavatar.io/x/${builder.xHandle}`}
                alt={builder.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ))}
          {builders.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-brand-orange/15 text-brand-orange flex items-center justify-center font-mono font-bold text-[9px] shrink-0">
              +{builders.length - 5}
            </div>
          )}
        </div>
        <div className="font-mono text-xs text-text-secondary leading-normal">
          <strong className="text-text-primary">{totalShippedCount} builders</strong> have shipped here.<br />
          {totalBuildersCount} are carving their idea right now.
        </div>
      </div>

      {/* Builders list */}
      {builders.length === 0 ? (
        <div className="p-6 text-center text-xs text-text-muted font-mono bg-rock border border-border rounded-sm">
          Nobody is carving their stone right now.
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {visibleBuilders.map((builder) => (
            <Link
              key={builder.projectId}
              href={`/project/${builder.projectId}`}
              className="flex items-center gap-3 p-2 bg-rock border border-border hover:border-text-muted rounded-sm transition-all duration-150 group cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-rock-3 border border-border overflow-hidden shrink-0 flex items-center justify-center font-mono font-bold text-[10px] text-text-secondary">
                {builder.xHandle ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://unavatar.io/x/${builder.xHandle}`}
                    alt={builder.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span>
                    {builder.displayName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[11px] font-bold text-text-primary group-hover:text-brand-orange transition-colors truncate">
                  {builder.displayName}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {builder.projectTitle}
                </div>
              </div>

              {/* Status/Timer */}
              <div className="text-right shrink-0">
                <CountdownTimer deadlineAt={builder.deadlineAt} variant="small" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Expand list button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 pt-2 border-t border-border font-mono text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-text-secondary text-center cursor-pointer transition-colors"
        >
          {isExpanded ? "← Collapse list" : `+ ${builders.length - initialLimit} MORE BUILDERS AT THE ROCK FACE →`}
        </button>
      )}
    </div>
  );
}
