"use client";

import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface FeaturedProject {
  id: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  logoUrl?: string | null;
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
}

export function FeaturedStrip({ projects }: FeaturedStripProps) {
  // We want to display up to 4 items in the horizontal strip.
  // If we have fewer than 4 featured projects, we fill the remaining slots with "Queued/Free Slot" cards matching the mockup.
  const totalSlots = 4;
  const filledSlots = projects.slice(0, totalSlots);
  const emptySlotsCount = Math.max(0, totalSlots - filledSlots.length);

  return (
    <div className="w-full flex flex-col select-none">
      <div className="font-mono text-[9px] font-bold tracking-[0.15em] text-text-muted uppercase flex items-center gap-2 py-2 mb-3">
        <span>{"// WEAPONS OF LEGEND — TOP VOTED THIS WEEK"}</span>
        <span className="flex-1 h-[1px] bg-border" />
      </div>

      {/* Horizontal Scroll Strip */}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {/* Render filled projects */}
        {filledSlots.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className={cn(
              "min-w-[200px] max-w-[240px] flex-shrink-0 bg-surface border border-border rounded-md p-3.5 flex flex-col justify-between transition-all hover:border-text-muted cursor-pointer",
              project.isBoosted && "border-t-2 border-t-brand-orange"
            )}
          >
            <div>
              {/* Icon & Title */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded bg-rock-3 border border-border flex items-center justify-center font-mono font-bold text-xs text-text-secondary">
                  {project.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.logoUrl}
                      alt={project.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>{project.title.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-text-primary truncate">
                  {project.title}
                </div>
              </div>

              {/* Tagline */}
              <p className="text-[10px] text-text-secondary leading-normal line-clamp-3 mb-3">
                {project.tagline}
              </p>
            </div>

            {/* Bottom Info & Votes */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
              <span className="text-[9px] font-mono text-text-muted font-bold">
                ▲ {project.voteCount}
              </span>
              {project.isBoosted ? (
                <span className="text-[7px] font-mono text-brand-orange font-bold uppercase tracking-wider border border-brand-orange/30 bg-brand-orange/10 px-1 py-0.5 rounded">
                  BOOSTED
                </span>
              ) : (
                <span className="text-[7px] font-mono text-brand-green font-bold uppercase tracking-wider border border-brand-green/30 bg-brand-green/10 px-1 py-0.5 rounded">
                  HOT
                </span>
              )}
            </div>
          </Link>
        ))}

        {/* Render empty slots as mockup slot queues */}
        {Array.from({ length: emptySlotsCount }).map((_, i) => {
          const slotNum = filledSlots.length + i + 1;
          const isOdd = slotNum % 2 === 0;
          return (
            <Link
              key={i}
              href="/passes"
              className="min-w-[200px] max-w-[240px] flex-shrink-0 border border-dashed border-border rounded-md p-3.5 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:border-text-muted cursor-pointer bg-surface/[0.15]"
            >
              <div className="text-[9px] font-mono font-bold tracking-wider text-text-muted uppercase">
                🪨 SLOT {slotNum} • {isOdd ? "FULL" : "FREE"}
              </div>
              {isOdd ? (
                <>
                  <div className="text-[8px] font-mono text-text-muted">opens shortly</div>
                  <div className="text-[8px] font-mono text-brand-orange font-bold mt-0.5">
                    SECURE NOW →
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[8px] font-mono text-brand-green font-bold">
                    AVAILABLE NOW
                  </div>
                  <div className="text-[8px] font-mono text-text-muted mt-0.5">
                    feature your project
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
