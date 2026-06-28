import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMembers, useUpsertMembre, useUpsertDossier, useDossiers, useCreatePaiement, usePaiementsAssistance, STATUS_LABEL, DOSSIER_LABEL, formatFcfa, FORMULE_VALUE, logAudit } from "@/lib/api";
import { Loader2, LogOut, Users, FileText, Plus, Building2, HandCoins, FileUp, Upload } from "lucide-react";
import logo from "@/assets/munaf-logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/association")({
  head: () => ({ meta: [{ title: "Espace association — MuNAF" }] }),
  component: AssociationPage,
});

type Tab = "accueil" | "membres" | "ajouter" | "import" | "dossiers" | "declarer" | "reversements";

function AssociationPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("accueil");

  useEffect(() => { if (!loading && !user) navigate({ to: "/connexion" }); }, [loading, user, navigate]);

  const { data: asso } = useQuery({
    queryKey: ["my-asso", user?.id],
    queryFn: async () => (await (supabase as any).from("associations").select("*").eq("admin_user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const { data: membres } = useMembers(asso ? { association_id: asso.id } : undefined);
  const { data: dossiers } = useDossiers();
  const dossiersAsso = (dossiers ?? []).filter((d: any) => d.membres?.association_id === asso?.id);
  const { data: paiements } = usePaiementsAssistance();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "accueil", label: "Tableau de bord", icon: Building2 },
    { id: "membres", label: "Mes membres", icon: Users },
    { id: "ajouter", label: "Ajouter un membre", icon: Plus },
    { id: "import", label: "Import en lot", icon: Upload },
    { id: "dossiers", label: "Dossiers décès", icon: FileText },
    { id: "declarer", label: "Déclarer un décès", icon: FileUp },
    { id: "reversements", label: "Reversements 90/10", icon: HandCoins },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={logo} className="size-9" alt="MuNAF" /><span className="font-display font-bold">Mu<span className="text-gold">NAF</span></span><span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-primary font-bold">Association</span></Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted"><LogOut className="size-4" /> Déconnexion</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {!asso ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <Building2 className="size-10 mx-auto text-primary" />
            <h2 className="font-display font-bold text-xl mt-3">Aucune association liée</h2>
            <p className="text-muted-foreground mt-2 text-sm">Votre compte n'est pas rattaché à une association. Contactez l'équipe MuNAF Daloa.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[240px_1fr] gap-5">
            <aside className="md:sticky md:top-20 self-start space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                return <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><Icon className="size-4" /> {t.label}</button>;
              })}
            </aside>
            <div className="space-y-5">
              {tab === "accueil" && <AccueilAsso asso={asso} membres={membres ?? []} dossiers={dossiersAsso} paiements={paiements ?? []} />}
              {tab === "membres" && <MembresList items={membres ?? []} />}
              {tab === "ajouter" && <AjouterMembre asso={asso} onDone={() => setTab("membres")} />}
              {tab === "import" && <ImportLot asso={asso} onDone={() => setTab("membres")} />}
              {tab === "dossiers" && <DossiersAsso items={dossiersAsso} />}
              {tab === "declarer" && <DeclarerDossier membres={membres ?? []} onDone={() => setTab("dossiers")} />}
              {tab === "reversements" && <Reversements dossiers={dossiersAsso} paiements={paiements ?? []} assoNom={asso.nom} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AccueilAsso({ asso, membres, dossiers, paiements }: any) {
  const actifs = membres.filter((m: any) => m.status === "actif").length;
  const capital = membres.reduce((s: number, m: any) => s + (FORMULE_VALUE[m.formule] ?? 0), 0);
  const verses = paiements.filter((p: any) => p.type === "nsia_vers_association").reduce((s: number, p: any) => s + (p.montant ?? 0), 0);
  return (
    <>
      <div className="rounded-2xl border bg-card p-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Association</div>
        <h1 className="font-display font-bold text-2xl mt-1">{asso.nom}</h1>
        <div className="text-sm text-muted-foreground">{asso.type} · {asso.quartier}, {asso.ville}</div>
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        <Kpi label="Membres" value={membres.length} />
        <Kpi label="Actifs" value={actifs} />
        <Kpi label="Dossiers en cours" value={dossiers.filter((d: any) => !["assistance_versee","cloture","rejete"].includes(d.status)).length} />
        <Kpi label="Reçus de NSIA" value={formatFcfa(verses)} />
      </div>
      <div className="rounded-2xl border bg-gold/5 p-5 text-sm">
        <div className="font-display font-semibold text-gold mb-1">Mécanisme 90 / 10</div>
        <p className="text-muted-foreground">Quand NSIA verse une assistance sur votre compte MoMo association, vous prélevez <b>10% pour le fonctionnement</b> et reversez <b>90% à la famille</b>. La plateforme trace chaque versement pour la transparence des membres.</p>
      </div>
    </>
  );
}

function Kpi({ label, value }: any) { return <div className="rounded-xl border bg-card p-4"><div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div><div className="text-2xl font-display font-bold mt-1">{value}</div></div>; }

function MembresList({ items }: any) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b"><h3 className="font-display font-semibold">Membres ({items.length})</h3></div>
      <div className="divide-y max-h-[70vh] overflow-y-auto">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun membre.</div>}
        {items.map((m: any) => (
          <div key={m.id} className="px-5 py-3 flex items-center gap-3">
            {m.photo_url ? <img src={m.photo_url} className="size-10 rounded-full object-cover" alt="" /> : <div className="size-10 rounded-full bg-muted" />}
            <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{m.prenom} {m.nom}</div><div className="text-xs text-muted-foreground">{m.matricule} · {m.quartier} · {m.formule}</div></div>
            <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{STATUS_LABEL[m.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AjouterMembre({ asso, onDone }: any) {
  const [v, setV] = useState<any>({ nom: "", prenom: "", telephone: "", quartier: asso.quartier, ville: asso.ville, formule: "F300", status: "carence", association_id: asso.id, date_adhesion: new Date().toISOString().slice(0, 10) });
  const up = useUpsertMembre();
  return (
    <form onSubmit={(e) => { e.preventDefault(); up.mutate(v, { onSuccess: () => { toast.success("Membre ajouté"); onDone(); } }); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="font-display font-semibold text-lg">Ajouter un membre à l'association</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Prénom"><input required value={v.prenom} onChange={(e) => setV({ ...v, prenom: e.target.value })} className="input" /></Field>
        <Field label="Nom"><input required value={v.nom} onChange={(e) => setV({ ...v, nom: e.target.value })} className="input" /></Field>
        <Field label="Téléphone"><input required value={v.telephone} onChange={(e) => setV({ ...v, telephone: e.target.value })} className="input" /></Field>
        <Field label="Quartier"><input required value={v.quartier} onChange={(e) => setV({ ...v, quartier: e.target.value })} className="input" /></Field>
        <Field label="Formule"><select value={v.formule} onChange={(e) => setV({ ...v, formule: e.target.value })} className="input">{["F100","F200","F300","F500","F1000"].map((f) => <option key={f}>{f}</option>)}</select></Field>
      </div>
      <button disabled={up.isPending} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold">{up.isPending ? "Enregistrement…" : "Ajouter le membre"}</button>
    </form>
  );
}

function ImportLot({ asso, onDone }: any) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const up = useUpsertMembre();
  const run = async () => {
    setBusy(true);
    const lines = text.trim().split("\n").filter(Boolean);
    let ok = 0;
    for (const line of lines) {
      const [prenom, nom, telephone, quartier, formule = "F300"] = line.split(/[,;]/).map((s) => s.trim());
      if (!prenom || !nom || !telephone) continue;
      try { await up.mutateAsync({ prenom, nom, telephone, quartier: quartier || asso.quartier, ville: asso.ville, formule, status: "carence", association_id: asso.id, date_adhesion: new Date().toISOString().slice(0, 10) }); ok++; } catch {}
    }
    setBusy(false);
    toast.success(`${ok} membre(s) importé(s)`);
    onDone();
  };
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-lg">Import en lot (CSV)</h3>
        <p className="text-xs text-muted-foreground">Une ligne par membre, séparateur virgule ou point-virgule : <code>prénom, nom, téléphone, quartier, formule</code></p>
      </div>
      <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="w-full p-3 rounded-lg border bg-card text-sm font-mono" placeholder="Jean, Kouassi, +2250707070707, Tazibouo, F300" />
      <button onClick={run} disabled={busy || !text.trim()} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">{busy ? "Import en cours…" : "Importer"}</button>
    </div>
  );
}

function DossiersAsso({ items }: any) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b"><h3 className="font-display font-semibold">Dossiers décès de mes membres ({items.length})</h3></div>
      <div className="divide-y">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun dossier.</div>}
        {items.map((d: any) => (
          <div key={d.id} className="px-5 py-3 flex items-center justify-between">
            <div><div className="text-sm font-medium">{d.membres?.prenom} {d.membres?.nom}</div><div className="text-xs text-muted-foreground">{d.numero} · {d.date_deces ? new Date(d.date_deces).toLocaleDateString("fr-FR") : ""}</div></div>
            <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{DOSSIER_LABEL[d.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeclarerDossier({ membres, onDone }: any) {
  const [v, setV] = useState<any>({ membre_id: "", defunt_nom: "", defunt_prenom: "", lien: "membre", date_deces: "" });
  const up = useUpsertDossier();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!v.membre_id) return toast.error("Sélectionnez un membre"); up.mutate(v, { onSuccess: () => { toast.success("Dossier créé"); logAudit("declarer_deces", "dossier"); onDone(); } }); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="font-display font-semibold text-lg">Déclarer un décès</h3>
      <Field label="Membre"><select value={v.membre_id} onChange={(e) => setV({ ...v, membre_id: e.target.value })} className="input"><option value="">— Sélectionner —</option>{membres.map((m: any) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}</select></Field>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Prénom défunt"><input value={v.defunt_prenom} onChange={(e) => setV({ ...v, defunt_prenom: e.target.value })} className="input" required /></Field>
        <Field label="Nom défunt"><input value={v.defunt_nom} onChange={(e) => setV({ ...v, defunt_nom: e.target.value })} className="input" required /></Field>
        <Field label="Date du décès"><input type="date" value={v.date_deces} onChange={(e) => setV({ ...v, date_deces: e.target.value })} className="input" required /></Field>
        <Field label="Lien"><select value={v.lien} onChange={(e) => setV({ ...v, lien: e.target.value })} className="input"><option value="membre">Le membre</option><option value="conjoint">Conjoint</option><option value="enfant">Enfant</option></select></Field>
      </div>
      <button disabled={up.isPending} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold">Déclarer</button>
    </form>
  );
}

function Reversements({ dossiers, paiements, assoNom }: any) {
  const pay = useCreatePaiement();
  const versesNsia = paiements.filter((p: any) => p.type === "nsia_vers_association");
  const reverses = paiements.filter((p: any) => p.type === "association_vers_famille");
  const [form, setForm] = useState<any | null>(null);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-display font-semibold mb-3">Assistance reçue de NSIA</h3>
        <div className="divide-y">
          {versesNsia.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">Aucun versement enregistré.</div>}
          {versesNsia.map((p: any) => (
            <div key={p.id} className="py-2 flex justify-between text-sm"><div>{new Date(p.date_paiement).toLocaleDateString("fr-FR")} · {p.beneficiaire_nom}</div><div className="font-semibold">{formatFcfa(p.montant)}</div></div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Reversements aux familles (90%)</h3>
          <button onClick={() => setForm({ type: "association_vers_famille", date_paiement: new Date().toISOString() })} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">+ Enregistrer un reversement</button>
        </div>
        <div className="divide-y">
          {reverses.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">Aucun reversement enregistré.</div>}
          {reverses.map((p: any) => (
            <div key={p.id} className="py-2 flex justify-between text-sm"><div>{new Date(p.date_paiement).toLocaleDateString("fr-FR")} · {p.beneficiaire_nom}</div><div className="font-semibold">{formatFcfa(p.montant)}</div></div>
          ))}
        </div>
      </div>
      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setForm(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); pay.mutate(form, { onSuccess: () => { toast.success("Reversement enregistré"); setForm(null); } }); }} className="bg-card rounded-2xl p-6 max-w-md w-full space-y-3">
            <h4 className="font-display font-bold text-lg">Reversement à une famille</h4>
            <Field label="Dossier"><select required value={form.dossier_id ?? ""} onChange={(e) => setForm({ ...form, dossier_id: e.target.value })} className="input"><option value="">— Choisir —</option>{dossiers.map((d: any) => <option key={d.id} value={d.id}>{d.numero} · {d.membres?.prenom} {d.membres?.nom}</option>)}</select></Field>
            <Field label="Nom famille bénéficiaire"><input required value={form.beneficiaire_nom ?? ""} onChange={(e) => setForm({ ...form, beneficiaire_nom: e.target.value })} className="input" /></Field>
            <Field label="Compte MoMo destinataire"><input value={form.compte_destination ?? ""} onChange={(e) => setForm({ ...form, compte_destination: e.target.value })} className="input" /></Field>
            <Field label="Montant (FCFA)"><input type="number" required value={form.montant ?? ""} onChange={(e) => setForm({ ...form, montant: +e.target.value })} className="input" /></Field>
            <Field label="Référence"><input value={form.reference ?? ""} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="input" placeholder={`Versement ${assoNom}`} /></Field>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setForm(null)} className="px-4 h-10 rounded-lg hover:bg-muted text-sm">Annuler</button><button className="px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: any) { return <label className="block"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</div>{children}</label>; }
