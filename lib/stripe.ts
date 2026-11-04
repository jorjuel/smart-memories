import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey =
    process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is missing.'
    );
  }

  // Fail closed if someone accidentally configures a live Stripe key
  // before the required trader identity and launch approval are set.
  if (secretKey.startsWith('sk_live_')) {
    const approved =
      process.env.SMART_MEMORIES_LIVE_PAYMENTS_ENABLED === 'true';
    const traderDetailsReady =
      Boolean(process.env.SMART_MEMORIES_TRADER_LEGAL_NAME?.trim()) &&
      Boolean(process.env.SMART_MEMORIES_TRADER_ADDRESS?.trim()) &&
      Boolean(process.env.SMART_MEMORIES_TRADER_EMAIL?.trim());
    if (!approved || !traderDetailsReady) {
      throw new Error(
        'Live Stripe payments are disabled pending launch approval and trader identity details.'
      );
    }
  }

  if (!stripeClient) {
    stripeClient =
      new Stripe(secretKey);
  }

  return stripeClient;
}