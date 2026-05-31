import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const revalidate = 3600;

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalDeclared,
    totalShipped,
    totalKicked,
    weeklyDeclared,
    weeklyShipped,
  ] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: ProjectStatus.LAUNCHED } }),
    db.project.count({ where: { status: ProjectStatus.KICKED } }),
    db.project.count({
      where: { ideaDeclaredAt: { gte: sevenDaysAgo } },
    }),
    db.project.count({
      where: {
        status: ProjectStatus.LAUNCHED,
        launchedAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  const weeklyShipRate =
    weeklyDeclared === 0
      ? 0
      : Math.round((weeklyShipped / weeklyDeclared) * 100);

  return NextResponse.json({
    totalDeclared,
    totalShipped,
    totalKicked,
    weeklyShipRate,
  });
}
