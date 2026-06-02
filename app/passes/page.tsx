"use client";

const products = [
  { productType: "starter", name: "Starter Boost", price: "$19", copy: "3-day featured strip slot for one project.", endpoint: "/api/payments/create-boost-slot" },
  { productType: "spotlight", name: "Full Spotlight", price: "$39", copy: "7-day featured strip slot for one project.", endpoint: "/api/payments/create-boost-slot" },
  { productType: "founderPass", name: "Founder Pass", price: "$79", copy: "2 active ideas, grace extension, Founder badge.", endpoint: "/api/payments/create-pass" },
  { productType: "investorAccess", name: "Investor Access", price: "$199", copy: "6 months of early feed access.", endpoint: "/api/payments/create-pass" },
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
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-4xl font-black">Passes</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.name} className="border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">{product.name}</h2>
                  <p className="mt-2 text-text-secondary">{product.copy}</p>
                </div>
                <span className="font-mono text-2xl font-black text-brand-orange">{product.price}</span>
              </div>
              <button onClick={() => buy(product)} className="mt-6 w-full bg-brand-orange px-4 py-3 font-bold text-bg-primary">
                Pay once
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
