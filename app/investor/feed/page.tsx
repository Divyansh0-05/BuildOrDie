import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { db } from "@/lib/db";
import { InvestorClient } from "./investor-client";

export const metadata = {
  title: "Investor Deal Flow | BuildOrDie",
  description: "Exclusively sourced early stage product deal flow.",
};

export default async function InvestorFeedPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureLocalUser(userId);

  // Strict local auth checks (Constraint 1 & 2)
  const now = new Date();
  const isInvestor =
    user &&
    user.role === "INVESTOR" &&
    user.investorAccessUntil &&
    user.investorAccessUntil > now;

  if (!isInvestor) {
    return (
      <main className="min-h-screen bg-[#080810] flex items-center justify-center text-text-primary px-6">
        <div className="text-center space-y-4 max-w-md border border-[#1C1C30] bg-[#0E0E1C] p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-mono font-black text-[#FF4D00] uppercase tracking-wider">
            {"// ACCESS_RESTRICTED"}
          </h1>
          <p className="text-sm text-[#8888AA] leading-relaxed">
            This feed is reserved for active investors. Unlock early deal flow access through the passes portal.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <a
              href="/passes"
              className="inline-block px-4 py-2 bg-[#FF4D00] border border-[#FF4D00]/45 text-[#080810] hover:bg-[#FF4D00]/90 font-mono text-xs font-bold uppercase tracking-wider rounded transition-all"
            >
              Get Investor Access
            </a>
            <a
              href="/"
              className="inline-block px-4 py-2 border border-[#1C1C30] text-[#8888AA] hover:text-[#F0F0FF] font-mono text-xs uppercase tracking-wider rounded transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Fetch launched projects from past 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dbProjects = await db.project.findMany({
    where: {
      status: "LAUNCHED",
      launchedAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
        },
      },
    },
    orderBy: {
      voteCount: "desc",
    },
  });

  const projects = dbProjects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    deadlineAt: p.deadlineAt.toISOString(),
    launchedAt: p.launchedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
    boostedFrom: p.boostedFrom?.toISOString() ?? null,
    boostedUntil: p.boostedUntil?.toISOString() ?? null,
  }));

  return (
    <main className="min-h-screen bg-[#080810] text-[#F0F0FF] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-black font-sans tracking-tight">Investor Deal Flow</h1>
          <p className="text-xs font-mono text-[#5C5C80] uppercase tracking-wider mt-1">
            {"// investor.exclusive_deal_flow"}
          </p>
        </div>
        <InvestorClient projects={projects} />
      </div>
    </main>
  );
}
