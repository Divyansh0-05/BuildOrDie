import { inngest } from "@/inngest/client";

const hour = 60 * 60 * 1000;

type ProjectEventName =
  | "project/warn"
  | "project/kick"
  | "project/final-kick";

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
  return inngest.send({
    id: `project/cancel:${projectId}:${Date.now()}`,
    name: "project/cancel",
    data: { projectId },
  });
}
