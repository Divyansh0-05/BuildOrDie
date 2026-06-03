import { ProjectStatus } from "@prisma/client";
import { inngest } from "@/inngest/client";
import {
  boostLiveEmail,
  featuredEmail,
  kickedEmail,
  sendEmail,
  warningEmail,
  graceExtensionEmail,
} from "@/lib/email";
import { scheduleFinalKickEvent } from "@/lib/inngest/events";
import { db } from "@/lib/db";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function projectUrl(projectId: string) {
  return `${appUrl}/project/${projectId}`;
}

export async function handleSendWarning(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project || project.status !== ProjectStatus.BUILDING) {
    return { skipped: true, reason: "Project is not BUILDING." };
  }

  const email = await warningEmail(project.title, projectUrl(project.id));

  await sendEmail({
    to: project.user.email,
    ...email,
  });

  const updatedProject = await db.project.update({
    where: { id: project.id },
    data: { warningsSent: { increment: 1 } },
  });

  return { warned: true, warningsSent: updatedProject.warningsSent };
}

export async function handleKickProject(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project) {
    return { skipped: true, reason: "Project not found." };
  }

  if (project.status === ProjectStatus.LAUNCHED) {
    return { skipped: true, reason: "Project already launched." };
  }

  if (project.status !== ProjectStatus.BUILDING) {
    return { skipped: true, reason: "Project is not BUILDING." };
  }

  if (project.user.plan === "FOUNDER") {
    const email = await graceExtensionEmail(project.title, projectUrl(project.id));

    await sendEmail({
      to: project.user.email,
      ...email,
    });
    await scheduleFinalKickEvent(project.id, 6);

    return { graceExtended: true };
  }

  const warnedAt = new Date();
  const warnedProject = await db.project.update({
    where: { id: project.id },
    data: {
      status: ProjectStatus.WARNED,
      buildUpdates: {
        create: {
          content: "Project warned",
          createdAt: warnedAt,
        },
      },
    },
  });
  const email = await warningEmail(project.title, projectUrl(project.id));

  await sendEmail({
    to: project.user.email,
    subject: "Final warning. Launch or get kicked.",
    html: email.html,
    text: email.text,
  });

  return { warned: true, status: warnedProject.status };
}

export async function handleFinalKick(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project) {
    return { skipped: true, reason: "Project not found." };
  }

  if (project.status === ProjectStatus.LAUNCHED) {
    return { skipped: true, reason: "Project already launched." };
  }

  if (project.status !== ProjectStatus.WARNED) {
    return { skipped: true, reason: "Project is not WARNED." };
  }

  const kickedProject = await db.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: project.id },
      data: { status: ProjectStatus.KICKED },
    });

    await tx.user.update({
      where: { id: project.userId },
      data: { totalKicked: { increment: 1 } },
    });

    return updated;
  });
  const email = await kickedEmail(project.title, appUrl);

  await sendEmail({
    to: project.user.email,
    ...email,
  });

  return { kicked: true, status: kickedProject.status };
}

export async function handleActivateBoostSlot(projectId: string) {
  const project = await db.project.update({
    where: { id: projectId },
    data: {
      isBoosted: true,
      boostQueuePos: null,
    },
    include: { user: true },
  });
  const email = await boostLiveEmail(project.title, projectUrl(project.id));

  await sendEmail({
    to: project.user.email,
    ...email,
  });

  return { activated: true };
}

export async function handleExpireBoostSlot(projectId: string) {
  await db.project.update({
    where: { id: projectId },
    data: {
      isBoosted: false,
      boostedFrom: null,
      boostedUntil: null,
      boostQueuePos: null,
    },
  });

  const nextQueuedProject = await db.project.findFirst({
    where: {
      boostQueuePos: { not: null },
      boostedFrom: { gt: new Date() },
    },
    orderBy: [{ boostQueuePos: "asc" }, { boostedFrom: "asc" }],
  });

  if (nextQueuedProject?.boostedFrom) {
    await inngest.send({
      id: `project/boost-activate:${nextQueuedProject.id}`,
      name: "project/boost-activate",
      data: { projectId: nextQueuedProject.id },
      ts: nextQueuedProject.boostedFrom.getTime(),
    });
  }

  return {
    expired: true,
    nextProjectId: nextQueuedProject?.id ?? null,
  };
}

export async function handleUpdateFeatured() {
  const launchedProjects = await db.project.findMany({
    where: {
      status: ProjectStatus.LAUNCHED,
      launchedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { voteCount: "desc" },
    take: 8,
    include: { user: true },
  });
  const featuredIds = launchedProjects.map((project) => project.id);

  await db.project.updateMany({
    where: { isFeatured: true, id: { notIn: featuredIds } },
    data: { isFeatured: false },
  });

  const newlyFeatured = launchedProjects.filter((project) => !project.isFeatured);

  if (featuredIds.length > 0) {
    await db.project.updateMany({
      where: { id: { in: featuredIds } },
      data: { isFeatured: true },
    });
  }

  await Promise.all(
    newlyFeatured.map(async (project) => {
      const email = await featuredEmail(project.title, projectUrl(project.id));

      return sendEmail({
        to: project.user.email,
        ...email,
      });
    }),
  );

  return { featuredCount: featuredIds.length, newlyFeatured: newlyFeatured.length };
}

export const sendWarning = inngest.createFunction(
  {
    id: "send-warning",
    triggers: [{ event: "project/warn" }],
    cancelOn: [
      {
        event: "project/cancel",
        match: "data.projectId",
      },
    ],
  },
  async ({ event }) => handleSendWarning(event.data.projectId),
);

export const kickProject = inngest.createFunction(
  {
    id: "kick-project",
    triggers: [{ event: "project/kick" }],
    cancelOn: [
      {
        event: "project/cancel",
        match: "data.projectId",
      },
    ],
  },
  async ({ event }) => handleKickProject(event.data.projectId),
);

export const finalKick = inngest.createFunction(
  {
    id: "final-kick",
    triggers: [{ event: "project/final-kick" }],
    cancelOn: [
      {
        event: "project/cancel",
        match: "data.projectId",
      },
    ],
  },
  async ({ event }) => handleFinalKick(event.data.projectId),
);

export const activateBoostSlot = inngest.createFunction(
  { id: "activate-boost-slot", triggers: [{ event: "project/boost-activate" }] },
  async ({ event }) => handleActivateBoostSlot(event.data.projectId),
);

export const expireBoostSlot = inngest.createFunction(
  { id: "expire-boost-slot", triggers: [{ event: "project/boost-expire" }] },
  async ({ event }) => handleExpireBoostSlot(event.data.projectId),
);

export const updateFeatured = inngest.createFunction(
  { id: "update-featured", triggers: [{ cron: "0 0 * * *" }] },
  async () => handleUpdateFeatured(),
);

export const functions = [
  sendWarning,
  kickProject,
  finalKick,
  activateBoostSlot,
  expireBoostSlot,
  updateFeatured,
];
