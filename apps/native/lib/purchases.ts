/**
 * Purchases — the seam where a store SDK goes.
 *
 * There is no IAP provider wired up yet, and this file exists so that adding one
 * is a change in ONE place rather than a change to every screen that sells
 * something. Everything above it — the Store rows, the Wall, the entitlement
 * rules in `progress.ts` — is already finished and testable against this.
 *
 * ── Why this refuses rather than pretends ───────────────────────────────────
 * The obvious placeholder is to grant the pack and sort the billing out later.
 * That placeholder ships. Somebody builds a release, the tap "works", and every
 * paid pack in the app is free — and the bug is invisible in testing precisely
 * because it looks like success. So the unconfigured path FAILS, loudly enough
 * to notice and quietly enough not to alarm a player, and only a development
 * build grants anything.
 */

/** Product ids as they will be registered with the stores. */
export const productId = {
  pack: (packId: string) => `com.wordquilt.pack.${packId.replace(/-/g, "")}`,
  collection: (name: string) => `com.wordquilt.collection.${name}`,
  hints: (n: number) => `com.wordquilt.hints.${n}`,
};

export type PurchaseResult =
  | { ok: true; productIds: string[] }
  | { ok: false; reason: "unavailable" | "cancelled" | "failed" };

/** Whether a real store connection exists. False until an SDK is wired in. */
export const purchasesConfigured = false;

/**
 * Buy one or more products.
 *
 * Returns the product ids actually granted, so the caller records entitlements
 * from the store's answer rather than from what it hoped would happen.
 */
export async function purchase(productIds: string[]): Promise<PurchaseResult> {
  if (!purchasesConfigured) {
    // A development build may grant, so the flow can be walked end to end.
    // A release build may not, on any account.
    if (__DEV__) return { ok: true, productIds };
    return { ok: false, reason: "unavailable" };
  }
  // The SDK call goes here, and nothing else in the app needs to change.
  return { ok: false, reason: "unavailable" };
}

/**
 * Restore what has already been paid for.
 *
 * Reachable from the header of the Store, ABOVE every purchasable item — a
 * player who has already paid should not have to scroll past things being sold
 * to them to get back what they own.
 */
export async function restore(): Promise<PurchaseResult> {
  if (!purchasesConfigured) return { ok: false, reason: "unavailable" };
  return { ok: false, reason: "unavailable" };
}
