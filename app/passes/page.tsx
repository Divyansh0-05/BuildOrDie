"use client";

import { PassCard } from "@/components/ui/primitives";

const products = [
  {
    productType: "founderPass",
    name: "Founder Pass",
    price: "$79",
    copy: "2 active ideas, grace extension, Founder badge.",
    period: "ONE-TIME · LIFETIME",
    features: [
      "2 active ideas at once",
      "6h automatic grace extension",
      "⚡ Founder badge — forever",
      "Priority boost queue position",
      "Access to locked tools",
    ],
    isPopular: true,
    ctaText: "Become a Founder — $79 →",
    endpoint: "/api/payments/create-pass",
  },
  {
    productType: "spotlight",
    name: "Full Spotlight",
    price: "$39",
    copy: "7-day featured strip slot for one project.",
    period: "ONE-TIME · 7-DAY SLOT",
    features: [
      "7 days in the featured strip",
      "~15,000 daily impressions",
      "Priority queue position",
      "Highlighted in weekly digest",
    ],
    isPopular: false,
    ctaText: "Get Spotlight — $39 →",
    endpoint: "/api/payments/create-boost-slot",
  },
  {
    productType: "starter",
    name: "Starter Boost",
    price: "$19",
    copy: "3-day featured strip slot for one project.",
    period: "ONE-TIME · 3-DAY SLOT",
    features: [
      "3 days in the featured strip",
      "~5,000 daily impressions",
      "BOOSTED badge on your card",
      "Transparent queue if full",
    ],
    isPopular: false,
    ctaText: "Boost for $19 →",
    endpoint: "/api/payments/create-boost-slot",
  },
  {
    productType: "investorAccess",
    name: "Investor Access",
    price: "$199",
    copy: "6 months of early feed access.",
    period: "ONE-TIME · 6 MONTHS",
    features: [
      "Private early-stage feed",
      "Express Interest on projects",
      "Direct contact with builders",
      "Weekly top-10 digest",
      "First look before public",
    ],
    isPopular: false,
    ctaText: "Get Investor Access →",
    endpoint: "/api/payments/create-pass",
  },
];

export default function PassesPage() {
  async function buy(product: (typeof products)[number]) {
    const body = product.endpoint.includes("boost")
      ? { productType: product.productType, projectId: "" }
      : { productType: product.productType };
    const response = await fetch(product.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    else alert(data.error ?? "Checkout unavailable.");
  }

  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary pb-20 select-none">
      <section className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-gothic text-4xl font-bold tracking-wide text-text-primary mb-1">
            Sacred Offerings
          </h1>
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            {"// ONE-TIME PAYMENTS. NO SUBSCRIPTIONS. NO MONTHLY CHARGES. EVER."}
          </p>
        </div>

        {/* Passes card Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <PassCard
              key={product.name}
              name={product.name}
              price={product.price}
              period={product.period}
              features={product.features}
              onBuy={() => buy(product)}
              isPopular={product.isPopular}
              ctaText={product.ctaText}
            />
          ))}
        </div>

        <div className="font-mono text-[9px] text-text-muted text-center uppercase tracking-wider pt-6">
          All payments processed by Dodo Payments • No subscriptions • Lifetime deals are permanent offerings
        </div>
      </section>
    </main>
  );
}
