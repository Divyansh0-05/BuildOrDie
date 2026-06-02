import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const project = id
    ? await db.project.findUnique({
        where: { id },
        select: { title: true, tagline: true, deadlineAt: true },
      })
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#080810",
          color: "#F0F0FF",
          padding: "72px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ color: "#FF4D00", fontSize: 32, fontWeight: 900 }}>
          BuildOrDie
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 24 }}>
          {project?.title ?? "BuildOrDie"}
        </div>
        <div style={{ color: "#8888AA", fontSize: 32, marginTop: 24 }}>
          {project?.tagline ?? "Build it. Launch it. 4 days. Or get kicked."}
        </div>
        {project ? (
          <div style={{ color: "#F59E0B", fontSize: 24, marginTop: 32 }}>
            Deadline: {project.deadlineAt.toUTCString()}
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
