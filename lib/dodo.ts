export async function createDodoCheckoutSession({
  productId,
  email,
  name,
  metadata,
  returnUrl,
}: {
  productId: string;
  email: string;
  name?: string;
  metadata: Record<string, string>;
  returnUrl: string;
}) {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) {
    throw new Error("DODO_API_KEY is not defined in environment variables.");
  }

  // Dodo API keys for live mode usually start with dp_live, and test keys with dp_test.
  // We determine the environment based on the prefix of the API key or NODE_ENV.
  const isTest = !apiKey.startsWith("dp_live");
  const baseUrl = isTest ? "https://test.dodopayments.com" : "https://live.dodopayments.com";

  const response = await fetch(`${baseUrl}/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email,
        name: name || undefined,
      },
      metadata,
      return_url: returnUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dodo Payments Checkout Session Creation failed: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { checkout_url: string };
  return data.checkout_url;
}
