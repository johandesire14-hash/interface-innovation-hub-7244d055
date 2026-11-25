import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnterpriseMemberView } from "@/mansa/components/dashboard/EnterpriseMemberView";

const {
  fetchMemberCommunitiesMock,
  persistFreeMemberEntitlementMock,
  subscribeToCompanyOffersMock,
  getMemberProductsByIdsMock,
  fetchPublicCreatorProfileIdentityMock,
} = vi.hoisted(() => ({
  fetchMemberCommunitiesMock: vi.fn().mockResolvedValue(["company-back-btn"]),
  persistFreeMemberEntitlementMock: vi.fn().mockResolvedValue(undefined),
  subscribeToCompanyOffersMock: vi.fn(),
  getMemberProductsByIdsMock: vi.fn().mockResolvedValue([]),
  fetchPublicCreatorProfileIdentityMock: vi.fn(),
}));

vi.mock("@/mansa/services/supabaseCommunityService", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchMemberCommunities: fetchMemberCommunitiesMock,
}));

vi.mock("@/mansa/services/dbService", async (importOriginal) => ({
  ...(await importOriginal()),
  persistFreeMemberEntitlement: persistFreeMemberEntitlementMock,
  subscribeToCompanyOffers: subscribeToCompanyOffersMock,
  getMemberProductsByIds: getMemberProductsByIdsMock,
}));

vi.mock("@/mansa/services/supabaseProfileService", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchPublicCreatorProfileIdentity: fetchPublicCreatorProfileIdentityMock,
}));

const BAR_BACK = "Retour à la navigation de l’entreprise";

const renderOwnerSpace = () =>
  render(
    <EnterpriseMemberView
      lang="fr"
      user={{ uid: "creator-back-btn", name: "Awa Bah", email: "creator@example.test" }}
      subscription={
        {
          id: "sub-back-btn",
          companyId: "company-back-btn",
          creatorId: "creator-back-btn",
          companyName: "Communauté test",
          productName: "Produit test",
          priceDisplay: "Gratuit",
          status: "active",
          hasJoined: true,
          includedApps: ["dashboard", "support", "Telegram", "Discord"],
          telegramChannels: [],
        } as any
      }
    />,
  );

describe("bouton retour des écrans Telegram et Discord", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchPublicCreatorProfileIdentityMock.mockResolvedValue({
      uid: "creator-back-btn",
      displayName: "Awa Bah",
      handle: "awa-bah",
    });
    subscribeToCompanyOffersMock.mockImplementation((_companyId, callback) => {
      callback([
        {
          id: "offer-back-btn",
          title: "Produit test",
          companyId: "company-back-btn",
          companyName: "Communauté test",
          category: "community",
          priceDisplay: "Gratuit",
          priceAmount: 0,
          currency: "XOF",
          pricingType: "free",
          billingCycle: "one_time",
          includedApps: ["Telegram", "Discord"],
        },
      ]);
      return () => {};
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("ne garde qu’un seul retour sur l’écran Discord", async () => {
    renderOwnerSpace();
    await screen.findByText("@awa-bah");

    fireEvent.click(screen.getByRole("button", { name: "Discord" }));

    // L’écran Discord affiche son propre retour libellé ; la barre mobile ne doit
    // plus ajouter sa flèche au-dessus.
    expect(screen.getByRole("button", { name: "Retour à l'accueil" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: BAR_BACK })).not.toBeInTheDocument();
  });

  it("conserve le retour de la barre sur le catalogue des applications", async () => {
    renderOwnerSpace();
    await screen.findByText("@awa-bah");

    fireEvent.click(screen.getByRole("button", { name: "Ajouter une application" }));

    // Le catalogue n’a pas de retour à lui : la barre mobile doit rester son seul chemin.
    expect(screen.getByRole("button", { name: BAR_BACK })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retour à l'accueil" })).not.toBeInTheDocument();
  });
});

describe("Fichiers et Cours dans l’espace membre", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchPublicCreatorProfileIdentityMock.mockResolvedValue({
      uid: "creator-back-btn",
      displayName: "Awa Bah",
      handle: "awa-bah",
    });
    subscribeToCompanyOffersMock.mockImplementation((_companyId, callback) => {
      callback([
        {
          id: "offer-back-btn",
          title: "Produit test",
          companyId: "company-back-btn",
          companyName: "Communauté test",
          category: "community",
          priceDisplay: "Gratuit",
          priceAmount: 0,
          currency: "XOF",
          pricingType: "free",
          billingCycle: "one_time",
          includedApps: ["Telegram", "Fichiers", "Cours"],
        },
      ]);
      return () => {};
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it.each([
    ["Fichiers", "files"],
    ["Courses", "courses"],
  ])("%s s’ouvre dans l’espace membre et revient au même endroit que Telegram", async (label, app) => {
    const onOpenCreatorAppWorkspace = vi.fn();
    const renderCreatorAppWorkspace = vi.fn((openedApp: string, _ids: string[], onBack: () => void) => (
      <div data-testid={`workspace-${openedApp}`}>
        <button type="button" onClick={onBack}>
          Retour à l'accueil
        </button>
      </div>
    ));
    const { container } = render(
      <EnterpriseMemberView
        lang="fr"
        user={{ uid: "creator-back-btn", name: "Awa Bah", email: "creator@example.test" }}
        onOpenCreatorAppWorkspace={onOpenCreatorAppWorkspace}
        renderCreatorAppWorkspace={renderCreatorAppWorkspace}
        subscription={
          {
            id: "sub-back-btn",
            companyId: "company-back-btn",
            creatorId: "creator-back-btn",
            companyName: "Communauté test",
            productName: "Produit test",
            priceDisplay: "Gratuit",
            status: "active",
            hasJoined: true,
            includedApps: ["dashboard", "support", "Telegram", "Fichiers", "Cours"],
            telegramChannels: [],
          } as any
        }
      />,
    );
    await screen.findByText("@awa-bah");

    // Référence : la page atteinte par le retour de Telegram.
    fireEvent.click(screen.getByRole("button", { name: "Telegram" }));
    fireEvent.click(screen.getByRole("button", { name: "Retour à l'accueil" }));
    const telegramHome = container.innerHTML;

    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(screen.getByTestId(`workspace-${app}`)).toBeInTheDocument();
    expect(onOpenCreatorAppWorkspace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Retour à l'accueil" }));
    expect(screen.queryByTestId(`workspace-${app}`)).not.toBeInTheDocument();
    expect(container.innerHTML).toBe(telegramHome);
  });
});
