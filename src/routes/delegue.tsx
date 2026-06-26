import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useMembers, useDossiers, STATUS_LABEL, DOSSIER_LABEL } from "@/lib/api";
import { Loader2, LogOut, Users, FileText } from "lucide-react";
import logo from "@/assets/munaf-logo.png";

export const Route = createFileRoute("/delegue")({
  head: () => ({ meta: [{ title: "Espace délégué — MuNAF" }] }),
  component: DeleguePage,
});

function DeleguePage() {
  const { user, loading, signOut, role } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/connexion" });
    if (!loading && role === "admin") navigate({ to: "/admin" });
  }, [loading, user, role, navigate]);

  const { data: membres } = useMembers();
  const { data: dossiers } = useDossiers();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={logo} className="size-9" /><span className="font-display font-bold">Mu<span className="text-gold">NAF</span></span><span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent text-primary font-semibold">Délégué</span></Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted"><LogOut className="size-4" /> Déconnexion</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Tableau de bord délégué</h1>
          <p className="text-sm text-muted-foreground">Membres et dossiers de votre quartier.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2"><Users className="size-4 text-primary" /><h3 className="font-display font-semibold">Membres ({membres?.length ?? 0})</h3></div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {(membres ?? []).slice(0, 30).map((m: any) => (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                  {m.photo_url ? <img src={m.photo_url} className="size-9 rounded-full object-cover" /> : <div className="size-9 rounded-full bg-muted" />}
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{m.prenom} {m.nom}</div><div className="text-xs text-muted-foreground">{m.quartier} · {STATUS_LABEL[m.status]}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2"><FileText className="size-4 text-primary" /><h3 className="font-display font-semibold">Dossiers ({dossiers?.length ?? 0})</h3></div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {(dossiers ?? []).slice(0, 30).map((d: any) => (
                <div key={d.id} className="px-5 py-3"><div className="text-sm font-medium">{d.membres?.prenom} {d.membres?.nom}</div><div className="text-xs text-muted-foreground">{d.numero} · {DOSSIER_LABEL[d.status]}</div></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
