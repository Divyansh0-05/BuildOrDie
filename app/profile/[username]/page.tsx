import { notFound } from "next/navigation";
import { ProjectStatus } from "@prisma/client";
import { FounderBadge } from "@/components/features/founder-badge";
import { ProjectCard } from "@/components/features/project-card";
import { db } from "@/lib/db";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    include: {
      projects: {
        where: { status: ProjectStatus.LAUNCHED },
        orderBy: { launchedAt: "desc" },
        include: { user: { select: { username: true, displayName: true, plan: true } } },
      },
    },
  });

  if (!user || user.deletedAt) notFound();
  const shipRate = user.totalShipped + user.totalKicked === 0 ? 0 : Math.round((user.totalShipped / (user.totalShipped + user.totalKicked)) * 100);

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center gap-5">
          {user.xHandle ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://unavatar.io/x/${user.xHandle}`} alt={user.displayName} className="h-20 w-20 rounded-full border border-border" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface font-mono text-2xl font-black text-brand-orange">{user.displayName.slice(0, 2)}</div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-black">{user.displayName}</h1>
              {user.plan === "FOUNDER" ? <FounderBadge /> : null}
            </div>
            <p className="text-text-secondary">{user.bio}</p>
            {user.xHandle ? <a href={`https://x.com/${user.xHandle}`} className="text-brand-orange">@{user.xHandle}</a> : null}
          </div>
        </div>
        <div className="grid gap-3 border border-border bg-surface p-4 sm:grid-cols-3">
          <Stat label="shipped" value={user.totalShipped} />
          <Stat label="kicked" value={user.totalKicked} />
          <Stat label="ship rate" value={`${shipRate}%`} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {user.projects.map((project) => (
            <ProjectCard key={project.id} project={{ ...project, deadlineAt: project.deadlineAt.toISOString() }} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-black text-brand-orange">{value}</div>
      <div className="text-xs uppercase tracking-wider text-text-muted">{label}</div>
    </div>
  );
}
