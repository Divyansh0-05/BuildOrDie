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
    <div className="bg-surface border border-border rounded-md p-4 sm:p-5 mb-6 select-none w-full max-w-full overflow-hidden">
      {/* Tribe Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-4">
        <span className="font-mono text-[10px] xs:text-[11.5px] font-bold tracking-[0.08em] xs:tracking-[0.12em] text-text-muted uppercase">
          {"// THE LIVING TRIBE — BUILDING NOW"}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] xs:text-[11px] font-mono font-bold uppercase text-brand-orange">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          LIVE FEED
        </span>
      </div>

      {/* Avatar Stack Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4.5">
        <div className="flex items-center -space-x-1.5 sm:-space-x-2 md:-space-x-2.5 select-none">
          {stackBuilders.map((builder) => (
            <div
              key={builder.username}
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-surface bg-rock-3 overflow-hidden shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://unavatar.io/x/${builder.xHandle}`}
                alt={builder.displayName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ))}
          {builders.length > 5 && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-surface bg-brand-orange/15 text-brand-orange flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] shrink-0">
              +{builders.length - 5}
            </div>
          )}
        </div>
        <div className="font-mono text-xs sm:text-sm text-text-secondary leading-normal">
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
        <div className="flex flex-col gap-1.5 w-full">
          {visibleBuilders.map((builder) => (
            <Link
              key={builder.projectId}
              href={`/project/${builder.projectId}`}
              className="flex items-start md:items-center gap-3.5 p-3 bg-rock border border-border hover:border-text-muted rounded-sm transition-all duration-150 group cursor-pointer w-full max-w-full"
            >
              {/* Avatar */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-rock-3 border border-border overflow-hidden shrink-0 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-text-secondary mt-0.5 md:mt-0">
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

              {/* Info & Status stacked container */}
              <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                {/* Text Info */}
                <div className="min-w-0">
                  <div className="font-mono text-[13px] md:text-sm font-bold text-text-primary group-hover:text-brand-orange transition-colors truncate">
                    {builder.displayName}
                  </div>
                  <div className="text-[11.5px] md:text-xs text-text-muted truncate mt-0.5">
                    {builder.projectTitle}
                  </div>
                </div>

                {/* Status/Timer */}
                <div className="md:text-right shrink-0 mt-1 md:mt-0 flex items-center md:block">
                  <span className="uppercase text-[9px] text-text-muted font-bold md:hidden mr-1.5">Clock:</span>
                  <CountdownTimer deadlineAt={builder.deadlineAt} variant="small" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Expand list button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2.5 pt-2.5 border-t border-border font-mono text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-text-secondary text-center cursor-pointer transition-colors"
        >
          {isExpanded ? "← Collapse list" : `+ ${builders.length - initialLimit} MORE BUILDERS AT THE ROCK FACE →`}
        </button>
      )}
    </div>
  );
}
