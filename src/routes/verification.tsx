import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { useState } from "react";
import { Search, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, FORMULE_VALUE, formatFcfa } from "@/lib/api";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Vérifier un membre — MuNAF" },
      { name: "description", content: "Vérifiez l'adhésion d'un membre MuNAF par son numéro de téléphone ou son matricule." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <VerificationPage />
    </PublicLayout>
  ),
});

type Result = {
  matricule: string; nom: string; prenom: string; quartier: string; ville: string;
  formule: string; status: string; date_adhesion: string; photo_url: string | null;
};

function statusColor(s: string) {
  if (s === "actif") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "carence") return "bg-amber-100 text-amber-700 border-amber-200";
  if (s === "decede") return "bg-slate-200 text-slate-700 border-slate-300";
  return "bg-red-100 text-red-700 border-red-200";
}

function VerificationPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setResults(null); setLoading(true);
    const { data, error } = await supabase.rpc("verifier_membre", { _query: q.trim() });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setResults((data ?? []) as Result[]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold">
          <ShieldCheck className="size-3.5" /> Portail public de vérification
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl mt-4">Vérifier l'adhésion d'un membre</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Entrez le <strong>numéro de téléphone</strong> (+225…) ou le <strong>matricule MNF-XXXXX</strong> du membre.
          Seules les informations publiques sont affichées.
        </p>
      </div>

      <form onSubmit={search} className="mt-8 flex gap-2 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="+22507XXXXXXXX  ou  MNF-00123"
            className="w-full h-12 pl-10 pr-3 rounded-lg border bg-card focus:border-ring outline-none text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Vérifier
        </button>
      </form>

      {err && (
        <div className="mt-6 max-w-2xl mx-auto flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0 mt-0.5" /> {err}
        </div>
      )}

      {results !== null && !err && (
        <div className="mt-8 max-w-2xl mx-auto">
          {results.length === 0 ? (
            <div className="p-6 rounded-xl border bg-card text-center">
              <AlertCircle className="size-8 mx-auto text-muted-foreground" />
              <p className="mt-3 font-semibold">Aucun membre trouvé</p>
              <p className="text-sm text-muted-foreground">Vérifiez le numéro de téléphone ou le matricule.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.matricule} className="p-5 rounded-xl border bg-card flex gap-4">
                  {r.photo_url ? (
                    <img src={r.photo_url} alt="" className="size-16 rounded-full object-cover border" />
                  ) : (
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {r.prenom[0]}{r.nom[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span className="font-display font-bold">{r.prenom} {r.nom}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Matricule <span className="font-mono text-foreground">{r.matricule}</span> · {r.quartier}, {r.ville}
                    </div>
                    <div className="mt-2 text-sm">
                      Formule <strong>{formatFcfa(FORMULE_VALUE[r.formule] ?? 0)}</strong> ·
                      adhérent depuis {new Date(r.date_adhesion).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground text-center pt-2">
                Confidentialité : téléphone, date de naissance et données personnelles ne sont pas affichés publiquement.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
