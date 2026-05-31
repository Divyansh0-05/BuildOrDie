import { inngest } from "@/inngest/client";

const hour = 60 * 60 * 1000;

type ProjectEventName =
  | "project/warn"
  | "project/kick"
  | "project/final-kick"
  | "project/boost-activate"
  | "project/boost-expire";

function scheduledProjectEvent(
  projectId: string,
  name: ProjectEventName,
  hoursFromNow: number,
) {
  return {
    id: `${name}:${projectId}`,
    name,
    data: { projectId },
    ts: Date.now() + hoursFromNow * hour,
  };
}

export async function scheduleProjectLifecycleEvents(projectId: string) {
  return inngest.send([
    scheduledProjectEvent(projectId, "project/warn", 90),
    scheduledProjectEvent(projectId, "project/kick", 96),
    scheduledProjectEvent(projectId, "project/final-kick", 102),
  ]);
}

export async function cancelProjectLifecycleEvents(projectId: string) {
  return inngest.send(createProjectCancelEvent(projectId));
}

export function createProjectCancelEvent(projectId: string) {
  return {
    id: `project/cancel:${projectId}:${Date.now()}`,
    name: "project/cancel",
    data: { projectId },
  };
}

export async function scheduleFinalKickEvent(projectId: string, hoursFromNow = 6) {
  return inngest.send(
    scheduledProjectEvent(projectId, "project/final-kick", hoursFromNow),
  );
}

export async function scheduleBoostActivation(projectId: string, startsAt: Date) {
  return inngest.send({
    id: `project/boost-activate:${projectId}`,
    name: "project/boost-activate",
    data: { projectId },
    ts: startsAt.getTime(),
  });
}

export async function scheduleBoostExpiry(projectId: string, expiresAt: Date) {
  return inngest.send({
    id: `project/boost-expire:${projectId}`,
    name: "project/boost-expire",
    data: { projectId },
    ts: expiresAt.getTime(),
  });
}
