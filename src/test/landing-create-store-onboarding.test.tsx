import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { navigateMock, useAuthMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("@/mansa/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

import LandingPage from "@/mansa/LandingPage";

const createStoreButtons = () =>
  screen.getAllByRole("button", { name: /Créer ma boutique/i });

describe("démarrage de l’onboarding depuis « Créer ma boutique »", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({ user: null });
  });

  it("ouvre l’étape 1 de l’onboarding quand aucun compte n’est connecté", () => {
    render(<LandingPage />);

    const buttons = createStoreButtons();
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(buttons[0]);

    expect(navigateMock).toHaveBeenCalledWith({ to: "/onboarding" });
  });

  it("lance l’onboarding depuis le bouton de l’en-tête", () => {
    render(<LandingPage />);

    const header = screen.getByRole("banner");
    fireEvent.click(within(header).getByRole("button", { name: /Créer ma boutique/i }));

    expect(navigateMock).toHaveBeenCalledWith({ to: "/onboarding" });
  });

  it("garde la connexion séparée de la création de boutique", () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Connexion" }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/login",
      search: { mode: "login" },
    });
    expect(navigateMock.mock.calls.some(([arg]) => arg?.to === "/onboarding")).toBe(false);
  });
});
