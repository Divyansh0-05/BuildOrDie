import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import {
    sendEmail,
    founderPassEmail,
    boostQueuedEmail,
} from "@/lib/email";
import {
    scheduleBoostActivation,
    scheduleBoostExpiry,
} from "@/lib/inngest/events";

interface DodoWebhookEvent {
    id?: string;
    event_id?: string;
    type?: string;
    event_type?: string;
    data?: {
        product_id?: string;
        customer_id?: string;
        customer?: {
            email?: string;
        };
        metadata?: Record<string, string>;
        object?: {
            id?: string;
            product_id?: string;
            product_cart?: Array<{
                product_id: string;
                quantity: number;
            }>;
            customer?: {
                email?: string;
            };
            metadata?: Record<string, string>;
        };
    };
    metadata?: Record<string, string>;
}

export async function POST(request: Request) {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Missing DODO_WEBHOOK_SECRET");
        return NextResponse.json(
            { error: "Missing DODO_WEBHOOK_SECRET" },
            { status: 500 }
        );
    }

    // Retrieve standard webhook headers
    const webhookId = request.headers.get("webhook-id") || request.headers.get("svix-id");
    const webhookTimestamp = request.headers.get("webhook-timestamp") || request.headers.get("svix-timestamp");
    const webhookSignature = request.headers.get("webhook-signature") || request.headers.get("svix-signature");

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
        return NextResponse.json(
            { error: "Missing webhook signature headers" },
            { status: 400 }
        );
    }

    const payload = await request.text();
    const webhook = new Webhook(webhookSecret);
    let event: DodoWebhookEvent;

    try {
        event = webhook.verify(payload, {
            "svix-id": webhookId,
            "svix-timestamp": webhookTimestamp,
            "svix-signature": webhookSignature,
        }) as DodoWebhookEvent;
    } catch (err) {
        console.error("Invalid webhook signature verification:", err);
        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    // Handle only payment.succeeded events for one-time purchases
    const eventType = event.type || event.event_type;
    if (eventType !== "payment.succeeded") {
        return NextResponse.json({ received: true, message: `Ignored event type: ${eventType}` });
    }

    const eventId = event.id || event.event_id || webhookId;

    try {
        const result = await db.$transaction(async (tx) => {
            // 1. Idempotency Check: check if event has already been processed
            const existingLog = await tx.dodoWebhookLog.findUnique({
                where: { eventId },
            });

            if (existingLog) {
                return { duplicate: true };
            }

            // Log the event ID to guarantee idempotency for future retries
            await tx.dodoWebhookLog.create({
                data: { eventId },
            });

            // 2. Identify the product from the payment payload
            const productId =
                event.data?.product_id ||
                event.data?.object?.product_id ||
                event.data?.object?.product_cart?.[0]?.product_id;

            // Extract metadata
            const metadata =
                event.data?.object?.metadata ||
                event.data?.metadata ||
                event.metadata ||
                {};

            const userId = metadata.userId;
            const projectId = metadata.projectId;
            const productType = metadata.productType;

            const isFounderPass =
                productId === process.env.DODO_FOUNDER_PASS_PRODUCT_ID ||
                productType === "founderPass";

            const isInvestorAccess =
                productId === process.env.DODO_INVESTOR_ACCESS_PRODUCT_ID ||
                productType === "investorAccess";

            const isStarterBoost =
                productId === process.env.DODO_STARTER_BOOST_PRODUCT_ID ||
                productType === "starterBoost";

            const isFullSpotlight =
                productId === process.env.DODO_FULL_SPOTLIGHT_PRODUCT_ID ||
                productType === "fullSpotlight";

            // 3. Look up user by userId from metadata or by customer email from payload
            const customerEmail =
                event.data?.object?.customer?.email ||
                event.data?.customer?.email;

            const user = await tx.user.findFirst({
                where: {
                    OR: [
                        { id: userId || "undefined_id" },
                        { clerkId: userId || "undefined_clerk_id" },
                        { email: customerEmail || "undefined_email" },
                    ],
                },
            });

            if (!user) {
                throw new Error(`User not found for payment. userId: ${userId}, email: ${customerEmail}`);
            }

            // 4. Handle product logic
            if (isFounderPass) {
                await tx.user.update({
                    where: { id: user.id },
                    data: { plan: "FOUNDER" },
                });

                return { success: true, type: "founderPass", email: user.email, userId: user.id };
            }

            if (isInvestorAccess) {
                const now = new Date();
                let newAccessUntil = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

                if (user.investorAccessUntil && user.investorAccessUntil > now) {
                    newAccessUntil = new Date(user.investorAccessUntil.getTime() + 180 * 24 * 60 * 60 * 1000);
                }

                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        role: "INVESTOR",
                        investorAccessUntil: newAccessUntil,
                    },
                });

                return { success: true, type: "investorAccess", email: user.email, userId: user.id };
            }

            if (isStarterBoost || isFullSpotlight) {
                if (!projectId) {
                    throw new Error("Missing projectId in metadata for boost/spotlight product");
                }

                const project = await tx.project.findUnique({
                    where: { id: projectId },
                });

                if (!project) {
                    throw new Error(`Project ${projectId} not found for boost/spotlight`);
                }

                const now = new Date();
                const startsAt = metadata.startsAt ? new Date(metadata.startsAt) : now;
                let durationDays = 30;
                if (metadata.durationDays) {
                    durationDays = parseInt(metadata.durationDays, 10);
                } else if (isStarterBoost) {
                    durationDays = 3;
                } else if (isFullSpotlight) {
                    durationDays = 7;
                }
                const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

                const isNowActive = startsAt <= now;

                await tx.project.update({
                    where: { id: projectId },
                    data: {
                        isBoosted: isNowActive ? true : false,
                        boostedFrom: startsAt,
                        boostedUntil: endsAt,
                        isFeatured: isFullSpotlight ? (isNowActive ? true : false) : project.isFeatured,
                    },
                });

                return {
                    success: true,
                    type: isFullSpotlight ? "fullSpotlight" : "starterBoost",
                    projectId,
                    projectTitle: project.title,
                    startsAt,
                    endsAt,
                    email: user.email,
                    userId: user.id,
                };
            }

            throw new Error(`Unknown product with ID ${productId}`);
        });

        if (result?.duplicate) {
            return NextResponse.json({ received: true, message: "Duplicate event ignored" });
        }

        // 5. Send out notifications and schedule Inngest jobs outside the database transaction
        if (result?.success) {
            if (result.type === "founderPass") {
                try {
                    const emailData = await founderPassEmail();
                    await sendEmail({
                        to: result.email!,
                        ...emailData,
                    });
                } catch (emailErr) {
                    console.error("Failed to send Founder Pass email", emailErr);
                }

                if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"}/capture/`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
                                event: "founder_pass_purchased",
                                properties: {
                                    distinct_id: result.userId,
                                    email: result.email,
                                },
                            }),
                        });
                    } catch (phErr) {
                        console.error("Failed to track founder_pass_purchased in PostHog:", phErr);
                    }
                }
            }

            if (result.type === "starterBoost" || result.type === "fullSpotlight") {
                try {
                    await scheduleBoostActivation(result.projectId!, result.startsAt!);
                    await scheduleBoostExpiry(result.projectId!, result.endsAt!);
                } catch (jobErr) {
                    console.error("Failed to schedule Inngest jobs", jobErr);
                }

                try {
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
                    const projectUrl = `${appUrl}/project/${result.projectId}`;
                    const emailData = await boostQueuedEmail(
                        result.projectTitle!,
                        result.startsAt!.toLocaleString(),
                        projectUrl
                    );
                    await sendEmail({
                        to: result.email!,
                        ...emailData,
                    });
                } catch (emailErr) {
                    console.error("Failed to send Boost Queued email", emailErr);
                }

                if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"}/capture/`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
                                event: "boost_purchased",
                                properties: {
                                    distinct_id: result.userId,
                                    projectId: result.projectId,
                                    projectTitle: result.projectTitle,
                                    productType: result.type,
                                },
                            }),
                        });
                    } catch (phErr) {
                        console.error("Failed to track boost_purchased in PostHog:", phErr);
                    }
                }
            }

            return NextResponse.json({ received: true, processed: true, productType: result.type });
        }

        return NextResponse.json({ received: true, message: "No actions taken" });
    } catch (error: unknown) {
        console.error("Error processing Dodo webhook:", error);
        // Return a 500 status so Dodo Payments will retry delivery
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to process webhook" },
            { status: 500 }
        );
    }
}
