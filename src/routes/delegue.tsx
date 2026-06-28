import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useMembers, useDossiers, useUpsertMembre, useMarkCotisation, useCotisations, useUpsertDossier, STATUS_LABEL, DOSSIER_LABEL, COT_LABEL, formatFcfa, logAudit } from "@/lib/api";
import { Loader2, LogOut, Users, FileText, Plus, Wallet, HandCoins, Search } from "lucide-react";
import logo from "@/assets/munaf-logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/delegue")({
  head: () => ({ meta: [{ title: "Espace délégué — MuNAF" }] }),
  component: DeleguePage,
});

type Tab = "membres" | "inscrire" | "cotisations" | "dossiers" | "declarer";

function DeleguePage() {
  const { user, loading, signOut, role } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("membres");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/connexion" });
    if (!loading && (role === "admin" || role === "super_admin")) navigate({ to: "/admin" });
  }, [loading, user, role, navigate]);

  const { data: membres } = useMembers({ q: q || undefined });
  const { data: dossiers } = useDossiers();
  const { data: cotisations } = useCotisations();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "membres", label: "Membres de ma zone", icon: Users },
    { id: "inscrire", label: "Inscrire un membre", icon: Plus },
    { id: "cotisations", label: "Encaisser cotisation", icon: HandCoins },
    { id: "dossiers", label: "Dossiers décès", icon: FileText },
    { id: "declarer", label: "Déclarer un décès", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} className="size-9" alt="MuNAF" />
            <span className="font-display font-bold">Mu<span className="text-gold">NAF</span></span>
            <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-primary font-bold">Délégué</span>
          </Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-6 grid md:grid-cols-[220px_1fr] gap-5">
        <aside className="md:sticky md:top-20 self-start space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </aside>

        <div className="space-y-5">
          {tab === "membres" && (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
                <h3 className="font-display font-semibold">Membres ({membres?.length ?? 0})</h3>
                <div className="relative w-64"><Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="w-full h-9 pl-9 pr-3 rounded-lg border bg-card text-sm" /></div>
              </div>
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {(membres ?? []).slice(0, 100).map((m: any) => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    {m.photo_url ? <img src={m.photo_url} className="size-10 rounded-full object-cover" alt="" /> : <div className="size-10 rounded-full bg-muted" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.prenom} {m.nom} <span className="font-mono text-xs text-muted-foreground">· {m.matricule}</span></div>
                      <div className="text-xs text-muted-foreground">{m.quartier} · {m.telephone}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{STATUS_LABEL[m.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "inscrire" && <InscrireMembre delegueId={user!.id} onDone={() => setTab("membres")} />}
          {tab === "cotisations" && <EncaisserCotisation items={cotisations ?? []} />}
          {tab === "dossiers" && (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b"><h3 className="font-display font-semibold">Dossiers ({dossiers?.length ?? 0})</h3></div>
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {(dossiers ?? []).map((d: any) => (
                  <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{d.membres?.prenom} {d.membres?.nom}</div>
                      <div className="text-xs text-muted-foreground">{d.numero} · {d.membres?.quartier}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{DOSSIER_LABEL[d.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "declarer" && <DeclarerDecesDelegue membres={membres ?? []} onDone={() => setTab("dossiers")} />}
        </div>
      </main>
    </div>
  );
}

function InscrireMembre({ delegueId, onDone }: any) {
  const [v, setV] = useState<any>({ nom: "", prenom: "", telephone: "", quartier: "", ville: "Daloa", formule: "F300", status: "carence", delegue_id: delegueId, date_adhesion: new Date().toISOString().slice(0, 10) });
  const up = useUpsertMembre();
  return (
    <form onSubmit={(e) => { e.preventDefault(); up.mutate(v, { onSuccess: () => { toast.success("Membre inscrit"); logAudit("create_membre", "membre", undefined, v); onDone(); } }); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <div><h3 className="font-display font-semibold text-lg">Inscrire un nouveau membre</h3><p className="text-xs text-muted-foreground">Saisissez les informations recueillies lors de la rencontre terrain.</p></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Prénom *"><input required value={v.prenom} onChange={(e) => setV({ ...v, prenom: e.target.value })} className="input" /></Field>
        <Field label="Nom *"><input required value={v.nom} onChange={(e) => setV({ ...v, nom: e.target.value })} className="input" /></Field>
        <Field label="Téléphone *"><input required value={v.telephone} onChange={(e) => setV({ ...v, telephone: e.target.value })} className="input" placeholder="+225 0X XX XX XX XX" /></Field>
        <Field label="Quartier *"><input required value={v.quartier} onChange={(e) => setV({ ...v, quartier: e.target.value })} className="input" placeholder="Tazibouo, Lobia…" /></Field>
        <Field label="Formule"><select value={v.formule} onChange={(e) => setV({ ...v, formule: e.target.value })} className="input">{["F100","F200","F300","F500","F1000"].map((f) => <option key={f}>{f}</option>)}</select></Field>
        <Field label="Date d'adhésion"><input type="date" value={v.date_adhesion} onChange={(e) => setV({ ...v, date_adhesion: e.target.value })} className="input" /></Field>
      </div>
      <div className="flex justify-end"><button disabled={up.isPending} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">{up.isPending ? "Enregistrement…" : "Inscrire le membre"}</button></div>
    </form>
  );
}

function EncaisserCotisation({ items }: any) {
  const mark = useMarkCotisation();
  const pending = items.filter((c: any) => c.status !== "payee").slice(0, 50);
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center gap-2"><Wallet className="size-4 text-primary" /><h3 className="font-display font-semibold">Cotisations en attente</h3></div>
      <div className="divide-y max-h-[70vh] overflow-y-auto">
        {pending.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucune cotisation en attente.</div>}
        {pending.map((c: any) => (
          <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{c.membres?.prenom} {c.membres?.nom} <span className="text-xs text-muted-foreground">· {c.membres?.matricule}</span></div>
              <div className="text-xs text-muted-foreground">{new Date(c.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} · {c.membres?.quartier}</div>
            </div>
            <div className="font-semibold">{formatFcfa(c.montant)}</div>
            <button onClick={() => mark.mutate({ id: c.id, status: "payee" }, { onSuccess: () => { toast.success("Encaissé"); logAudit("encaisser_cot", "cotisation", c.id); } })} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Encaisser</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeclarerDecesDelegue({ membres, onDone }: any) {
  const [v, setV] = useState<any>({ membre_id: "", defunt_nom: "", defunt_prenom: "", lien: "membre", date_deces: "", lieu_deces: "" });
  const up = useUpsertDossier();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!v.membre_id) return toast.error("Sélectionnez un membre"); up.mutate(v, { onSuccess: () => { toast.success("Dossier créé"); onDone(); } }); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="font-display font-semibold text-lg">Déclarer un décès</h3>
      <Field label="Membre concerné"><select value={v.membre_id} onChange={(e) => setV({ ...v, membre_id: e.target.value })} className="input"><option value="">— Sélectionner —</option>{membres.slice(0, 200).map((m: any) => <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.matricule})</option>)}</select></Field>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Lien"><select value={v.lien} onChange={(e) => setV({ ...v, lien: e.target.value })} className="input"><option value="membre">Le membre</option><option value="conjoint">Conjoint</option><option value="enfant">Enfant</option><option value="parent">Parent</option></select></Field>
        <Field label="Date du décès"><input type="date" required value={v.date_deces} onChange={(e) => setV({ ...v, date_deces: e.target.value })} className="input" /></Field>
        <Field label="Prénom défunt"><input required value={v.defunt_prenom} onChange={(e) => setV({ ...v, defunt_prenom: e.target.value })} className="input" /></Field>
        <Field label="Nom défunt"><input required value={v.defunt_nom} onChange={(e) => setV({ ...v, defunt_nom: e.target.value })} className="input" /></Field>
        <Field label="Lieu"><input value={v.lieu_deces} onChange={(e) => setV({ ...v, lieu_deces: e.target.value })} className="input" /></Field>
      </div>
      <div className="flex justify-end"><button disabled={up.isPending} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">Déclarer</button></div>
    </form>
  );
}

function Field({ label, children }: any) {
  return <label className="block"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</div>{children}</label>;
}
