import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ProjectStatus } from "@prisma/client";
import { LiveFoundersTable } from "@/components/features/live-founders-table";
import { FeaturedStrip } from "@/components/features/featured-strip";
import { FeedRow } from "@/components/ui/feed-row";
import { SectionLabel, StatBar, StoneCard } from "@/components/ui/primitives";
import { db } from "@/lib/db";
import { CountdownTimer } from "@/components/features/countdown-timer";

export const revalidate = 10; // short revalidation for dynamic live updates

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
      ? [ProjectStatus.BUILDING, ProjectStatus.WARNED]
      : filter === "Just Launched"
      ? [ProjectStatus.LAUNCHED]
      : [ProjectStatus.BUILDING, ProjectStatus.WARNED, ProjectStatus.LAUNCHED, ProjectStatus.KICKED];
  
  const tagFilter = ["AI", "SaaS", "Tools", "Other"].includes(filter) ? filter : null;

  // Twelve hours window for about to die query
  const twelveHoursFromNow = new Date(Date.now() + 12 * 60 * 60 * 1000);

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
    buildersAboutToDie,
    recentCasualties,
    tickerShipped,
    tickerKicked,
    tickerClosing,
  ] = await Promise.all([
    db.project.findMany({
      where: {
        status: { in: [ProjectStatus.BUILDING, ProjectStatus.WARNED] },
        user: { deletedAt: null },
      },
      orderBy: { deadlineAt: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        deadlineAt: true,
        user: { select: { username: true, displayName: true, xHandle: true } },
      },
    }),
    db.project.count({
      where: {
        status: { in: [ProjectStatus.BUILDING, ProjectStatus.WARNED] },
        user: { deletedAt: null },
      },
    }),
    db.project.count({ where: { user: { deletedAt: null } } }),
    db.project.count({ where: { status: ProjectStatus.LAUNCHED, user: { deletedAt: null } } }),
    db.project.count({ where: { status: ProjectStatus.KICKED, user: { deletedAt: null } } }),
    db.project.count({
      where: {
        ideaDeclaredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        user: { deletedAt: null },
      },
    }),
    db.project.count({
      where: {
        status: ProjectStatus.LAUNCHED,
        launchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        user: { deletedAt: null },
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
      take: 20,
      include: { user: { select: { username: true, displayName: true, plan: true } } },
    }),
    currentUser
      ? db.vote.findMany({ where: { userId: currentUser.id }, select: { projectId: true } })
      : Promise.resolve([]),
    db.project.findMany({
      where: {
        status: { in: [ProjectStatus.BUILDING, ProjectStatus.WARNED] },
        deadlineAt: {
          gt: new Date(),
          lte: twelveHoursFromNow,
        },
        user: { deletedAt: null },
      },
      orderBy: { deadlineAt: "asc" },
      include: { user: { select: { username: true, displayName: true, xHandle: true } } },
    }),
    db.project.findMany({
      where: {
        status: ProjectStatus.KICKED,
        user: { deletedAt: null },
      },
      orderBy: { deadlineAt: "desc" },
      take: 3,
      include: { user: { select: { username: true, displayName: true } } },
    }),
    db.project.findMany({
      where: { status: ProjectStatus.LAUNCHED, user: { deletedAt: null } },
      orderBy: { launchedAt: "desc" },
      take: 2,
      select: { title: true, launchedAt: true },
    }),
    db.project.findMany({
      where: { status: ProjectStatus.KICKED, user: { deletedAt: null } },
      orderBy: { deadlineAt: "desc" },
      take: 2,
      select: { title: true },
    }),
    db.project.findFirst({
      where: {
        status: { in: [ProjectStatus.BUILDING, ProjectStatus.WARNED] },
        deadlineAt: { gt: new Date() },
        user: { deletedAt: null },
      },
      orderBy: { deadlineAt: "asc" },
      select: { title: true, deadlineAt: true },
    }),
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

  // Build Ticker elements
  const tickerItems: string[] = [];
  tickerShipped.forEach((p) => {
    tickerItems.push(`🔥 ${p.title} shipped recently`);
  });
  tickerKicked.forEach((p) => {
    tickerItems.push(`💀 ${p.title} fell from the cliff`);
  });
  if (tickerClosing) {
    tickerItems.push(`⚒ ${tickerClosing.title} is at the rock face`);
  }
  if (tickerItems.length === 0) {
    tickerItems.push("🔥 Build or Die: 4 days. One idea. Ship or get kicked.");
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary pb-16">
      {/* ─── LIVE TICKER ─── */}
      <div className="bg-surface border-b border-border py-2 px-6 overflow-hidden select-none">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 text-[10px] font-mono text-text-secondary w-full">
            {tickerItems.map((item, index) => (
              <div key={index} className="flex items-center gap-6 shrink-0">
                <span>{item}</span>
                {index < tickerItems.length - 1 && <span className="text-border-strong">•</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* ─── HERO & TRIBE GRID ─── */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Hero text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-brand-orange uppercase bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping" />
              {totalBuilding} BUILDERS IN THE TRIBE RIGHT NOW
            </div>

            <div className="space-y-2">
              <h1 className="font-gothic text-6xl sm:text-7xl leading-none text-text-primary tracking-tight">
                Build<br />
                Or<br />
                <span className="bg-gradient-to-r from-brand-orange to-brand-amber bg-clip-text text-transparent italic">
                  Die.
                </span>
              </h1>
              <p className="font-mono text-xs text-text-secondary italic uppercase tracking-wider">
                {"// four days. one idea. ship or fall from the cliff."}
              </p>
            </div>

            {/* Quote scroll */}
            <div className="border-l-2 border-border pl-4 py-1.5 space-y-2.5 select-none">
              <div className="font-mono text-xs text-text-primary leading-relaxed flex items-start gap-2">
                <span className="text-brand-orange">›</span>
                <span>You have an idea. It has been sitting in your head for months.</span>
              </div>
              <div className="font-mono text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-brand-orange">›</span>
                <span>Declare it publicly. The clock starts. You cannot take it back.</span>
              </div>
              <div className="font-mono text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-brand-orange">›</span>
                <span>Launch in 4 days or get kicked. Build fast, reach real people, or crash and move on.</span>
              </div>
              <div className="font-mono text-xs text-text-muted leading-relaxed flex items-start gap-2">
                <span className="text-brand-orange">›</span>
                <span>Either way — you learn faster than anyone still sitting by the cave thinking about it.</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/submit"
                className="bg-brand-orange border border-brand-orange/45 px-5 py-3 font-mono font-bold text-xs text-white uppercase tracking-wider transition-all hover:bg-brand-amber shadow-[0_0_15px_rgba(255,85,0,0.15)]"
              >
                ⚒ DECLARE YOUR IDEA — START THE CLOCK
              </Link>
              <span className="font-mono text-[9px] text-text-muted select-none uppercase tracking-wider">
                {"// no subscriptions. no mercy. just build."}
              </span>
            </div>
          </div>

          {/* Living tribe component */}
          <div>
            <LiveFoundersTable
              builders={liveBuilderRows}
              totalBuildersCount={totalBuilding}
              totalShippedCount={totalShipped}
            />
          </div>
        </div>

        {/* ─── STATS BAR ─── */}
        <StatBar
          stats={[
            { label: "ideas declared", value: totalDeclared },
            { label: "shipped", value: totalShipped },
            { label: "fell from the cliff", value: totalKicked, color: "text-danger" },
            { label: "ship rate this week", value: `${weeklyShipRate}%` },
          ]}
        />

        {/* ─── BUILDERS ABOUT TO DIE SECTION ─── */}
        {buildersAboutToDie.length > 0 && (
          <StoneCard variant="ember" className="p-5 bg-danger/[0.02]">
            <div className="flex items-center gap-2 mb-3.5 select-none">
              <span className="text-base">💀</span>
              <span className="font-mono text-[10px] font-black tracking-widest text-danger uppercase animate-pulse">
                BUILDERS ON THE EDGE OF THE CLIFF — LESS THAN 12 HOURS REMAINING
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {buildersAboutToDie.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="bg-rock border border-border p-3.5 hover:border-danger transition-colors rounded flex flex-col justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-text-primary truncate mb-1">
                      {project.title}
                    </div>
                    <p className="text-[10px] text-text-secondary line-clamp-2 leading-normal mb-3">
                      {project.tagline}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                    <span className="text-[9px] font-mono text-text-muted truncate">
                      @{project.user.username}
                    </span>
                    <CountdownTimer deadlineAt={project.deadlineAt.toISOString()} variant="small" />
                  </div>
                </Link>
              ))}
            </div>
          </StoneCard>
        )}

        {/* ─── FEATURED PROJECTS STRIP ─── */}
        <FeaturedStrip
          projects={featured.map((project) => ({
            ...project,
            deadlineAt: project.deadlineAt.toISOString(),
            hasVoted: votedProjectIds.has(project.id),
          }))}
        />

        {/* ─── MAIN FEED ─── */}
        <div className="space-y-6">
          <SectionLabel label={`BUILDERS AT THE ROCK FACE — ${totalBuilding} ACTIVE`} />

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 select-none">
            {filters.map((item) => (
              <Link
                key={item}
                href={`/?filter=${encodeURIComponent(item)}`}
                className={`font-mono text-[9px] font-bold tracking-wider px-3 py-1.5 border rounded-sm transition-all uppercase ${
                  filter === item
                    ? "border-brand-orange text-brand-orange bg-brand-orange/5"
                    : "border-border text-text-muted hover:border-text-secondary hover:text-text-secondary"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Search Form */}
          <form className="flex max-w-xl gap-2">
            <input
              name="search"
              defaultValue={search}
              placeholder="SEARCH THE ROCK FACE..."
              className="flex-1 font-mono text-xs border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-text-muted transition-colors rounded-sm"
            />
            <button className="bg-brand-orange border border-brand-orange/45 px-5 font-mono font-bold text-xs text-white uppercase tracking-wider hover:bg-brand-amber transition-colors rounded-sm">
              Search
            </button>
          </form>

          {/* Feed rows list */}
          {projects.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center text-xs font-mono text-text-muted uppercase tracking-wider">
              No projects found on the rock face.
            </div>
          ) : (
            <div className="border border-border bg-surface/15 rounded-md px-4 py-2 divide-y divide-border">
              {projects.map((project, index) => (
                <FeedRow
                  key={project.id}
                  rank={index + 1}
                  project={{
                    ...project,
                    deadlineAt: project.deadlineAt.toISOString(),
                  }}
                  hasVoted={votedProjectIds.has(project.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── RECENT CASUALTIES SECTION (DEATH MOUNTAIN REPLACEMENT) ─── */}
        <StoneCard className="p-8 text-center bg-rock-2 border-border/80">
          {/* Small ASCII art container */}
          <div className="font-mono text-[9px] text-danger/60 leading-none select-none mb-3 opacity-60">
            {"        /\\"}
            <br />
            {"       /  \\"}
            <br />
            {"      / 💀 \\"}
            <br />
            {"     /   |  \\"}
            <br />
            {"    /    |   \\"}
            <br />
            {"   ───────────"}
          </div>

          <div className="font-gothic text-2xl text-danger mb-1 tracking-wider">
            The Cliff Claims Another Builder
          </div>
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-6">
            {"// recent casualties who failed to ship on time"}
          </p>

          {recentCasualties.length === 0 ? (
            <p className="font-mono text-[10px] text-text-muted uppercase">
              No builders have fallen to the cliff recently. The line holds.
            </p>
          ) : (
            <div className="mx-auto max-w-2xl grid gap-3 sm:grid-cols-3">
              {recentCasualties.map((project) => (
                <div
                  key={project.id}
                  className="bg-rock border border-border p-3 rounded text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-text-primary truncate mb-1">
                      {project.title}
                    </div>
                    <p className="text-[10px] text-text-muted line-clamp-2 leading-normal mb-2">
                      {project.tagline}
                    </p>
                  </div>
                  <div className="font-mono text-[8px] text-danger/80 mt-auto pt-1.5 border-t border-border/30">
                    KICKED • @{project.user.username}
                  </div>
                </div>
              ))}
            </div>
          )}
        </StoneCard>
      </section>
    </main>
  );
}
