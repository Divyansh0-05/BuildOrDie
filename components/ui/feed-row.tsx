"use client";

import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { VoteButton } from "@/components/features/vote-button";
import { StatusBadge } from "./primitives";
import { CountdownTimer } from "@/components/features/countdown-timer";
import { cn } from "@/lib/utils";

interface FeedRowProps {
  rank: number | string;
  project: {
    id: string;
    title: string;
    tagline: string;
    status: ProjectStatus;
    logoUrl?: string | null;
    tags: string[];
    toolsUsed: string[];
    voteCount: number;
    deadlineAt: string;
    isBoosted: boolean;
    user: {
      username: string;
      displayName: string;
      plan: "FREE" | "FOUNDER";
      xHandle?: string | null;
    };
  };
  hasVoted?: boolean;
}

export function FeedRow({ rank, project, hasVoted = false }: FeedRowProps) {
  const rankStr = String(rank).padStart(2, "0");
  const isBuilding =
    project.status === ProjectStatus.BUILDING || project.status === ProjectStatus.WARNED;

  return (
    <div
      className={cn(
        "group py-7 px-4 border-b border-border hover:bg-surface/30 transition-all duration-150 relative",
        project.isBoosted && "bg-brand-orange/[0.02] border-l-2 border-l-brand-orange"
      )}
    >
      {/* Mobile Layout (stacked structure to prevent squishing and text overflow) */}
      <div className="flex flex-col sm:hidden w-full gap-3 select-none">
        {/* Top bar: Rank, Logo, Title/Badges, Upvote */}
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Rank Indicator */}
            <span className="font-mono text-sm text-text-muted/60 w-6 shrink-0 pt-3 select-none">
              {rankStr}
            </span>

            {/* Project Logo/Icon */}
            <Link href={`/project/${project.id}`} className="shrink-0 pt-1">
              <div className="w-12 h-12 rounded border border-border bg-rock-3 flex items-center justify-center font-mono font-bold text-lg text-text-secondary select-none group-hover:border-brand-orange/45 transition-colors">
                {project.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.logoUrl}
                    alt={project.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span>{project.title.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            </Link>

            {/* Title & Badges */}
            <div className="min-w-0 flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/project/${project.id}`}
                  className="font-mono text-base font-bold text-text-primary group-hover:text-brand-orange transition-colors truncate"
                >
                  {project.title}
                </Link>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {project.isBoosted && (
                  <span className="text-[9px] font-mono text-brand-orange font-bold uppercase tracking-widest bg-brand-orange/10 border border-brand-orange/20 px-1.5 py-0.5 rounded">
                    BOOSTED
                  </span>
                )}
                {project.user.plan === "FOUNDER" && (
                  <span className="text-[9px] font-mono text-gold font-bold uppercase tracking-widest bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded">
                    FOUNDER
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upvote Column */}
          <div className="shrink-0 w-10 flex flex-col items-center pt-1.5">
            <VoteButton
              projectId={project.id}
              initialVotes={project.voteCount}
              initialVoted={hasVoted}
              variant="feed"
            />
          </div>
        </div>

        {/* Tagline/Description - Spans full width of card */}
        <Link
          href={`/project/${project.id}`}
          className="block text-sm text-text-secondary leading-relaxed line-clamp-3 hover:text-text-primary transition-colors"
        >
          {project.tagline}
        </Link>

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-muted mt-1">
          <span className="text-text-secondary hover:text-brand-orange transition-colors font-bold">
            @{project.user.username}
          </span>
          <span className="text-border-strong select-none">•</span>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="bg-rock-3 border border-border px-2 py-0.5 rounded-[2px] text-text-muted uppercase text-[10px]"
              >
                {t}
              </span>
            ))}
            {project.toolsUsed.slice(0, 2).map((tool) => (
              <span
                key={tool}
                className="bg-brand-orange/5 border border-brand-orange/10 px-2 py-0.5 rounded-[2px] text-text-secondary text-[10px]"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Clock Countdown */}
        {isBuilding && (
          <div className="flex items-center gap-1.5 w-full mt-2 pt-2 border-t border-border/30">
            <span className="uppercase text-[10px] text-text-muted font-bold">Clock:</span>
            <CountdownTimer deadlineAt={project.deadlineAt} variant="small" />
          </div>
        )}
      </div>

      {/* Desktop Layout (horizontal layout as originally designed) */}
      <div className="hidden sm:flex items-start gap-5 w-full">
        {/* Rank Indicator */}
        <span className="font-mono text-sm text-text-muted/60 w-6 shrink-0 pt-3 select-none">
          {rankStr}
        </span>

        {/* Upvote Column */}
        <div className="shrink-0 w-10 flex flex-col items-center">
          <VoteButton
            projectId={project.id}
            initialVotes={project.voteCount}
            initialVoted={hasVoted}
            variant="feed"
          />
        </div>

        {/* Project Logo/Icon */}
        <Link href={`/project/${project.id}`} className="shrink-0 pt-1">
          <div className="w-14 h-14 rounded border border-border bg-rock-3 flex items-center justify-center font-mono font-bold text-xl text-text-secondary select-none group-hover:border-brand-orange/45 transition-colors">
            {project.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.logoUrl}
                alt={project.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <span>{project.title.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </Link>

        {/* Project Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
            <Link
              href={`/project/${project.id}`}
              className="font-mono text-lg font-bold text-text-primary group-hover:text-brand-orange transition-colors truncate"
            >
              {project.title}
            </Link>
            <StatusBadge status={project.status} />
            {project.isBoosted && (
              <span className="text-[10px] font-mono text-brand-orange font-bold uppercase tracking-widest bg-brand-orange/10 border border-brand-orange/20 px-2 py-0.5 rounded">
                BOOSTED
              </span>
            )}
            {project.user.plan === "FOUNDER" && (
              <span className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                FOUNDER
              </span>
            )}
          </div>

          <Link
            href={`/project/${project.id}`}
            className="block text-sm text-text-secondary leading-relaxed mb-3.5 line-clamp-2"
          >
            {project.tagline}
          </Link>

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
            <span className="text-text-secondary hover:text-brand-orange transition-colors">
              @{project.user.username}
            </span>
            <span className="text-border-strong select-none">•</span>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="bg-rock-3 border border-border px-2 py-0.5 rounded-[2px] text-text-muted uppercase text-[10.5px]"
                >
                  {t}
                </span>
              ))}
              {project.toolsUsed.slice(0, 2).map((tool) => (
                <span
                  key={tool}
                  className="bg-brand-orange/5 border border-brand-orange/10 px-2 py-0.5 rounded-[2px] text-text-secondary text-[10.5px]"
                >
                  {tool}
                </span>
              ))}
            </div>

            {/* Timer inside feed row if building */}
            {isBuilding && (
              <>
                <span className="hidden sm:inline text-border-strong select-none">•</span>
                <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="uppercase text-[10.5px] text-text-muted font-bold">Clock:</span>
                  <CountdownTimer deadlineAt={project.deadlineAt} variant="small" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
