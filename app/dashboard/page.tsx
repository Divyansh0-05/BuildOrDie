import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { CountdownTimer } from "@/components/features/countdown-timer";
import { FounderBadge } from "@/components/features/founder-badge";
import { SectionLabel, StoneCard, BuilderAvatar } from "@/components/ui/primitives";

export const revalidate = 0; // dashboard should be live/realtime

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureLocalUser(userId);

  if (!user) {
    redirect("/onboarding");
  }

  // Query all user projects
  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const activeProjects = projects.filter(
    (p) => p.status === ProjectStatus.BUILDING || p.status === ProjectStatus.WARNED
  );
  const shippedProjects = projects.filter((p) => p.status === ProjectStatus.LAUNCHED);
  const kickedProjects = projects.filter((p) => p.status === ProjectStatus.KICKED);

  const totalBuilds = user.totalShipped + user.totalKicked;
  const shipRate = totalBuilds === 0 ? 0 : Math.round((user.totalShipped / totalBuilds) * 100);

  return (
    <main className="min-h-screen bg-bg-primary px-8 py-14 text-text-primary pb-24 select-none">
      <div className="mx-auto max-w-6xl space-y-7">
        <SectionLabel label="YOUR COMMAND CENTER" />

        {/* Dashboard Grid */}
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile Panel */}
            <StoneCard className="p-6 text-center bg-rock select-none">
              <BuilderAvatar
                displayName={user.displayName}
                xHandle={user.xHandle}
                size={70}
                className="mx-auto mb-4"
              />
              <div className="font-mono text-sm font-bold text-text-primary flex items-center justify-center gap-1.5">
                <span>{user.displayName}</span>
                {user.plan === "FOUNDER" && <FounderBadge />}
              </div>
              <div className="text-xs text-text-muted font-mono leading-none mt-2 font-bold">
                @{user.username} {user.plan === "FOUNDER" ? "· ⚡ FOUNDER" : ""}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="bg-surface border border-border p-2.5 rounded-sm text-center">
                  <div className="font-mono text-sm font-bold text-text-primary leading-none mb-1">
                    {user.totalShipped}
                  </div>
                  <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider leading-none font-bold">
                    shipped
                  </div>
                </div>
                <div className="bg-surface border border-border p-2.5 rounded-sm text-center">
                  <div className="font-mono text-sm font-bold text-text-primary leading-none mb-1">
                    {user.totalKicked}
                  </div>
                  <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider leading-none font-bold">
                    kicked
                  </div>
                </div>
                <div className="bg-surface border border-border p-2.5 rounded-sm text-center">
                  <div className="font-mono text-sm font-bold text-brand-orange leading-none mb-1">
                    {shipRate}%
                  </div>
                  <div className="text-[9px] text-text-muted font-mono uppercase tracking-wider leading-none font-bold">
                    rate
                  </div>
                </div>
              </div>
            </StoneCard>

            {/* Navigation buttons/links */}
            <div className="flex flex-col gap-1.5 font-mono text-xs font-bold text-text-muted uppercase">
              <div className="px-4 py-2.5 border border-border bg-surface text-brand-orange rounded-sm flex justify-between items-center">
                <span>ACTIVE IDEAS</span>
                <span>({activeProjects.length})</span>
              </div>
              <div className="px-4 py-2.5 border border-transparent hover:border-border rounded-sm flex justify-between items-center">
                <span>SHIPPED</span>
                <span>({shippedProjects.length})</span>
              </div>
              <div className="px-4 py-2.5 border border-transparent hover:border-border rounded-sm flex justify-between items-center">
                <span>KICKED</span>
                <span>({kickedProjects.length})</span>
              </div>
            </div>

            <Link
              href="/submit"
              className="block w-full bg-brand-orange hover:bg-brand-amber text-white font-mono font-bold text-sm uppercase tracking-wider text-center py-3.5 rounded transition-colors"
            >
              + DECLARE NEW IDEA
            </Link>
          </div>

          {/* Main Dashboard Panel */}
          <div className="space-y-7">
            {/* Active Projects Console */}
            <div className="space-y-4">
              <h2 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wider">
                {"// ACTIVE IDEAS"}
              </h2>
              {activeProjects.length === 0 ? (
                <StoneCard className="p-10 text-center text-sm font-mono text-text-muted uppercase tracking-wider bg-surface/30 font-bold">
                  No active ideas. The clock is stopped. Click declare to start!
                </StoneCard>
              ) : (
                <div className="space-y-5">
                  {activeProjects.map((project) => (
                    <StoneCard key={project.id} variant="ember" className="p-6.5 bg-surface/40">
                      <div className="flex items-start justify-between gap-5 mb-3.5">
                        <div>
                          <Link
                            href={`/project/${project.id}`}
                            className="font-mono text-base font-bold text-text-primary hover:text-brand-orange transition-colors"
                          >
                            {project.title}
                          </Link>
                          <p className="text-xs text-text-secondary leading-relaxed mt-1.5 max-w-xl">
                            {project.tagline}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/project/${project.id}`}
                            className="font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-muted rounded transition-all bg-rock-2"
                          >
                            VIEW
                          </Link>
                          <Link
                            href={`/project/${project.id}`}
                            className="font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 bg-brand-orange text-white hover:bg-brand-amber rounded transition-all"
                          >
                            LAUNCH ↑
                          </Link>
                        </div>
                      </div>

                      {/* Display a high prominence timer on the dashboard */}
                      <div className="mt-5">
                        <CountdownTimer
                          deadlineAt={project.deadlineAt.toISOString()}
                          ideaDeclaredAt={project.ideaDeclaredAt.toISOString()}
                        />
                      </div>
                    </StoneCard>
                  ))}
                </div>
              )}
            </div>

            {/* Shipped Projects List */}
            <div className="space-y-4">
              <h2 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wider">
                {"// SHIPPED PROJECTS"}
              </h2>
              {shippedProjects.length === 0 ? (
                <StoneCard className="p-8 text-center text-sm font-mono text-text-muted uppercase tracking-wider bg-surface/20 font-bold">
                  You haven&apos;t shipped anything yet. Build and defeat the cliff!
                </StoneCard>
              ) : (
                <div className="space-y-2.5">
                  {shippedProjects.map((project) => (
                    <StoneCard key={project.id} className="p-5.5 bg-surface/30">
                      <div className="flex items-center justify-between gap-5">
                        <div>
                          <Link
                            href={`/project/${project.id}`}
                            className="font-mono text-sm font-bold text-text-primary hover:text-brand-orange transition-colors"
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2.5 text-[11px] font-mono text-text-muted mt-1.5 font-bold">
                            <span className="bg-brand-green/10 border border-brand-green/30 text-brand-green px-2 py-0.5 rounded text-[10px] font-bold">
                              SHIPPED
                            </span>
                            <span>•</span>
                            <span>▲ {project.voteCount} votes</span>
                            <span>•</span>
                            <span>shipped {project.launchedAt ? new Date(project.launchedAt).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/project/${project.id}`}
                            className="font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-muted rounded bg-rock-2"
                          >
                            VIEW
                          </Link>
                          <Link
                            href="/passes"
                            className="font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 border border-brand-orange text-brand-orange hover:bg-brand-orange/5 rounded"
                          >
                            BOOST
                          </Link>
                        </div>
                      </div>
                    </StoneCard>
                  ))}
                </div>
              )}
            </div>

            {/* Kicked Projects List */}
            <div className="space-y-4">
              <h2 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wider">
                {"// KICKED PROJECTS"}
              </h2>
              {kickedProjects.length === 0 ? (
                <StoneCard className="p-8 text-center text-sm font-mono text-text-muted uppercase tracking-wider bg-surface/10 border-dashed font-bold">
                  No failures. Your line remains unbroken.
                </StoneCard>
              ) : (
                <div className="space-y-2.5">
                  {kickedProjects.map((project) => (
                    <StoneCard key={project.id} className="p-5.5 bg-surface/20 opacity-60">
                      <div className="flex items-center justify-between gap-5">
                        <div>
                          <Link
                            href={`/project/${project.id}`}
                            className="font-mono text-sm font-bold text-text-primary hover:text-brand-orange transition-colors"
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2.5 text-[11px] font-mono text-text-muted mt-1.5 font-bold">
                            <span className="bg-danger/10 border border-danger/30 text-danger px-2 py-0.5 rounded text-[10px] font-bold">
                              KICKED
                            </span>
                            <span>•</span>
                            <span>fell from the cliff {new Date(project.deadlineAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link
                          href={`/project/${project.id}`}
                          className="font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-muted rounded bg-rock-2"
                        >
                          VIEW
                        </Link>
                      </div>
                    </StoneCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
