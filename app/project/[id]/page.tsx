import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ProjectStatus } from "@prisma/client";
import { BuildUpdateForm } from "@/components/features/build-update-form";
import { CountdownTimer } from "@/components/features/countdown-timer";
import { FounderBadge } from "@/components/features/founder-badge";
import { KickedBanner } from "@/components/features/kicked-banner";
import { VoteButton } from "@/components/features/vote-button";
import { SectionLabel, StoneCard, BuilderAvatar } from "@/components/ui/primitives";
import { db } from "@/lib/db";
import { ProjectActions } from "./project-actions";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await db.project.findUnique({ where: { id: params.id }, select: { title: true, tagline: true } });
  if (!project) return {};
  return {
    title: `${project.title} | BuildOrDie`,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: [`/api/og?id=${params.id}`],
    },
  };
}

type ActivityEvent = {
  type: "declare" | "update" | "warning" | "shipped" | "kicked";
  title: string;
  content?: string;
  time: Date;
};

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      buildUpdates: { orderBy: { createdAt: "asc" } },
      votes: {
        where: userId ? { user: { clerkId: userId } } : { id: "__logged_out__" },
        select: { id: true },
      },
    },
  });

  if (!project || project.user.deletedAt) notFound();

  const isOwner = userId === project.user.clerkId;
  const canLaunch =
    isOwner &&
    (project.status === ProjectStatus.BUILDING ||
      project.status === ProjectStatus.WARNED);
  
  const shipRate =
    project.user.totalShipped + project.user.totalKicked === 0
      ? 0
      : Math.round((project.user.totalShipped / (project.user.totalShipped + project.user.totalKicked)) * 100);

  // Build the chronological Build Log / Activity List
  const activityEvents: ActivityEvent[] = [];

  // 1. Declare event
  activityEvents.push({
    type: "declare",
    title: "Idea declared publicly — the clock started",
    time: project.ideaDeclaredAt,
  });

  // 2. Add build updates
  project.buildUpdates.forEach((update) => {
    activityEvents.push({
      type: "update",
      title: `Update: "${update.content}"`,
      time: update.createdAt,
    });
  });

  // 3. Warning events (mocked chronologically if warning sent)
  if (project.warningsSent > 0) {
    // Show 24h warning event
    const warningTime = new Date(project.deadlineAt.getTime() - 24 * 3600 * 1000);
    activityEvents.push({
      type: "warning",
      title: "⚠️ System: 24h warning — community is watching",
      time: warningTime > project.ideaDeclaredAt ? warningTime : new Date(project.ideaDeclaredAt.getTime() + 1000),
    });
  }

  // 4. Shipped / Kicked event
  if (project.status === ProjectStatus.LAUNCHED && project.launchedAt) {
    activityEvents.push({
      type: "shipped",
      title: "🚀 Shipped successfully!",
      time: project.launchedAt,
    });
  } else if (project.status === ProjectStatus.KICKED) {
    activityEvents.push({
      type: "kicked",
      title: "💀 Kicked — fell from the cliff",
      time: project.deadlineAt,
    });
  }

  // Sort activity list in reverse chronological order (newest first)
  activityEvents.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <main className="min-h-screen bg-bg-primary px-8 py-12 text-text-primary pb-24 select-none">
      <div className="mx-auto max-w-[1400px] space-y-7">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-text-muted hover:text-text-secondary uppercase select-none mb-3"
        >
          ← back to feed
        </Link>

        {/* Project Header Banner */}
        <div className="flex flex-wrap items-start gap-5 pb-8 border-b border-border">
          <div className="w-16 h-16 rounded border border-border bg-rock-3 flex items-center justify-center font-mono font-bold text-2xl text-brand-orange uppercase">
            {project.title.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <h1 className="font-gothic text-5xl font-bold text-text-primary tracking-wide leading-none">
                {project.title}
              </h1>
              <span className="font-mono text-[11px] font-bold tracking-wider px-3 py-1 border border-border text-text-secondary uppercase bg-rock-2">
                {project.status}
              </span>
            </div>
            <p className="text-base text-text-secondary font-mono leading-relaxed max-w-2xl">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main Content Column */}
          <div className="space-y-7">
            {project.status === ProjectStatus.KICKED && <KickedBanner />}

            {/* Countdown timer: dominant focus */}
            {(project.status === ProjectStatus.BUILDING ||
              project.status === ProjectStatus.WARNED) && (
              <div className="shadow-[0_0_25px_rgba(255,85,0,0.15)]">
                <CountdownTimer
                  deadlineAt={project.deadlineAt.toISOString()}
                  ideaDeclaredAt={project.ideaDeclaredAt.toISOString()}
                />
              </div>
            )}

            {/* Overview / Details */}
            <div className="space-y-3.5">
              <SectionLabel label="WHAT IT DOES" />
              <StoneCard className="p-8 bg-surface/30">
                <p className="font-serif text-lg text-text-secondary leading-loose whitespace-pre-wrap">
                  {project.description}
                </p>
                {project.screenshotUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.screenshotUrl}
                    alt={project.title}
                    className="mt-8 w-full border border-border rounded"
                  />
                )}
                {/* Tags */}
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-rock-3 border border-border px-3 py-1.5 text-xs font-mono text-text-muted uppercase font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="bg-brand-orange/5 border border-brand-orange/15 px-3 py-1.5 text-xs font-mono text-text-secondary font-bold"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </StoneCard>
            </div>

            {/* Build Log / Timeline */}
            <div className="space-y-3.5">
              <SectionLabel label="BUILD LOG & ACTIVITY" />
              <StoneCard className="p-8 bg-surface/30 space-y-7">
                {/* Show updates form if owner */}
                {isOwner && (
                  <div className="pb-5 border-b border-border/40">
                    <BuildUpdateForm projectId={project.id} />
                  </div>
                )}

                {/* Timeline */}
                <div className="relative border-l border-border pl-6 ml-3.5 space-y-7">
                  {activityEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[30px] top-2 w-3.5 h-3.5 rounded-full border border-surface ${
                          event.type === "declare" || event.type === "warning"
                            ? "bg-brand-orange"
                            : event.type === "shipped"
                            ? "bg-brand-green animate-pulse"
                            : event.type === "kicked"
                            ? "bg-danger"
                            : "bg-text-muted"
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="text-sm font-mono font-bold text-text-primary">
                          {event.title}
                        </div>
                        <div className="text-[11px] font-mono text-text-muted font-bold">
                          {event.time.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </StoneCard>
            </div>

            {/* Discussion (read-only placeholder as in mockup) */}
            <div className="space-y-3.5">
              <SectionLabel label="DISCUSSION" />
              <StoneCard className="p-8 bg-surface/30">
                <textarea
                  disabled
                  placeholder="DISCUSSION ROOM LOCKED FOR DEMO V1."
                  className="w-full bg-rock border border-border p-4 rounded text-sm font-mono text-text-muted outline-none select-none h-24 resize-none font-bold"
                />
              </StoneCard>
            </div>
          </div>

          {/* Sidebar / Aside Column */}
          <div className="space-y-7">
            {/* Community votes */}
            <div className="space-y-3.5">
              <SectionLabel label="COMMUNITY VOTES" />
              <StoneCard className="p-6 text-center bg-rock">
                <div className="font-mono text-5xl font-extrabold tracking-tighter text-text-primary leading-none mb-1">
                  {project.voteCount}
                </div>
                <div className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-4.5 font-bold">
                  {"// total votes"}
                </div>
                <VoteButton
                  projectId={project.id}
                  initialVotes={project.voteCount}
                  initialVoted={project.votes.length > 0}
                />
              </StoneCard>
            </div>

            {/* Builder profile info */}
            <div className="space-y-3.5">
              <SectionLabel label="BUILDER" />
              <StoneCard className="p-6 bg-rock">
                <div className="flex items-center gap-4 mb-4.5">
                  <BuilderAvatar
                    displayName={project.user.displayName}
                    xHandle={project.user.xHandle}
                    size={46}
                  />
                  <div>
                    <div className="font-mono text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <span>{project.user.displayName}</span>
                      {project.user.plan === "FOUNDER" && <FounderBadge />}
                    </div>
                    <div className="text-xs text-text-muted font-mono leading-none mt-1.5 font-bold">
                      @{project.user.username}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-center select-none font-mono">
                  <div className="bg-surface border border-border p-2.5 rounded-sm">
                    <div className="text-base font-bold text-text-primary leading-none mb-1">
                      {project.user.totalShipped}
                    </div>
                    <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-none">
                      shipped
                    </div>
                  </div>
                  <div className="bg-surface border border-border p-2.5 rounded-sm">
                    <div className="text-base font-bold text-text-primary leading-none mb-1">
                      {project.user.totalKicked}
                    </div>
                    <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-none">
                      kicked
                    </div>
                  </div>
                  <div className="bg-surface border border-border p-2.5 rounded-sm col-span-2">
                    <div className="text-base font-bold text-brand-orange leading-none mb-1">
                      {shipRate}%
                    </div>
                    <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-none">
                      ship rate
                    </div>
                  </div>
                </div>
              </StoneCard>
            </div>

            {/* Tech stack */}
            {project.toolsUsed.length > 0 && (
              <div className="space-y-3.5">
                <SectionLabel label="BUILT WITH" />
                <StoneCard className="p-5 bg-rock divide-y divide-border">
                  {project.toolsUsed.map((tool) => (
                    <div key={tool} className="flex justify-between items-center py-2.5 text-xs font-mono">
                      <span className="text-text-secondary font-bold">{tool}</span>
                      <span className="text-text-muted text-[10px] uppercase font-bold">stack tool</span>
                    </div>
                  ))}
                </StoneCard>
              </div>
            )}

            {/* Owner specific project actions */}
            {isOwner && (
              <div className="space-y-3.5">
                <SectionLabel label="PROJECT CONSOLE" />
                <StoneCard className="p-5 bg-rock border-dashed border-border-strong">
                  <ProjectActions
                    projectId={project.id}
                    title={project.title}
                    tagline={project.tagline}
                    canLaunch={canLaunch}
                  />
                </StoneCard>
              </div>
            )}

            {/* Live URL */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-brand-green hover:bg-brand-green/90 text-white font-mono font-bold text-sm uppercase tracking-wider text-center py-3.5 rounded transition-colors"
              >
                🚀 Open Live app
              </a>
            )}

            {/* Tweet if launched */}
            {project.status === ProjectStatus.LAUNCHED && (
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                  `Just shipped ${project.title} on @BuildOrDie in 4 days. ${project.tagline}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full border border-brand-orange text-brand-orange hover:bg-brand-orange/5 font-mono font-bold text-sm uppercase tracking-wider text-center py-3.5 rounded transition-colors"
              >
                Share on X / Twitter
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
