import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, ShieldCheck, Wallet, FileText } from "lucide-react";
import logo from "@/assets/munaf-logo.png";
import { STATUS_LABEL, formatFcfa, FORMULE_VALUE, COT_LABEL } from "@/lib/api";

export const Route = createFileRoute("/membre")({
  head: () => ({ meta: [{ title: "Espace membre — MuNAF" }] }),
  component: MembrePage,
});

function MembrePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate({ to: "/connexion" }); }, [loading, user, navigate]);

  const { data: membre, isLoading } = useQuery({
    queryKey: ["my-membre", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("membres").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const { data: cotisations } = useQuery({
    queryKey: ["my-cot", membre?.id],
    queryFn: async () => {
      const { data } = await supabase.from("cotisations").select("*").eq("membre_id", membre!.id).order("mois", { ascending: false });
      return data ?? [];
    },
    enabled: !!membre?.id,
  });

  if (loading || isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={logo} className="size-9" /><span className="font-display font-bold">Mu<span className="text-gold">NAF</span></span></Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {!membre ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <ShieldCheck className="size-10 mx-auto text-primary" />
            <h2 className="font-display font-bold text-xl mt-3">Bienvenue dans votre espace membre</h2>
            <p className="text-muted-foreground mt-2 text-sm">Votre profil membre n'est pas encore lié à ce compte. Contactez votre délégué de quartier.</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border bg-card p-6 flex items-start gap-5">
              {membre.photo_url ? <img src={membre.photo_url} className="size-20 rounded-full object-cover" /> : <div className="size-20 rounded-full bg-muted" />}
              <div className="flex-1">
                <h1 className="font-display font-bold text-2xl">{membre.prenom} {membre.nom}</h1>
                <div className="text-sm text-muted-foreground">Matricule <span className="font-mono">{membre.matricule}</span> · {membre.quartier}</div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{STATUS_LABEL[membre.status]}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">Formule {formatFcfa(FORMULE_VALUE[membre.formule])}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center gap-2"><Wallet className="size-4 text-primary" /><h3 className="font-display font-semibold">Mes cotisations</h3></div>
              <div className="divide-y">
                {(cotisations ?? []).map((c: any) => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                    <div><div className="font-medium text-sm">{new Date(c.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</div></div>
                    <div className="flex items-center gap-3"><span className="font-semibold">{formatFcfa(c.montant)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${c.status === "payee" ? "bg-emerald-100 text-emerald-700" : c.status === "en_attente" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{COT_LABEL[c.status]}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
