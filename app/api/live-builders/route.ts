import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  const projects = await db.project.findMany({
    where: {
      status: ProjectStatus.BUILDING,
      user: {
        xHandle: { not: null },
        deletedAt: null,
      },
    },
    orderBy: { deadlineAt: "asc" },
    take: 10,
    select: {
      id: true,
      title: true,
      deadlineAt: true,
      user: {
        select: {
          username: true,
          displayName: true,
          xHandle: true,
        },
      },
    },
  });

  return NextResponse.json(
    projects.map((project) => ({
      projectId: project.id,
      projectTitle: project.title,
      deadlineAt: project.deadlineAt.toISOString(),
      username: project.user.username,
      displayName: project.user.displayName,
      xHandle: project.user.xHandle,
      avatarUrl: `https://unavatar.io/x/${project.user.xHandle}`,
    })),
  );
}
