import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserDashboard } from "@/mansa/components/UserDashboard";

const { fromMock, companies, product } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  companies: [
    {
      id: "company-back-home",
      name: "Studio Test",
      ownerUid: "creator-back-home",
      createdAt: "2026-01-01T00:00:00.000Z",
      discoverable: true,
    },
  ],
  product: {
    id: "offer-back-home",
    creatorId: "creator-back-home",
    companyId: "company-back-home",
    companyName: "Studio Test",
    name: "Pack Back Accueil",
    tagline: "Offre de test",
    category: "community",
    pricingAmount: 10,
    pricingModel: "one_time",
    currency: "USD",
    targetAudience: "Tous",
    status: "active",
    features: [],
    techStack: [],
    estimatedMonthlyRevenue: 0,
    affiliateCommissionRate: 25,
    membersCount: 3,
    conversionRate: "0%",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    apps: ["Telegram", "Discord", "Cours & Formations", "Fichiers & Téléchargements"],
    storeUrl: "mansa.af/p/offer-back-home",
    digitalFiles: [{ id: "file-1", name: "Guide.pdf" }],
    courseModules: [{ id: "module-1", title: "Module 1", lessons: [] }],
  },
}));

vi.mock("@/mansa/context/AuthContext", () => ({
  useAuth: () => ({
    profile: null,
    deleteAccount: vi.fn(),
    loading: false,
    error: null,
    user: { uid: "creator-back-home", name: "Awa", email: "awa@example.test" },
  }),
}));

vi.mock("@/mansa/utils/companyStorage", () => ({
  getSavedCompanies: () => companies,
  loadCreatorCompanies: vi.fn().mockResolvedValue(companies),
  saveCompany: vi.fn(),
  updateCompanyBranding: vi.fn(),
}));

vi.mock("@/mansa/services/dbService", () => ({
  subscribeToCreatorProducts: (_creatorId: string, callback: (p: any[]) => void) => {
    callback([product]);
    return () => {};
  },
  subscribeToCreatorTransactions: (_creatorId: string, callback: (t: any[]) => void) => {
    callback([]);
    return () => {};
  },
  subscribeToCreatorCustomers: (_creatorId: string, callback: (c: any[]) => void) => {
    callback([]);
    return () => {};
  },
  saveProductToFirestore: vi.fn(),
  deleteProductFromFirestore: vi.fn(),
  saveProductPrivateContent: vi.fn(),
  createRealTransaction: vi.fn(),
  loadVerifiedMemberContent: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/mansa/services/supabase", () => ({
  supabase: {
    from: fromMock,
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
  isActiveSupabaseSession: () => false,
  requireActiveSupabaseSession: vi.fn().mockResolvedValue({ access_token: "token" }),
}));

vi.mock("@/mansa/services/supabaseMemberAccessService", () => ({
  fetchMemberAccessFromSupabase: vi.fn().mockResolvedValue({ subscriptions: [] }),
}));

vi.mock("@/mansa/services/supabasePrivateMessagingService", () => ({
  fetchPrivateConversations: vi.fn().mockResolvedValue([]),
  markPrivateConversationAsRead: vi.fn().mockResolvedValue(undefined),
  sendPrivateMessage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/mansa/services/supabaseCommunityService", () => ({
  fetchMemberCommunities: vi.fn().mockResolvedValue([]),
  fetchCreatorCommunities: vi.fn().mockResolvedValue([]),
  fetchDiscoverableCommunities: vi.fn().mockResolvedValue([]),
  fetchCommunityMemberCount: vi.fn().mockResolvedValue(0),
  saveCommunityToSupabase: vi.fn().mockResolvedValue(undefined),
  deleteCommunityFromSupabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/mansa/services/supabaseStorageService", () => ({
  uploadOfferFile: vi.fn(),
  deleteOfferFile: vi.fn(),
}));

vi.mock("@/mansa/services/supabaseOfferService", () => ({
  saveCreatorCourseToOffer: vi.fn(),
  deleteCreatorCourseFromOffer: vi.fn(),
}));

const user = {
  uid: "creator-back-home",
  name: "Awa",
  email: "awa@example.test",
  avatarInitials: "AW",
};

const renderDashboard = () =>
  render(<UserDashboard user={user} onLogout={vi.fn()} lang="fr" />);

const openCompanyWorkspace = async () => {
  const companyButton = await screen.findByTitle("Mon Entreprise : Studio Test");
  fireEvent.click(companyButton);
};

const expectHomeOverview = async () => {
  await waitFor(() => {
    expect(document.getElementById("dashboard-overview")).not.toBeNull();
  });
};

const openWorkspaceFromCatalog = async (appTitle: string) => {
  await openCompanyWorkspace();
  fireEvent.click(screen.getByRole("button", { name: "Ajouter application" }));
  const heading = await screen.findByRole("heading", { name: appTitle });
  const card = heading.closest<HTMLElement>(".rounded-xl");
  if (!card) throw new Error(`Carte introuvable : ${appTitle}`);
  fireEvent.click(within(card).getByRole("button", { name: "+ Installer sur un business" }));
  fireEvent.click(await screen.findByRole("button", { name: "Confirmer et continuer" }));
};

describe("retour à l'accueil depuis les quatre applications", () => {
  beforeEach(() => {
    localStorage.clear();
    fromMock.mockReset();
    fromMock.mockImplementation(() => ({
      select: () => ({
        in: () => ({ order: async () => ({ data: [], error: null }) }),
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
      insert: async () => ({ error: null }),
      delete: () => ({ in: async () => ({ error: null }) }),
    }));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it(
    "ramène Fichiers, Cours, Telegram et Discord sur la même page d'accueil",
    async () => {
      renderDashboard();
    await expectHomeOverview();

    // Fichiers
    await openWorkspaceFromCatalog("Fichiers & Téléchargements");
    expect(await screen.findByRole("heading", { name: "Fichiers du produit" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retour à l'accueil" }));
    await expectHomeOverview();
    expect(screen.queryByRole("heading", { name: "Fichiers du produit" })).not.toBeInTheDocument();

    // Cours
    await openWorkspaceFromCatalog("Cours & Formations");
    expect(await screen.findByRole("heading", { name: "Cours & Formations" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retour à l'accueil" }));
    await expectHomeOverview();
    expect(screen.queryByRole("heading", { name: "Informations du cours" })).not.toBeInTheDocument();

    // Telegram
    fireEvent.click(screen.getByRole("button", { name: "Telegram" }));
    expect(await screen.findByRole("button", { name: "Retour à l'accueil" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retour à l'accueil" }));
    await expectHomeOverview();

    // Discord
    fireEvent.click(screen.getByRole("button", { name: "Discord" }));
    expect(await screen.findByRole("button", { name: "Retour à l'accueil" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retour à l'accueil" }));
      await expectHomeOverview();
    },
    40000,
  );
});
