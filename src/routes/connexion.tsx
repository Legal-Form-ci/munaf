import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Smartphone, KeyRound, Users, Briefcase, Shield } from "lucide-react";
import logo from "@/assets/munaf-logo.png";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — MuNAF" },
      { name: "description", content: "Connectez-vous à votre espace membre, délégué ou administrateur MuNAF." },
    ],
  }),
  component: ConnexionPage,
});

function ConnexionPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"membre" | "delegue" | "admin">("membre");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "phone") {
      setStep("otp");
      return;
    }
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "delegue") navigate({ to: "/delegue" });
    else navigate({ to: "/membre" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand pane */}
      <div className="hidden lg:flex flex-col bg-brand-gradient text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-gold/15 blur-3xl" />
        <Link to="/" className="flex items-center gap-2.5 relative">
          <img src={logo} alt="" className="size-11 object-contain" />
          <div className="font-display font-bold text-xl">Mu<span className="text-gold">NAF</span></div>
        </Link>
        <div className="my-auto relative">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Espace authentifié</div>
          <h1 className="font-display font-bold text-4xl leading-tight">
            Une seule porte d'entrée pour toute la communauté MuNAF.
          </h1>
          <p className="mt-5 text-white/70 max-w-md">
            Membres, délégués de quartier, administrateurs d'association : retrouvez votre tableau
            de bord personnalisé après authentification sécurisée par OTP.
          </p>
        </div>
        <div className="text-xs text-white/50 relative">© 2026 MuNAF — Zone pilote Daloa</div>
      </div>

      {/* Right form */}
      <div className="flex flex-col p-6 md:p-12 justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <img src={logo} alt="" className="size-10 object-contain" />
            <div className="font-display font-bold text-xl">Mu<span className="text-gold">NAF</span></div>
          </div>

          <h2 className="font-display font-bold text-2xl">Connexion</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez votre profil puis authentifiez-vous.
          </p>

          {/* Role tabs */}
          <div className="grid grid-cols-3 gap-2 mt-6 p-1 bg-muted rounded-xl">
            {[
              { k: "membre" as const, l: "Membre", icon: Users },
              { k: "delegue" as const, l: "Délégué", icon: Briefcase },
              { k: "admin" as const, l: "Admin", icon: Shield },
            ].map((r) => (
              <button
                key={r.k}
                onClick={() => { setRole(r.k); setStep("phone"); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                  role === r.k ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <r.icon className="size-3.5" /> {r.l}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {step === "phone" ? (
              <>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Téléphone</label>
                  <div className="relative">
                    <Smartphone className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="+225 07 00 00 00 00"
                      required
                      className="w-full h-12 pl-10 pr-3 rounded-lg border bg-background focus:border-ring outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Un code à 6 chiffres vous sera envoyé par SMS.
                  </p>
                </div>
                <button className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                  Recevoir le code
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Code de vérification</label>
                  <div className="relative">
                    <KeyRound className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="● ● ● ● ● ●"
                      required
                      className="w-full h-12 pl-10 pr-3 rounded-lg border bg-background focus:border-ring outline-none tracking-[0.4em] text-center font-display font-bold"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Démo : entrez n'importe quels 6 chiffres pour accéder à votre espace.
                  </p>
                </div>
                <button className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                  Se connecter
                </button>
                <button type="button" onClick={() => setStep("phone")} className="w-full text-xs text-muted-foreground hover:text-foreground">
                  ← Modifier le numéro
                </button>
              </>
            )}
          </form>

          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            Pas encore membre ?{" "}
            <Link to="/formules" className="text-primary font-semibold hover:underline">Adhérez en 5 minutes</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
