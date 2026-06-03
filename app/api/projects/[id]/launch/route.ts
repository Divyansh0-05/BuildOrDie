import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { cancelProjectLifecycleEvents } from "@/lib/inngest/events";
import { db } from "@/lib/db";
import { validateHttpsUrl } from "@/lib/projects/validation";
import { sendEmail, launchedEmail } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    liveUrl?: unknown;
    repoUrl?: unknown;
    screenshotUrl?: unknown;
  } | null;
  const liveUrl = validateHttpsUrl(body?.liveUrl);

  if (!liveUrl) {
    return NextResponse.json(
      { error: "A valid https:// liveUrl is required." },
      { status: 400 },
    );
  }

  const project = await db.project.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, clerkId: true, email: true } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (project.user.clerkId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    project.status !== ProjectStatus.BUILDING &&
    project.status !== ProjectStatus.WARNED
  ) {
    return NextResponse.json(
      { error: "Only BUILDING or WARNED projects can be launched." },
      { status: 409 },
    );
  }

  const repoUrl =
    typeof body?.repoUrl === "string" && body.repoUrl.trim()
      ? validateHttpsUrl(body.repoUrl)
      : null;

  if (typeof body?.repoUrl === "string" && body.repoUrl.trim() && !repoUrl) {
    return NextResponse.json(
      { error: "repoUrl must be a valid https:// URL when provided." },
      { status: 400 },
    );
  }

  const screenshotUrl =
    typeof body?.screenshotUrl === "string" && body.screenshotUrl.trim()
      ? body.screenshotUrl.trim()
      : null;
  const launchedAt = new Date();

  const launchedProject = await db.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: project.id },
      data: {
        status: ProjectStatus.LAUNCHED,
        launchedAt,
        liveUrl,
        repoUrl,
        screenshotUrl,
        buildUpdates: {
          create: {
            content: "Project launched",
            createdAt: launchedAt,
          },
        },
      },
    });

    await tx.user.update({
      where: { id: project.user.id },
      data: { totalShipped: { increment: 1 } },
    });

    return updated;
  });

  try {
    await cancelProjectLifecycleEvents(project.id);
  } catch (error) {
    console.error("Failed to emit project cancellation event", error);
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const projectUrl = `${appUrl}/project/${project.id}`;
    const cleanAppUrl = appUrl.replace(/^https?:\/\//, "");
    const tweetText = `Just shipped ${project.title} on @BuildOrDie in 4 days. ${project.tagline} Check it out: ${cleanAppUrl}/project/${project.id} #buildinpublic #BuildOrDie`;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    const emailData = await launchedEmail(
      project.title,
      projectUrl,
      shareUrl,
      tweetText
    );
    await sendEmail({
      to: project.user.email,
      ...emailData,
    });
  } catch (emailError) {
    console.error("Failed to send Launched email:", emailError);
  }

  return NextResponse.json(launchedProject);
}
