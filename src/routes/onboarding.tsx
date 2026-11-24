import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AfhubLogo } from "@/mansa/components/AfhubLogo";

const ONBOARDING_STORAGE_KEY = "mansa_onboarding_draft";

const OFFERING_OPTIONS = [
  { id: "cours-coaching", label: "Cours ou coaching" },
  { id: "logiciel-application", label: "Logiciel ou application" },
  { id: "clubs-prives", label: "Clubs privés" },
  { id: "services", label: "Services" },
] as const;

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Démarrer — Thal" },
      {
        name: "description",
        content: "Configurez votre activité et nommez votre entreprise avant de vous connecter.",
      },
      { property: "og:title", content: "Démarrer — Thal" },
      {
        property: "og:description",
        content: "Configurez votre activité et nommez votre entreprise avant de vous connecter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingRoute,
});

function OnboardingRoute() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleOffering = (id: string) => {
    setError(null);
    setSelectedOfferings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleStepOneContinue = () => {
    if (selectedOfferings.length === 0) {
      setError("Sélectionnez au moins une option pour continuer.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleComplete = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = companyName.trim();
    if (!trimmedName) {
      setError("Veuillez écrire le nom de votre entreprise.");
      return;
    }

    try {
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({
          offerings: selectedOfferings,
          companyName: trimmedName,
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Ignore storage failures in restricted browser modes
    }

    void navigate({ to: "/login", search: { mode: "signup" } });
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f10] text-[#f2f4f5] flex flex-col">
      <header className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step === 2 ? (setError(null), setStep(1)) : void navigate({ to: "/" }))}
          className="inline-flex items-center gap-2 text-sm text-[#9ba3aa] hover:text-[#f2f4f5] transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>{step === 2 ? "Retour" : "Accueil"}</span>
        </button>
        <AfhubLogo />
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#9ba3aa]">Étape {step} / 2</span>
          <button
            type="button"
            onClick={() => void navigate({ to: "/login", search: { mode: "signup" } })}
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[#9ba3aa] transition-colors hover:border-white/30 hover:text-[#f2f4f5]"
          >
            Ignorer
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-10 pb-44">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#15181b] p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 flex gap-2" aria-hidden="true">
            <div className="h-1.5 flex-1 rounded-full bg-[#3ddc84]" />
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step === 2 ? "bg-[#3ddc84]" : "bg-white/10"
              }`}
            />
          </div>

          {step === 1 ? (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f2f4f5]">
                Que vends-tu ?
              </h1>
              <p className="mt-2 text-sm text-[#9ba3aa]">
                Coche une ou plusieurs réponses correspondant à ton activité.
              </p>

              <div className="mt-6 space-y-3" role="group" aria-label="Que vends-tu ?">
                {OFFERING_OPTIONS.map((option) => {
                  const checked = selectedOfferings.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                        checked
                          ? "border-[#3ddc84] bg-[#3ddc84]/10 text-[#f2f4f5]"
                          : "border-white/10 bg-[#0d0f10]/60 text-[#d7dce0] hover:border-white/25"
                      }`}
                    >
                      <span className="text-sm sm:text-base font-medium">{option.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOffering(option.id)}
                        className="sr-only"
                      />
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          checked
                            ? "border-[#3ddc84] bg-[#3ddc84] text-[#0d0f10]"
                            : "border-white/25 bg-transparent"
                        }`}
                      >
                        {checked && <Check className="size-3.5 stroke-[3]" />}
                      </span>
                    </label>
                  );
                })}
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleStepOneContinue}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3ddc84] px-5 py-3 text-sm font-semibold text-[#0d0f10] hover:bg-[#34c876] transition-colors"
              >
                <span>Continuer</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleComplete}>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f2f4f5]">
                Nomme ton entreprise
              </h1>
              <p className="mt-2 text-sm text-[#9ba3aa]">
                Tu pourras le modifier plus tard depuis ton espace.
              </p>

              <div className="mt-6">
                <label htmlFor="company-name" className="sr-only">
                  Nom de l’entreprise
                </label>
                <input
                  id="company-name"
                  type="text"
                  autoFocus
                  value={companyName}
                  onChange={(e) => {
                    setError(null);
                    setCompanyName(e.target.value);
                  }}
                  placeholder="Ex. Studio Mansa"
                  className="w-full rounded-xl border border-white/15 bg-[#0d0f10] px-4 py-3.5 text-base text-[#f2f4f5] placeholder:text-[#6f7880] focus:border-[#3ddc84] focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3ddc84] px-5 py-3 text-sm font-semibold text-[#0d0f10] hover:bg-[#34c876] transition-colors"
              >
                <span>Continuer vers la connexion</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}