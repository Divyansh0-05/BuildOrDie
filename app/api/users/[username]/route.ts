import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { username: string } },
) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    include: {
      projects: {
        where: { status: ProjectStatus.LAUNCHED },
        orderBy: { launchedAt: "desc" },
        include: {
          user: {
            select: { username: true, displayName: true, plan: true },
          },
        },
      },
    },
  });

  if (!user || user.deletedAt) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    xHandle: user.xHandle,
    bio: user.bio,
    plan: user.plan,
    totalShipped: user.totalShipped,
    totalKicked: user.totalKicked,
    shipRate:
      user.totalShipped + user.totalKicked === 0
        ? 0
        : Math.round((user.totalShipped / (user.totalShipped + user.totalKicked)) * 100),
    projects: user.projects.map((project) => ({
      ...project,
      deadlineAt: project.deadlineAt.toISOString(),
      launchedAt: project.launchedAt?.toISOString() ?? null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })),
  });
}
