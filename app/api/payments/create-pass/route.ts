import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureLocalUser } from "@/lib/auth/local-user";
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
    const type = body?.productType; // "founderPass" | "investorAccess"

    let productId = "";
    let productType = "";

    const isFounder = type === "founder" || type === "founderPass" || type === "DODO_FOUNDER_PASS_PRODUCT_ID";
    const isInvestor = type === "investor" || type === "investorAccess" || type === "DODO_INVESTOR_ACCESS_PRODUCT_ID";

    if (isFounder) {
      productId = process.env.DODO_FOUNDER_PASS_PRODUCT_ID || "";
      productType = "founderPass";
    } else if (isInvestor) {
      productId = process.env.DODO_INVESTOR_ACCESS_PRODUCT_ID || "";
      productType = "investorAccess";
    } else {
      if (body?.productId) {
        productId = body.productId;
        if (productId === process.env.DODO_FOUNDER_PASS_PRODUCT_ID) {
          productType = "founderPass";
        } else if (productId === process.env.DODO_INVESTOR_ACCESS_PRODUCT_ID) {
          productType = "investorAccess";
        } else {
          productType = "pass";
        }
      } else {
        return NextResponse.json({ error: "Invalid or missing productType" }, { status: 400 });
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is not configured on the server" }, { status: 500 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;

    const checkoutUrl = await createDodoCheckoutSession({
      productId,
      email: user.email,
      name: user.displayName,
      metadata: {
        userId: user.id,
        productType,
      },
      returnUrl,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
