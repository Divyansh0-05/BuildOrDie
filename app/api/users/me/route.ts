import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureLocalUser } from "@/lib/auth/local-user";
import { db } from "@/lib/db";

const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
    displayName?: unknown;
    bio?: unknown;
    xHandle?: unknown;
  } | null;

  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const bio = typeof body?.bio === "string" ? body.bio.trim() : null;
  const xHandle =
    typeof body?.xHandle === "string"
      ? body.xHandle.trim().replace(/^@+/, "")
      : null;

  if (!usernamePattern.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 chars: letters, numbers, underscores." },
      { status: 400 },
    );
  }

  if (!displayName) {
    return NextResponse.json(
      { error: "Display name is required." },
      { status: 400 },
    );
  }

  if (bio && bio.length > 160) {
    return NextResponse.json(
      { error: "Bio must be 160 chars or less." },
      { status: 400 },
    );
  }

  const currentUser = await ensureLocalUser(userId);

  if (!currentUser) {
    return NextResponse.json(
      { error: "Could not create local user record from Clerk profile." },
      { status: 409 },
    );
  }

  const existingUsername = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existingUsername && existingUsername.id !== currentUser.id) {
    return NextResponse.json(
      { error: "Username is already taken." },
      { status: 409 },
    );
  }

  const updatedUser = await db.user.update({
    where: { id: currentUser.id },
    data: {
      username,
      displayName,
      bio: bio || null,
      xHandle: xHandle || null,
    },
    select: {
      username: true,
      displayName: true,
      bio: true,
      xHandle: true,
    },
  });

  return NextResponse.json(updatedUser);
}
