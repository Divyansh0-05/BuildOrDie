"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectStatus } from "@prisma/client";
import { CountdownTimer } from "./countdown-timer";
import { FounderBadge } from "./founder-badge";
import { VoteButton } from "./vote-button";

import { cn } from "@/lib/utils";

interface ProjectCardProps {
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
    };
  };
  hasVoted?: boolean;
}

export function ProjectCard({ project, hasVoted = false }: ProjectCardProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.BUILDING:
        return (
          <span className="bg-brand-orange/10 border border-brand-orange/30 text-brand-orange px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
            BUILDING
          </span>
        );
      case ProjectStatus.LAUNCHED:
        return (
          <span className="bg-brand-green/10 border border-brand-green/30 text-brand-green px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
            SHIPPED
          </span>
        );
      case ProjectStatus.WARNED:
        return (
          <span className="bg-brand-amber/10 border border-brand-amber/30 text-brand-amber px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
            AT THE CLIFF
          </span>
        );
      case ProjectStatus.KICKED:
        return (
          <span className="bg-danger/10 border border-danger/30 text-danger px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
            KICKED
          </span>
        );
      default:
        return null;
    }
  };

  const isBuilding =
    project.status === ProjectStatus.BUILDING || project.status === ProjectStatus.WARNED;

  return (
    <div
      className={cn(
        "bg-surface border border-border hover:border-text-muted rounded-md p-5 transition-all group flex flex-col justify-between relative select-none",
        project.isBoosted && "border-t-2 border-t-brand-orange"
      )}
    >
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link href={`/project/${project.id}`} className="flex items-center gap-3">
            {project.logoUrl && !logoFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.logoUrl}
                alt={project.title}
                className="w-11 h-11 rounded border border-border object-contain bg-bg-primary shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded bg-bg-primary border border-border flex items-center justify-center font-mono font-bold text-sm text-text-secondary uppercase select-none shrink-0">
                {project.title.slice(0, 2)}
              </div>
            )}
            <div>
              <h3 className="text-text-primary text-base font-bold line-clamp-1 group-hover:text-brand-orange transition-colors">
                {project.title}
              </h3>
              <p className="text-text-muted text-[10px] font-mono leading-none mt-0.5">
                by @{project.user.username}
              </p>
            </div>
          </Link>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {getStatusBadge(project.status)}
            {project.user.plan === "FOUNDER" && <FounderBadge />}
          </div>
        </div>

        <Link href={`/project/${project.id}`} className="block mb-4">
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {project.tagline}
          </p>
        </Link>

        {/* Tags and tools */}
        <div className="flex flex-wrap gap-1.5 mb-5 select-none">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-bg-primary border border-border text-text-muted px-2 py-0.5 rounded text-[10px] font-medium font-sans uppercase"
            >
              {tag}
            </span>
          ))}
          {project.toolsUsed.slice(0, 2).map((tool) => (
            <span
              key={tool}
              className="bg-brand-orange/5 border border-brand-orange/10 text-text-secondary px-2 py-0.5 rounded text-[10px] font-medium font-sans"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Timer and Upvote */}
      <div className="mt-auto space-y-3 pt-4 border-t border-border/40">
        {isBuilding && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-muted uppercase">Remaining:</span>
            <CountdownTimer deadlineAt={project.deadlineAt} variant="small" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-text-muted uppercase">
            {project.isBoosted && (
              <span className="text-brand-orange font-bold tracking-wider mr-1">{"// BOOSTED"}</span>
            )}
          </span>
          <VoteButton
            projectId={project.id}
            initialVotes={project.voteCount}
            initialVoted={hasVoted}
          />
        </div>
      </div>
    </div>
  );
}
