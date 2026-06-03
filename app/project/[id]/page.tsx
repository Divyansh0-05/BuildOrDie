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

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-10 text-text-primary">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-8">
          {project.status === ProjectStatus.KICKED ? <KickedBanner /> : null}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center border border-border bg-surface font-mono text-xl font-black text-brand-orange">
                {project.logoUrl ? project.title.slice(0, 2) : project.title.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-black">{project.title}</h1>
                  <span className="border border-border px-2 py-1 font-mono text-xs text-text-secondary">{project.status}</span>
                </div>
                <p className="text-lg text-text-secondary">{project.tagline}</p>
              </div>
            </div>
            {project.status === ProjectStatus.BUILDING ||
            project.status === ProjectStatus.WARNED ? (
              <CountdownTimer deadlineAt={project.deadlineAt.toISOString()} />
            ) : null}
          </div>

          <div className="grid gap-6">
            <section className="border border-border bg-surface p-6">
              <h2 className="mb-3 font-mono text-sm uppercase text-text-muted">Overview</h2>
              <p className="whitespace-pre-wrap text-text-secondary">{project.description}</p>
              {project.screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.screenshotUrl} alt={project.title} className="mt-5 w-full border border-border" />
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => <span key={tag} className="border border-border px-2 py-1 text-xs text-text-muted">{tag}</span>)}
                {project.toolsUsed.map((tool) => <span key={tool} className="border border-brand-orange/20 px-2 py-1 text-xs text-brand-orange">{tool}</span>)}
              </div>
            </section>

            <section className="border border-border bg-surface p-6">
              <h2 className="mb-4 font-mono text-sm uppercase text-text-muted">Updates</h2>
              {isOwner ? <BuildUpdateForm projectId={project.id} /> : null}
              <div className="mt-5 space-y-3">
                {project.buildUpdates.map((update) => (
                  <div key={update.id} className="border-l border-brand-orange pl-4">
                    <p>{update.content}</p>
                    <time className="font-mono text-xs text-text-muted">{update.createdAt.toLocaleString()}</time>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-surface p-6">
              <h2 className="mb-4 font-mono text-sm uppercase text-text-muted">Discussion</h2>
              <textarea className="min-h-24 w-full border border-border bg-bg-primary p-3" placeholder="Discussion placeholder for v1." />
            </section>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="border border-border bg-surface p-5">
            <div className="mb-3 font-mono text-5xl font-black text-brand-orange">{project.voteCount}</div>
            <VoteButton projectId={project.id} initialVotes={project.voteCount} initialVoted={project.votes.length > 0} className="w-full justify-center" />
          </div>
          <div className="border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <Link href={`/profile/${project.user.username}`} className="font-bold">{project.user.displayName}</Link>
              {project.user.plan === "FOUNDER" ? <FounderBadge /> : null}
            </div>
            {project.user.xHandle ? <a href={`https://x.com/${project.user.xHandle}`} className="text-sm text-brand-orange">@{project.user.xHandle}</a> : null}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-text-muted">
              <span>{project.user.totalShipped} shipped</span>
              <span>{project.user.totalKicked} kicked</span>
              <span>{shipRate}% rate</span>
            </div>
          </div>
          {isOwner && (
            <ProjectActions projectId={project.id} title={project.title} tagline={project.tagline} canLaunch={canLaunch} />
          )}
          {project.liveUrl ? <a href={project.liveUrl} className="block bg-brand-green px-4 py-3 text-center font-bold text-bg-primary">Live URL</a> : null}
          {project.status === ProjectStatus.LAUNCHED ? (
            <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just shipped ${project.title} on @BuildOrDie in 4 days. ${project.tagline}`)}`} className="block border border-brand-orange px-4 py-3 text-center text-brand-orange">Share on X</a>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
