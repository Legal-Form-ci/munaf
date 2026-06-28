import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, User, AlertCircle, Loader2 } from "lucide-react";
import logo from "@/assets/munaf-logo.png";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — MuNAF" },
      { name: "description", content: "Accédez à votre espace MuNAF — membre, délégué ou administrateur." },
    ],
  }),
  component: ConnexionPage,
});

function ConnexionPage() {
  const navigate = useNavigate();
  const { signInUsername, role, session, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && role) {
      import("@/lib/auth").then(({ homeForRole }) => navigate({ to: homeForRole(role) as any }));
    }
  }, [loading, session, role, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signInUsername(username, password);
    setSubmitting(false);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
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
            Membres, délégués de quartier, administrateurs : connectez-vous avec votre identifiant
            MuNAF — sans email, comme votre carte d'adhérent.
          </p>
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
            <div className="text-gold font-semibold mb-1">Compte de démonstration admin</div>
            <div className="text-white/80">Identifiant : <code className="font-mono">munaf</code></div>
            <div className="text-white/80">Mot de passe : <code className="font-mono">@Munaf2026</code></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <img src={logo} alt="" className="size-14 mx-auto object-contain" />
            <div className="mt-2 font-display font-bold text-xl">Mu<span className="text-gold">NAF</span></div>
          </div>
          <h2 className="font-display font-bold text-2xl">Se connecter</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Entrez votre identifiant MuNAF et votre mot de passe.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identifiant</label>
              <div className="mt-1.5 relative">
                <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="munaf"
                  className="w-full h-11 pl-10 pr-3 rounded-lg border bg-card focus:border-ring outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mot de passe</label>
              <div className="mt-1.5 relative">
                <KeyRound className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-lg border bg-card focus:border-ring outline-none text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="size-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Connexion
            </button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Pas encore membre ?{" "}
            <Link to="/formules" className="text-primary font-semibold hover:underline">Adhérer à MuNAF</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
