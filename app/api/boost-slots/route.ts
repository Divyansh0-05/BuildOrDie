import { NextResponse } from "next/server";
import { Project } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    // Query all projects that are currently boosted or scheduled to be boosted
    const projects = await db.project.findMany({
      where: {
        OR: [
          { isBoosted: true },
          { boostedUntil: { gt: now } },
        ],
      },
      orderBy: {
        boostedFrom: "asc",
      },
    });

    // Reconstruct the 4 slots' timelines
    const slots: Project[][] = [[], [], [], []];

    for (const p of projects) {
      let assigned = false;

      // Try to find a slot where this project is scheduled after the last project in that slot
      for (let i = 0; i < 4; i++) {
        const timeline = slots[i];
        if (timeline.length > 0) {
          const lastProj = timeline[timeline.length - 1];
          if (p.boostedFrom && lastProj.boostedUntil && p.boostedFrom >= lastProj.boostedUntil) {
            timeline.push(p);
            assigned = true;
            break;
          }
        }
      }

      // If not assigned, put it in the first empty slot
      if (!assigned) {
        for (let i = 0; i < 4; i++) {
          if (slots[i].length === 0) {
            slots[i].push(p);
            assigned = true;
            break;
          }
        }
      }

      // If still not assigned (e.g. overflow concurrent slots), assign to the slot with the earliest end date
      if (!assigned) {
        let earliestSlotIndex = 0;
        let earliestUntil = slots[0][slots[0].length - 1]?.boostedUntil || new Date(0);

        for (let i = 1; i < 4; i++) {
          const until = slots[i][slots[i].length - 1]?.boostedUntil || new Date(0);
          if (until < earliestUntil) {
            earliestUntil = until;
            earliestSlotIndex = i;
          }
        }
        slots[earliestSlotIndex].push(p);
      }
    }

    // Map each timeline to a slot status object
    const result = slots.map((timeline, index) => {
      const activeProject = timeline.find(
        (p) => p.boostedFrom && p.boostedUntil && p.boostedFrom <= now && p.boostedUntil >= now
      );
      const queuedProject = timeline.find((p) => p.boostedFrom && p.boostedFrom > now);

      if (activeProject) {
        return {
          slotNumber: index + 1,
          projectId: activeProject.id,
          projectTitle: activeProject.title,
          boostedFrom: activeProject.boostedFrom,
          boostedUntil: activeProject.boostedUntil,
          isActive: true,
          isFree: false,
        };
      } else if (queuedProject) {
        return {
          slotNumber: index + 1,
          projectId: queuedProject.id,
          projectTitle: queuedProject.title,
          boostedFrom: queuedProject.boostedFrom,
          boostedUntil: queuedProject.boostedUntil,
          isActive: false,
          isFree: false,
        };
      } else {
        return {
          slotNumber: index + 1,
          projectId: null,
          projectTitle: null,
          boostedFrom: null,
          boostedUntil: null,
          isActive: false,
          isFree: true,
        };
      }
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch boost slots" },
      { status: 500 }
    );
  }
}
