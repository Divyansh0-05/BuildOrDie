import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          xHandle: true,
          bio: true,
          plan: true,
          totalShipped: true,
          totalKicked: true,
          deletedAt: true,
        },
      },
      buildUpdates: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!project || project.user.deletedAt) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({
    ...project,
    deadlineAt: project.deadlineAt.toISOString(),
    ideaDeclaredAt: project.ideaDeclaredAt.toISOString(),
    launchedAt: project.launchedAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    buildUpdates: project.buildUpdates.map((update) => ({
      ...update,
      createdAt: update.createdAt.toISOString(),
    })),
  });
}
