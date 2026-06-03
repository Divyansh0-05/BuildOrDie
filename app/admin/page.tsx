import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { db } from "@/lib/db";
import { AdminPanel } from "./admin-panel";
import { Project } from "@prisma/client";

export const metadata = {
  title: "Admin Dashboard | BuildOrDie",
  description: "Moderation dashboard for BuildOrDie administrators.",
};

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureLocalUser(userId);

  // Enforce role-based authentication check inside the page (Constraint 1 & 2)
  if (!user || user.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-[#080810] flex items-center justify-center text-text-primary px-6">
        <div className="text-center space-y-4 max-w-md border border-[#1C1C30] bg-[#0E0E1C] p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-mono font-black text-[#FF4D00] uppercase tracking-wider">
            {"// ACCESS_DENIED"}
          </h1>
          <p className="text-sm text-[#8888AA] leading-relaxed">
            This workspace is restricted. You must have administrator credentials to moderate this platform.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 border border-[#FF4D00]/40 text-[#FF4D00] hover:bg-[#FF4D00]/5 font-mono text-xs uppercase tracking-wider rounded transition-all"
          >
            Back to Homepage
          </a>
        </div>
      </main>
    );
  }

  // Fetch all projects for moderation
  const dbProjects = await db.project.findMany({
    include: {
      user: {
        select: {
          displayName: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const projects = dbProjects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    deadlineAt: p.deadlineAt.toISOString(),
    launchedAt: p.launchedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
    boostedFrom: p.boostedFrom?.toISOString() ?? null,
    boostedUntil: p.boostedUntil?.toISOString() ?? null,
  }));

  // Fetch and resolve the 4 boost slots status
  const now = new Date();
  const boostedProjects = await db.project.findMany({
    where: {
      OR: [{ isBoosted: true }, { boostedUntil: { gt: now } }],
    },
    orderBy: {
      boostedFrom: "asc",
    },
  });

  const slots: Project[][] = [[], [], [], []];
  for (const p of boostedProjects) {
    let assigned = false;
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
    if (!assigned) {
      for (let i = 0; i < 4; i++) {
        if (slots[i].length === 0) {
          slots[i].push(p);
          assigned = true;
          break;
        }
      }
    }
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

  const slotsStatus = slots.map((timeline, index) => {
    const activeProject = timeline.find(
      (p) => p.boostedFrom && p.boostedUntil && p.boostedFrom <= now && p.boostedUntil >= now
    );
    const queuedProject = timeline.find((p) => p.boostedFrom && p.boostedFrom > now);

    if (activeProject) {
      return {
        slotNumber: index + 1,
        projectId: activeProject.id,
        projectTitle: activeProject.title,
        boostedFrom: activeProject.boostedFrom!.toISOString(),
        boostedUntil: activeProject.boostedUntil!.toISOString(),
        isActive: true,
        isFree: false,
      };
    } else if (queuedProject) {
      return {
        slotNumber: index + 1,
        projectId: queuedProject.id,
        projectTitle: queuedProject.title,
        boostedFrom: queuedProject.boostedFrom!.toISOString(),
        boostedUntil: queuedProject.boostedUntil!.toISOString(),
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

  return (
    <main className="min-h-screen bg-[#080810] text-[#F0F0FF] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-black font-sans tracking-tight">Admin Dashboard</h1>
          <p className="text-xs font-mono text-[#5C5C80] uppercase tracking-wider mt-1">
            {"// admin.moderate_mode"}
          </p>
        </div>
        <AdminPanel projects={projects} slots={slotsStatus} />
      </div>
    </main>
  );
}
