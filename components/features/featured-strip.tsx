"use client";

import Link from "next/link";
import { Sparkles, Megaphone } from "lucide-react";
import { ProjectStatus } from "@prisma/client";
import { CountdownTimer } from "./countdown-timer";
import { FounderBadge } from "./founder-badge";
import { VoteButton } from "./vote-button";

interface FeaturedProject {
  id: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  logoUrl?: string | null;
  screenshotUrl?: string | null;
  voteCount: number;
  deadlineAt: string;
  isBoosted: boolean;
  user: {
    username: string;
    displayName: string;
    plan: "FREE" | "FOUNDER";
  };
  hasVoted?: boolean;
}

interface FeaturedStripProps {
  projects: FeaturedProject[];
  currentUserId?: string;
}

export function FeaturedStrip({ projects, currentUserId }: FeaturedStripProps) {
  void currentUserId;
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-orange" />
        <h2 className="font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
          {"// featured.spotlight"}
        </h2>
      </div>

      {/* Horizontal Scroll on mobile, Grid on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible md:pb-0">
        {projects.map((project) => (
          <div
            key={project.id}
            className="w-[280px] shrink-0 md:w-auto flex flex-col justify-between bg-surface border border-border hover:border-border-strong rounded-lg p-5 transition-all group relative"
          >
            {/* Boosted badge overlay */}
            <div className="flex items-start justify-between gap-2 mb-3">
              {project.isBoosted ? (
                <span className="inline-flex items-center gap-1 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                  <Megaphone className="w-2.5 h-2.5" />
                  BOOSTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-brand-green/10 border border-brand-green/30 text-brand-green px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                  FEATURED
                </span>
              )}

              {project.user.plan === "FOUNDER" && <FounderBadge />}
            </div>

            <Link href={`/project/${project.id}`} className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                {project.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.logoUrl}
                    alt={project.title}
                    className="w-10 h-10 rounded bg-bg-primary border border-border object-contain shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-bg-primary border border-border flex items-center justify-center font-mono font-bold text-sm text-text-secondary shrink-0 select-none uppercase">
                    {project.title.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-text-primary text-base font-bold line-clamp-1 group-hover:text-brand-orange transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-text-muted text-[10px] font-mono leading-none mt-0.5">
                    by @{project.user.username}
                  </p>
                </div>
              </div>

              <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
                {project.tagline}
              </p>
            </Link>

            {/* Bottom Actions and countdown */}
            <div className="mt-auto space-y-3 pt-3 border-t border-border/40">
              {project.status === ProjectStatus.BUILDING && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-text-muted uppercase">Remaining:</span>
                  <CountdownTimer deadlineAt={project.deadlineAt} variant="small" />
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-text-muted uppercase">
                  Status: <span className={project.status === ProjectStatus.LAUNCHED ? "text-brand-green font-bold" : "text-brand-orange font-bold"}>{project.status}</span>
                </span>

                <VoteButton
                  projectId={project.id}
                  initialVotes={project.voteCount}
                  initialVoted={project.hasVoted || false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
