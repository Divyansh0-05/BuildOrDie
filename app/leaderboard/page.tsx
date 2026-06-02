import Link from "next/link";
import { FounderBadge } from "@/components/features/founder-badge";
import { db } from "@/lib/db";

export const revalidate = 3600;

export default async function LeaderboardPage() {
  const users = await db.user.findMany({
    where: { deletedAt: null },
    include: { projects: { select: { voteCount: true } } },
    orderBy: [{ totalShipped: "desc" }, { createdAt: "asc" }],
    take: 20,
  });

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-4xl font-black">Leaderboard</h1>
        <div className="border border-border bg-surface">
          {users.map((user, index) => {
            const shipRate = user.totalShipped + user.totalKicked === 0 ? 0 : Math.round((user.totalShipped / (user.totalShipped + user.totalKicked)) * 100);
            const votes = user.projects.reduce((sum, project) => sum + project.voteCount, 0);
            return (
              <Link key={user.id} href={`/profile/${user.username}`} className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-border p-4 last:border-b-0">
                <span className="font-mono text-xl text-brand-orange">#{index + 1}</span>
                <span>
                  <span className="flex items-center gap-2 font-bold">{user.displayName}{user.plan === "FOUNDER" ? <FounderBadge /> : null}</span>
                  <span className="text-sm text-text-muted">{user.xHandle ? `@${user.xHandle}` : `@${user.username}`}</span>
                </span>
                <span className="text-right font-mono text-sm text-text-secondary">{user.totalShipped} shipped / {user.totalKicked} kicked / {shipRate}% / {votes} votes</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
