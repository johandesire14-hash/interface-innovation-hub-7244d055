import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, select, eq, neq } = vi.hoisted(() => ({
  from: vi.fn(), select: vi.fn(), eq: vi.fn(), neq: vi.fn(),
}));
vi.mock("../mansa/services/firebase", () => ({
  db: null, collection: vi.fn(), doc: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(),
  query: vi.fn(), runTransaction: vi.fn(), serverTimestamp: vi.fn(), where: vi.fn(),
}));
vi.mock("../mansa/services/supabase", () => ({ supabase: { from } }));

import {
  getAffiliateEligibleProducts, getAffiliateLinksForUser,
  createOrGetAffiliateLink, resolvePublicAffiliateCode,
} from "../mansa/services/affiliateService";

beforeEach(() => {
  vi.clearAllMocks();
  from.mockReturnValue({ select });
  select.mockReturnValue({ eq });
  eq.mockReturnValue({ neq });
  neq.mockResolvedValue({ data: [], error: null });
});

describe("Affiliation without the legacy Firestore configuration", () => {
  it("loads the current catalog without throwing a Firebase configuration error", async () => {
    await expect(getAffiliateEligibleProducts("member-1")).resolves.toEqual([]);
    expect(from).toHaveBeenCalledWith("offers");
    expect(eq).toHaveBeenCalledWith("status", "active");
    expect(neq).toHaveBeenCalledWith("creator_id", "member-1");
    await expect(getAffiliateLinksForUser("member-1")).resolves.toEqual([]);
  });

  it("does not invent programs or a default commission for current offers", async () => {
    neq.mockResolvedValue({ data: [{
      id: "offer-1", creator_id: "creator-1", name: "Cours", status: "active",
      price_amount: 30, currency: "EUR", metadata: null,
    }], error: null });
    await expect(getAffiliateEligibleProducts("member-1")).resolves.toEqual([]);
  });

  it("retains the exact explicitly configured rate", async () => {
    neq.mockResolvedValue({ data: [{
      id: "offer-1", creator_id: "creator-1", name: "Cours", status: "active",
      price_amount: 30, currency: "EUR", metadata: { affiliateCommissionRate: 12.75 },
    }], error: null });
    const products = await getAffiliateEligibleProducts("member-1");
    expect(products).toMatchObject([{ id: "offer-1", affiliateCommissionRate: 12.75, pricingAmount: 30 }]);
  });

  it("keeps real catalog read failures visible", async () => {
    const error = { code: "42501", message: "permission denied" };
    neq.mockResolvedValue({ data: null, error });
    await expect(getAffiliateEligibleProducts("member-1")).rejects.toEqual(error);
  });

  it("does not pretend to create or resolve unpersisted links", async () => {
    await expect(createOrGetAffiliateLink("member-1", {
      id: "offer-1", affiliateCommissionRate: 12.75,
    })).rejects.toThrow("La création de liens affiliés n’est pas encore disponible");
    await expect(resolvePublicAffiliateCode("a".repeat(32))).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
});