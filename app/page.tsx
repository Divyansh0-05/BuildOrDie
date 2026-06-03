import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ProjectStatus } from "@prisma/client";
import { AvatarStack } from "@/components/features/avatar-stack";
import { FeaturedStrip } from "@/components/features/featured-strip";
import { LiveFoundersTable } from "@/components/features/live-founders-table";
import { ProjectCard } from "@/components/features/project-card";
import { db } from "@/lib/db";

export const revalidate = 60;

const filters = ["All", "Building Now", "Just Launched", "Need Co-builder", "AI", "SaaS", "Tools", "Other"];

type HomeSearchParams = {
  filter?: string;
  search?: string;
  page?: string;
};

export default async function Home({ searchParams }: { searchParams: HomeSearchParams }) {
  const { userId } = await auth();
  const currentUser = userId
    ? await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    : null;
  const filter = searchParams.filter ?? "All";
  const search = searchParams.search?.trim();

  const statusFilter =
    filter === "Building Now"
      ? [ProjectStatus.BUILDING]
      : filter === "Just Launched"
      ? [ProjectStatus.LAUNCHED]
      : [ProjectStatus.BUILDING, ProjectStatus.LAUNCHED];
  const tagFilter = ["AI", "SaaS", "Tools", "Other"].includes(filter) ? filter : null;

  const [
    liveBuilders,
    totalBuilding,
    totalDeclared,
    totalShipped,
    totalKicked,
    weeklyDeclared,
    weeklyShipped,
    featured,
    projects,
    userVotes,
  ] = await Promise.all([
    db.project.findMany({
      where: { status: ProjectStatus.BUILDING, user: { deletedAt: null } },
      orderBy: { deadlineAt: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        deadlineAt: true,
        user: { select: { username: true, displayName: true, xHandle: true } },
      },
    }),
    db.project.count({ where: { status: ProjectStatus.BUILDING } }),
    db.project.count(),
    db.project.count({ where: { status: ProjectStatus.LAUNCHED } }),
    db.project.count({ where: { status: ProjectStatus.KICKED } }),
    db.project.count({ where: { ideaDeclaredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    db.project.count({
      where: {
        status: ProjectStatus.LAUNCHED,
        launchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.project.findMany({
      where: {
        OR: [
          { isFeatured: true, status: ProjectStatus.LAUNCHED },
          {
            isBoosted: true,
            boostedFrom: { lte: new Date() },
            boostedUntil: { gte: new Date() },
          },
        ],
        user: { deletedAt: null },
      },
      orderBy: [{ isBoosted: "desc" }, { voteCount: "desc" }],
      take: 12,
      include: { user: { select: { username: true, displayName: true, plan: true } } },
    }),
    db.project.findMany({
      where: {
        status: { in: statusFilter },
        user: { deletedAt: null },
        ...(tagFilter ? { tags: { has: tagFilter } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { tagline: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
      take: 12,
      include: { user: { select: { username: true, displayName: true, plan: true } } },
    }),
    currentUser
      ? db.vote.findMany({ where: { userId: currentUser.id }, select: { projectId: true } })
      : Promise.resolve([]),
  ]);

  const votedProjectIds = new Set(userVotes.map((vote) => vote.projectId));
  const weeklyShipRate = weeklyDeclared === 0 ? 0 : Math.round((weeklyShipped / weeklyDeclared) * 100);
  const liveBuilderRows = liveBuilders.map((project) => ({
    projectId: project.id,
    projectTitle: project.title,
    deadlineAt: project.deadlineAt.toISOString(),
    username: project.user.username,
    displayName: project.user.displayName,
    xHandle: project.user.xHandle,
  }));
  const builders = liveBuilders.map((project) => project.user);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7">
            <div className="inline-flex border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 font-mono text-xs font-bold uppercase text-brand-orange">
              {totalBuilding} founders building right now
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                You have an idea. It has been sitting there for months.
              </h1>
              <p className="text-xl text-text-secondary">Declare it publicly. Clock starts. You cannot take it back.</p>
              <p className="text-xl text-text-secondary">Launch in 4 days or get kicked. Build fast, reach people, or crash and move on.</p>
              <p className="text-xl text-text-secondary">Either way — you learn faster than anyone still thinking about it.</p>
              <p className="text-text-muted">
                Why 4 days? Because you build quickly, launch quickly, and reach people quickly. Or you crash and die and work on the next idea — instead of sitting wondering if this will work.
              </p>
            </div>
            <AvatarStack builders={builders} totalCount={totalBuilding} />
          </div>
          <LiveFoundersTable builders={liveBuilderRows} />
        </div>

        <div className="grid gap-3 border border-border bg-surface p-4 sm:grid-cols-4">
          <Stat label="ideas declared" value={totalDeclared} />
          <Stat label="total shipped" value={totalShipped} />
          <Stat label="total kicked" value={totalKicked} />
          <Stat label="ship rate this week" value={`${weeklyShipRate}%`} />
        </div>

        <FeaturedStrip
          projects={featured.map((project) => ({
            ...project,
            deadlineAt: project.deadlineAt.toISOString(),
            hasVoted: votedProjectIds.has(project.id),
          }))}
        />

        <section className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Link
                key={item}
                href={`/?filter=${encodeURIComponent(item)}`}
                className={`border px-3 py-1 text-sm ${filter === item ? "border-brand-orange text-brand-orange" : "border-border text-text-secondary"}`}
              >
                {item}
              </Link>
            ))}
          </div>
          <form className="flex max-w-xl gap-2">
            <input name="search" defaultValue={search} placeholder="Search projects" className="flex-1 border border-border bg-surface px-4 py-3 text-text-primary" />
            <button className="bg-brand-orange px-5 font-bold text-bg-primary">Search</button>
          </form>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{ ...project, deadlineAt: project.deadlineAt.toISOString() }}
                hasVoted={votedProjectIds.has(project.id)}
              />
            ))}
          </div>
        </section>
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
