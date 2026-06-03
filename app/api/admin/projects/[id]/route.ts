import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { db } from "@/lib/db";
import { ProjectStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await ensureLocalUser(userId);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin Access Required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { status, isFeatured } = body || {};

  const updateData: { status?: ProjectStatus; isFeatured?: boolean } = {};
  if (status !== undefined) {
    if (!Object.values(ProjectStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    updateData.status = status;
  }
  if (isFeatured !== undefined) {
    if (typeof isFeatured !== "boolean") {
      return NextResponse.json({ error: "isFeatured must be a boolean" }, { status: 400 });
    }
    updateData.isFeatured = isFeatured;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const updatedProject = await db.$transaction(async (tx) => {
      const currentProject = await tx.project.findUnique({
        where: { id: params.id },
        select: { status: true, userId: true },
      });

      if (!currentProject) {
        throw new Error("Project not found");
      }

      // If project is manual kicked, increment the user's totalKicked counter
      if (status === ProjectStatus.KICKED && currentProject.status !== ProjectStatus.KICKED) {
        await tx.user.update({
          where: { id: currentProject.userId },
          data: { totalKicked: { increment: 1 } },
        });
      }

      const updated = await tx.project.update({
        where: { id: params.id },
        data: updateData,
      });

      return updated;
    });

    return NextResponse.json(updatedProject);
  } catch (error: unknown) {
    console.error("Admin project update failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update project";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
