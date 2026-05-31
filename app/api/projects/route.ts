import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { scheduleProjectLifecycleEvents } from "@/lib/inngest/events";
import { db } from "@/lib/db";
import { validateCreateProjectInput } from "@/lib/projects/validation";

const fourDaysMs = 96 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await ensureLocalUser(userId);

  if (!user) {
    return NextResponse.json(
      { error: "Could not create local user record from Clerk profile." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const validation = validateCreateProjectInput(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const activeProjectCount = await db.project.count({
    where: {
      userId: user.id,
      status: { in: [ProjectStatus.BUILDING, ProjectStatus.WARNED] },
    },
  });
  const activeProjectLimit = user.plan === "FOUNDER" ? 2 : 1;

  if (activeProjectCount >= activeProjectLimit) {
    return NextResponse.json(
      {
        error:
          user.plan === "FOUNDER"
            ? "Founder users can have at most 2 active projects."
            : "Free users can have at most 1 active project.",
      },
      { status: 403 },
    );
  }

  const now = new Date();
  const deadlineAt = new Date(now.getTime() + fourDaysMs);

  const project = await db.project.create({
    data: {
      userId: user.id,
      title: validation.data.title,
      tagline: validation.data.tagline,
      description: validation.data.description,
      tags: validation.data.tags,
      toolsUsed: validation.data.toolsUsed,
      ideaDeclaredAt: now,
      deadlineAt,
      buildUpdates: {
        create: {
          content: "Idea declared - clock started",
          createdAt: now,
        },
      },
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          xHandle: true,
          plan: true,
        },
      },
      buildUpdates: true,
    },
  });

  try {
    await scheduleProjectLifecycleEvents(project.id);
  } catch (error) {
    console.error("Failed to schedule project lifecycle events", error);
    return NextResponse.json(
      {
        error:
          "Project created, but scheduling failed. Check INNGEST_EVENT_KEY.",
        project,
      },
      { status: 202 },
    );
  }

  return NextResponse.json(project, { status: 201 });
}
