import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: React.ComponentType }) => options,
  useNavigate: () => navigateMock,
}));

import { Route } from "@/routes/onboarding";

const OnboardingRoute = Route.component as React.ComponentType;

describe("onboarding — bouton Ignorer", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    localStorage.clear();
  });

  it("mène directement à la page de connexion depuis l'étape 1", () => {
    render(<OnboardingRoute />);

    fireEvent.click(screen.getByRole("button", { name: "Ignorer" }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/login",
      search: { mode: "signup" },
    });
    expect(localStorage.getItem("mansa_onboarding_draft")).toBeNull();
  });

  it("mène directement à la page de connexion depuis l'étape 2", () => {
    render(<OnboardingRoute />);

    fireEvent.click(screen.getByRole("checkbox", { name: /Cours ou coaching/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continuer/ }));
    expect(screen.getByRole("heading", { name: "Nomme ton entreprise" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ignorer" }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/login",
      search: { mode: "signup" },
    });
    expect(localStorage.getItem("mansa_onboarding_draft")).toBeNull();
  });
});
