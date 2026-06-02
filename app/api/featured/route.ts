import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const revalidate = 3600;

export async function GET() {
  const now = new Date();

  const [boosted, organic] = await Promise.all([
    db.project.findMany({
      where: {
        isBoosted: true,
        boostedFrom: { lte: now },
        boostedUntil: { gte: now },
        status: { in: [ProjectStatus.BUILDING, ProjectStatus.LAUNCHED] },
        user: { deletedAt: null },
      },
      orderBy: { boostedUntil: "asc" },
      take: 4,
      include: {
        user: { select: { username: true, displayName: true, plan: true } },
      },
    }),
    db.project.findMany({
      where: {
        isFeatured: true,
        status: ProjectStatus.LAUNCHED,
        user: { deletedAt: null },
      },
      orderBy: { voteCount: "desc" },
      take: 8,
      include: {
        user: { select: { username: true, displayName: true, plan: true } },
      },
    }),
  ]);

  const projects = [...boosted, ...organic].map((project) => ({
    ...project,
    deadlineAt: project.deadlineAt.toISOString(),
    launchedAt: project.launchedAt?.toISOString() ?? null,
  }));

  return NextResponse.json(projects);
}
