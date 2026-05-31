import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { db } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: { projectId: string } },
) {
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

  const result = await db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: params.projectId },
      select: { id: true, voteCount: true },
    });

    if (!project) {
      return null;
    }

    const existingVote = await tx.vote.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: params.projectId,
        },
      },
    });

    if (existingVote) {
      await tx.vote.delete({ where: { id: existingVote.id } });
      const updatedProject = await tx.project.update({
        where: { id: project.id },
        data: { voteCount: { decrement: project.voteCount > 0 ? 1 : 0 } },
        select: { voteCount: true },
      });

      return { voted: false, voteCount: updatedProject.voteCount };
    }

    await tx.vote.create({
      data: {
        userId: user.id,
        projectId: params.projectId,
      },
    });
    const updatedProject = await tx.project.update({
      where: { id: project.id },
      data: { voteCount: { increment: 1 } },
      select: { voteCount: true },
    });

    return { voted: true, voteCount: updatedProject.voteCount };
  });

  if (!result) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
