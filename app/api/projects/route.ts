import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { scheduleProjectLifecycleEvents } from "@/lib/inngest/events";
import { db } from "@/lib/db";
import { validateCreateProjectInput } from "@/lib/projects/validation";

const fourDaysMs = 96 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const tag = searchParams.get("tag")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const take = Math.min(Math.max(Number(searchParams.get("take") ?? "12"), 1), 24);
  const skip = (page - 1) * take;

  const statusFilter =
    status === "building"
      ? [ProjectStatus.BUILDING]
      : status === "launched"
      ? [ProjectStatus.LAUNCHED]
      : [ProjectStatus.BUILDING, ProjectStatus.LAUNCHED];

  const where = {
    status: { in: statusFilter },
    user: { deletedAt: null },
    ...(tag && tag !== "All"
      ? {
          tags: { has: tag },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { tagline: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
      skip,
      take,
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            plan: true,
          },
        },
      },
    }),
    db.project.count({ where }),
  ]);

  return NextResponse.json({
    projects: projects.map((project) => ({
      ...project,
      deadlineAt: project.deadlineAt.toISOString(),
      ideaDeclaredAt: project.ideaDeclaredAt.toISOString(),
      launchedAt: project.launchedAt?.toISOString() ?? null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })),
    page,
    total,
    hasMore: skip + projects.length < total,
  });
}

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
