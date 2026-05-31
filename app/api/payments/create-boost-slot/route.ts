import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { Project } from "@prisma/client";
import { db } from "@/lib/db";
import { createDodoCheckoutSession } from "@/lib/dodo";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureLocalUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Could not retrieve user record." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    const projectId = body?.projectId;
    const type = body?.productType; // "starter" | "spotlight" | "starterBoost" | "fullSpotlight"

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let productId = "";
    let productType = "";

    const isStarter = type === "starter" || type === "starterBoost" || type === "DODO_STARTER_BOOST_PRODUCT_ID";
    const isSpotlight = type === "spotlight" || type === "fullSpotlight" || type === "DODO_FULL_SPOTLIGHT_PRODUCT_ID";

    if (isStarter) {
      productId = process.env.DODO_STARTER_BOOST_PRODUCT_ID || "";
      productType = "starterBoost";
    } else if (isSpotlight) {
      productId = process.env.DODO_FULL_SPOTLIGHT_PRODUCT_ID || "";
      productType = "fullSpotlight";
    } else {
      // Fallback: see if the body explicitly contains a valid product ID
      if (body?.productId) {
        productId = body.productId;
        if (productId === process.env.DODO_STARTER_BOOST_PRODUCT_ID) {
          productType = "starterBoost";
        } else if (productId === process.env.DODO_FULL_SPOTLIGHT_PRODUCT_ID) {
          productType = "fullSpotlight";
        } else {
          productType = "boost";
        }
      } else {
        return NextResponse.json({ error: "Invalid or missing productType" }, { status: 400 });
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is not configured on the server" }, { status: 500 });
    }

    const now = new Date();

    // Determine the start date of the slot by querying active/queued slots
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

      // If still not assigned, assign to slot with earliest boostedUntil
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

    // Determine when this slot will start
    let earliestStart = now;
    const endTimes = slots.map((timeline) => {
      if (timeline.length === 0) return now;
      const lastProj = timeline[timeline.length - 1];
      // Add 1 minute buffer as per spec: that slot's boostedUntil + 1 minute
      return lastProj.boostedUntil ? new Date(lastProj.boostedUntil.getTime() + 60000) : now;
    });

    const hasFreeSlot = endTimes.some((t) => t.getTime() <= now.getTime());
    if (!hasFreeSlot) {
      // Find the earliest end time among the 4 slots
      earliestStart = new Date(Math.min(...endTimes.map((t) => t.getTime())));
    }

    const durationDays = 30; // Starter Boost and Full Spotlight both have 30 day duration as per prompt
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/project/${projectId}`;

    const checkoutUrl = await createDodoCheckoutSession({
      productId,
      email: user.email,
      name: user.displayName,
      metadata: {
        projectId,
        userId: user.id,
        productType,
        startsAt: earliestStart.toISOString(),
        durationDays: durationDays.toString(),
      },
      returnUrl,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create boost checkout session" },
      { status: 500 }
    );
  }
}
