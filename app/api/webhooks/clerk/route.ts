import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkUserPayload = {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
};

type ClerkWebhookEvent = {
  type: "user.created" | "user.deleted" | string;
  data: ClerkUserPayload;
};

function pendingUsername(clerkId: string) {
  return `pending_${clerkId.replace(/[^A-Za-z0-9_]/g, "_")}`;
}

function displayNameFor(data: ClerkUserPayload, email: string) {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
  return fullName || data.username || email.split("@")[0] || "Builder";
}

function primaryEmailFor(data: ClerkUserPayload) {
  const primary = data.email_addresses?.find(
    (email) => email.id === data.primary_email_address_id,
  );
  return primary?.email_address ?? data.email_addresses?.[0]?.email_address;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const webhook = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  if (event.type === "user.created") {
    const email = primaryEmailFor(event.data);

    if (!email) {
      return NextResponse.json(
        { error: "Clerk user is missing an email address." },
        { status: 400 },
      );
    }

    await db.user.upsert({
      where: { clerkId: event.data.id },
      create: {
        clerkId: event.data.id,
        email,
        username: pendingUsername(event.data.id),
        displayName: displayNameFor(event.data, email),
        avatarUrl: event.data.image_url ?? null,
      },
      update: {
        email,
        displayName: displayNameFor(event.data, email),
        avatarUrl: event.data.image_url ?? null,
        deletedAt: null,
      },
    });
  }

  if (event.type === "user.deleted") {
    await db.user.updateMany({
      where: { clerkId: event.data.id },
      data: { deletedAt: new Date() },
    });
  }

  return NextResponse.json({ received: true });
}
