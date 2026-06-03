import Link from "next/link";
import { FounderBadge } from "@/components/features/founder-badge";
import { StoneCard, BuilderAvatar } from "@/components/ui/primitives";
import { db } from "@/lib/db";

export const revalidate = 3600; // leaderboard updates hourly

export default async function LeaderboardPage() {
  const users = await db.user.findMany({
    where: { deletedAt: null },
    include: { projects: { select: { voteCount: true } } },
    orderBy: [{ totalShipped: "desc" }, { createdAt: "asc" }],
    take: 20,
  });

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary pb-20 select-none">
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-gothic text-4xl font-bold tracking-wide text-text-primary mb-1">
            The Honored Builders
          </h1>
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            {"// RANKED BY TOTAL SHIPS · ALL TIME"}
          </p>
        </div>

        {/* Table styled in Stone card */}
        <StoneCard className="overflow-hidden bg-rock-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-border text-[9px] font-bold text-text-muted uppercase tracking-wider bg-surface select-none">
                  <th className="py-3 px-5">#</th>
                  <th className="py-3 px-5">Builder</th>
                  <th className="py-3 px-5">X Handle</th>
                  <th className="py-3 px-5 text-center">Shipped</th>
                  <th className="py-3 px-5 text-center">Kicked</th>
                  <th className="py-3 px-5 text-center">Ship Rate</th>
                  <th className="py-3 px-5 text-right">Total Votes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const rank = index + 1;
                  const shipRate =
                    user.totalShipped + user.totalKicked === 0
                      ? 0
                      : Math.round((user.totalShipped / (user.totalShipped + user.totalKicked)) * 100);
                  const votes = user.projects.reduce((sum, project) => sum + project.voteCount, 0);

                  // Rank icon/color styling
                  let rankEl: React.ReactNode = <span>{rank}</span>;
                  if (rank === 1) {
                    rankEl = <span className="text-gold font-bold">🔥 1</span>;
                  } else if (rank === 2) {
                    rankEl = <span className="text-[#B0B0B8] font-bold">⚡ 2</span>;
                  } else if (rank === 3) {
                    rankEl = <span className="text-[#CD7F32] font-bold">🪨 3</span>;
                  }

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border/40 hover:bg-surface/50 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold">{rankEl}</td>
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/profile/${user.username}`}
                          className="flex items-center gap-2 hover:text-brand-orange transition-colors"
                        >
                          <BuilderAvatar
                            displayName={user.displayName}
                            xHandle={user.xHandle}
                            size={20}
                          />
                          <span className="font-bold flex items-center gap-1">
                            {user.displayName}
                            {user.plan === "FOUNDER" && <FounderBadge />}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-text-muted">
                        {user.xHandle ? `@${user.xHandle}` : `@${user.username}`}
                      </td>
                      <td className="py-3.5 px-5 text-center text-brand-green font-bold">
                        {user.totalShipped}
                      </td>
                      <td className="py-3.5 px-5 text-center text-text-secondary">
                        {user.totalKicked}
                      </td>
                      <td className="py-3.5 px-5 text-center font-bold">
                        {shipRate}%
                      </td>
                      <td className="py-3.5 px-5 text-right text-brand-orange font-bold">
                        {votes.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </StoneCard>
      </section>
    </main>
  );
}
