import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const revalidate = 3600;

export async function GET() {
  const users = await db.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ totalShipped: "desc" }, { createdAt: "asc" }],
    take: 20,
    include: {
      projects: {
        where: { status: ProjectStatus.LAUNCHED },
        select: { voteCount: true },
      },
    },
  });

  const leaderboard = users
    .map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      xHandle: user.xHandle,
      plan: user.plan,
      totalShipped: user.totalShipped,
      totalKicked: user.totalKicked,
      voteCount: user.projects.reduce((sum, project) => sum + project.voteCount, 0),
      shipRate:
        user.totalShipped + user.totalKicked === 0
          ? 0
          : Math.round(
              (user.totalShipped / (user.totalShipped + user.totalKicked)) * 100,
            ),
    }))
    .sort((a, b) => b.totalShipped - a.totalShipped || b.voteCount - a.voteCount);

  return NextResponse.json(leaderboard);
}
