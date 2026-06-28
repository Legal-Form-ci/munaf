import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useDossiers, useUpsertDossier, useNsiaSync, useCreateNsiaSync, useCreatePaiement, usePaiementsAssistance, formatFcfa, DOSSIER_LABEL, logAudit } from "@/lib/api";
import { Loader2, LogOut, ShieldCheck, FileText, CheckCircle2, XCircle, HandCoins, ArrowDownRight, RefreshCw } from "lucide-react";
import logo from "@/assets/munaf-logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/nsia")({
  head: () => ({ meta: [{ title: "Module NSIA — MuNAF" }] }),
  component: NsiaPage,
});

function NsiaPage() {
  const { user, loading, role, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate({ to: "/connexion" }); }, [loading, user, navigate]);

  const { data: dossiers } = useDossiers();
  const { data: paiements } = usePaiementsAssistance();
  const { data: sync } = useNsiaSync(50);
  const upDossier = useUpsertDossier();
  const createSync = useCreateNsiaSync();
  const createPaiement = useCreatePaiement();
  const [tab, setTab] = useState<"a_traiter" | "tous" | "verses" | "sync">("a_traiter");
  const [rejet, setRejet] = useState<any | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const list = dossiers ?? [];
  const aTraiter = list.filter((d: any) => ["transmis", "valide"].includes(d.status));
  const verses = list.filter((d: any) => ["assistance_versee","cloture"].includes(d.status));
  const totalVerses = verses.reduce((s: number, d: any) => s + (d.montant_assistance ?? 0), 0);

  const valider = async (d: any) => {
    await upDossier.mutateAsync({ id: d.id, status: "valide" });
    await createSync.mutateAsync({ type: "dossier_valide", dossier_id: d.id, status: "success", message: "Validé par NSIA" });
    logAudit("nsia_valider", "dossier", d.id);
    toast.success("Dossier validé");
  };
  const rejeter = async () => {
    await upDossier.mutateAsync({ id: rejet.id, status: "rejete", motif_rejet: rejet.motif });
    await createSync.mutateAsync({ type: "dossier_rejete", dossier_id: rejet.id, status: "success", message: rejet.motif });
    logAudit("nsia_rejeter", "dossier", rejet.id, { motif: rejet.motif });
    toast.success("Dossier rejeté");
    setRejet(null);
  };
  const marquerVerse = async (d: any) => {
    const montant = d.montant_assistance ?? 0;
    await upDossier.mutateAsync({ id: d.id, status: "assistance_versee" });
    await createPaiement.mutateAsync({ dossier_id: d.id, type: d.membres?.association_id ? "nsia_vers_association" : "nsia_vers_membre", montant, beneficiaire_nom: `${d.membres?.prenom} ${d.membres?.nom}`, reference: `NSIA-${d.numero}` });
    await createSync.mutateAsync({ type: "dossier_verse", dossier_id: d.id, status: "success", payload: { montant } });
    toast.success("Versement enregistré");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={logo} className="size-9" alt="MuNAF" /><span className="font-display font-bold">Mu<span className="text-gold">NAF</span></span><span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">Module NSIA</span></Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted"><LogOut className="size-4" /> Déconnexion</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        <div className="rounded-2xl border bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
          <div className="text-xs uppercase tracking-wider font-bold text-gold">NSIA Assurances · Module embarqué</div>
          <h1 className="font-display font-bold text-2xl mt-1">Tableau de bord NSIA · MuNAF Daloa</h1>
          <p className="text-white/80 text-sm mt-2">Traitez les dossiers décès transmis par MuNAF : valider, rejeter, marquer comme versé. Toute action est synchronisée bilatéralement.</p>
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          <Kpi label="À traiter" value={aTraiter.length} icon={FileText} />
          <Kpi label="Versés" value={verses.length} icon={HandCoins} />
          <Kpi label="Total assistance" value={formatFcfa(totalVerses)} icon={ArrowDownRight} />
          <Kpi label="Sync logs" value={(sync ?? []).length} icon={RefreshCw} />
        </div>

        <div className="flex gap-2 border-b">
          {[["a_traiter","À traiter"],["tous","Tous dossiers"],["verses","Versés"],["sync","Journal sync"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{l}</button>
          ))}
        </div>

        {(tab === "a_traiter" || tab === "tous" || tab === "verses") && (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide">
                  <tr><th className="text-left px-4 py-3">Dossier</th><th className="text-left px-4 py-3">Membre</th><th className="text-left px-4 py-3">Date décès</th><th className="text-left px-4 py-3">Capital</th><th className="text-left px-4 py-3">Statut</th><th className="text-right px-4 py-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {(tab === "a_traiter" ? aTraiter : tab === "verses" ? verses : list).map((d: any) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-mono text-xs">{d.numero}</td>
                      <td className="px-4 py-3"><div className="font-medium">{d.membres?.prenom} {d.membres?.nom}</div><div className="text-xs text-muted-foreground">{d.membres?.matricule} · {d.membres?.quartier}</div></td>
                      <td className="px-4 py-3">{d.date_deces ? new Date(d.date_deces).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="px-4 py-3 font-semibold">{formatFcfa(d.montant_assistance ?? 0)}</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{DOSSIER_LABEL[d.status]}</span></td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {d.status === "transmis" && <>
                          <button onClick={() => valider(d)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white font-semibold inline-flex items-center gap-1"><CheckCircle2 className="size-3" /> Valider</button>
                          <button onClick={() => setRejet({ id: d.id, motif: "" })} className="text-xs px-2 py-1 rounded bg-red-600 text-white font-semibold inline-flex items-center gap-1"><XCircle className="size-3" /> Rejeter</button>
                        </>}
                        {d.status === "valide" && <button onClick={() => marquerVerse(d)} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-semibold">Marquer versé</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "sync" && (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide"><tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Dossier</th><th className="text-left px-4 py-3">Statut</th><th className="text-left px-4 py-3">Message</th></tr></thead>
              <tbody className="divide-y">{(sync ?? []).map((s: any) => (
                <tr key={s.id}><td className="px-4 py-2 text-xs">{new Date(s.created_at).toLocaleString("fr-FR")}</td><td className="px-4 py-2">{s.type}</td><td className="px-4 py-2 font-mono text-xs">{s.dossiers?.numero ?? "—"}</td><td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "success" ? "bg-emerald-100 text-emerald-700" : s.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{s.status}</span></td><td className="px-4 py-2 text-xs text-muted-foreground">{s.message ?? "—"}</td></tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {rejet && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRejet(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-6 max-w-md w-full">
              <h4 className="font-display font-bold text-lg mb-3">Motif de rejet</h4>
              <textarea rows={4} required value={rejet.motif} onChange={(e) => setRejet({ ...rejet, motif: e.target.value })} className="w-full p-3 rounded-lg border bg-card text-sm" placeholder="Documents manquants, cotisations non à jour…" />
              <div className="flex justify-end gap-2 mt-4"><button onClick={() => setRejet(null)} className="px-4 h-10 rounded-lg hover:bg-muted text-sm">Annuler</button><button onClick={rejeter} disabled={!rejet.motif} className="px-4 h-10 rounded-lg bg-red-600 text-white font-semibold text-sm disabled:opacity-50">Rejeter le dossier</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: any) {
  return <div className="rounded-xl border bg-card p-4"><div className="flex items-start justify-between"><div><div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div><div className="text-2xl font-display font-bold mt-1">{value}</div></div><Icon className="size-5 text-primary/60" /></div></div>;
}
