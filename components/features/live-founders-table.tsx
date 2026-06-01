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
}

export function LiveFoundersTable({ builders }: LiveFoundersTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initialLimit = 5;
  const hasMore = builders.length > initialLimit;
  const visibleBuilders = isExpanded ? builders : builders.slice(0, initialLimit);

  return (
    <div className="w-full bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
          {"// live.builders.active"}
        </h3>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-brand-green font-bold uppercase tracking-wider bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping" />
          Live
        </span>
      </div>

      {builders.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted font-mono">
          Nobody is building right now. Be the first to start the clock.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[10px] font-mono text-text-muted uppercase tracking-wider select-none bg-bg-primary/30">
                <th className="py-3 px-5 font-semibold">Founder</th>
                <th className="py-3 px-5 font-semibold">Project</th>
                <th className="py-3 px-5 font-semibold text-right">Time Remaining</th>
                <th className="py-3 px-5 font-semibold text-right">X Profile</th>
              </tr>
            </thead>
            <tbody>
              {visibleBuilders.map((builder) => (
                <LiveFounderRow key={builder.projectId} builder={builder} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3.5 border-t border-border font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand-orange hover:bg-bg-primary/20 transition-all text-center"
        >
          {isExpanded
            ? "← Collapse list"
            : `+ ${builders.length - initialLimit} more building now →`}
        </button>
      )}
    </div>
  );
}

function LiveFounderRow({ builder }: { builder: LiveFounder }) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = builder.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <tr className="border-b border-border/40 hover:bg-bg-primary/40 transition-colors group cursor-pointer">
      {/* Founder Name & Avatar */}
      <td className="py-4 px-5">
        <Link href={`/project/${builder.projectId}`} className="flex items-center gap-3">
          {builder.xHandle && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://unavatar.io/x/${builder.xHandle}`}
              alt={builder.displayName}
              className="w-8 h-8 rounded-full border border-border-strong object-cover shrink-0 select-none"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-border-strong text-text-secondary flex items-center justify-center font-mono font-bold text-[10px] tracking-tighter shrink-0 select-none border border-border">
              {initials}
            </div>
          )}
          <div>
            <div className="text-text-primary text-sm font-semibold group-hover:text-brand-orange transition-colors">
              {builder.displayName}
            </div>
            <div className="text-text-muted text-[11px] font-mono leading-none">
              @{builder.username}
            </div>
          </div>
        </Link>
      </td>

      {/* Project Title */}
      <td className="py-4 px-5">
        <Link href={`/project/${builder.projectId}`} className="block">
          <span className="text-text-secondary text-sm font-medium line-clamp-1 group-hover:text-text-primary transition-colors">
            {builder.projectTitle}
          </span>
        </Link>
      </td>

      {/* Live Timer */}
      <td className="py-4 px-5 text-right font-mono text-sm">
        <Link href={`/project/${builder.projectId}`} className="inline-block">
          <CountdownTimer deadlineAt={builder.deadlineAt} variant="small" />
        </Link>
      </td>

      {/* X Link */}
      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
        {builder.xHandle ? (
          <a
            href={`https://x.com/${builder.xHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-text-muted hover:text-brand-orange hover:bg-brand-orange/5 border border-transparent hover:border-brand-orange/20 px-2 py-1 rounded transition-all"
          >
            <svg
              className="w-2.5 h-2.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @{builder.xHandle}
          </a>
        ) : (
          <span className="text-text-dim text-[11px] font-mono select-none">—</span>
        )}
      </td>
    </tr>
  );
}
