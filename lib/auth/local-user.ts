import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;
type LocalClerkProfile = {
  clerkId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

function pendingUsername(clerkId: string) {
  return `pending_${clerkId.replace(/[^A-Za-z0-9_]/g, "_")}`;
}

function displayNameFor(user: ClerkUser, email: string) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username || email.split("@")[0] || "Builder";
}

function primaryEmailFor(user: ClerkUser) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function upsertLocalUserFromClerkProfile(
  profile: LocalClerkProfile,
) {
  const existingUser = await db.user.findUnique({
    where: { clerkId: profile.clerkId },
  });

  if (existingUser) {
    if (existingUser.deletedAt) {
      return db.user.update({
        where: { id: existingUser.id },
        data: { deletedAt: null },
      });
    }

    return existingUser;
  }

  const userByEmail = await db.user.findUnique({
    where: { email: profile.email },
  });

  if (userByEmail) {
    return db.user.update({
      where: { id: userByEmail.id },
      data: {
        clerkId: profile.clerkId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        deletedAt: null,
      },
    });
  }

  return db.user.create({
    data: {
      clerkId: profile.clerkId,
      email: profile.email,
      username: pendingUsername(profile.clerkId),
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
  });
}

export async function ensureLocalUser(clerkId: string) {
  const existingUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    if (existingUser.deletedAt) {
      return db.user.update({
        where: { id: existingUser.id },
        data: { deletedAt: null },
      });
    }

    return existingUser;
  }

  const user = await currentUser();

  if (!user || user.id !== clerkId) {
    return null;
  }

  const email = primaryEmailFor(user);

  if (!email) {
    return null;
  }

  return upsertLocalUserFromClerkProfile({
    clerkId,
    email,
    displayName: displayNameFor(user, email),
    avatarUrl: user.imageUrl || null,
  });
}
