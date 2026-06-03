import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { db } from "@/lib/db";
import { sendEmail, investorInterestEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await ensureLocalUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Double authorization check inside API handler
  const now = new Date();
  const isInvestor =
    user.role === "INVESTOR" &&
    user.investorAccessUntil &&
    user.investorAccessUntil > now;

  if (!isInvestor) {
    return NextResponse.json(
      { error: "Forbidden: Active Investor Access Required" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const { projectId } = body || {};

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const emailData = await investorInterestEmail(
      project.title,
      user.displayName,
      user.email,
      project.user.displayName
    );

    await sendEmail({
      to: project.user.email,
      ...emailData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send investor interest email:", error);
    return NextResponse.json(
      { error: "Failed to send notification email" },
      { status: 500 }
    );
  }
}
