import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, LogOut, ShieldCheck, Wallet, FileText, Users, Bell, Plus,
  Trash2, Heart, Home, FileUp,
} from "lucide-react";
import logo from "@/assets/munaf-logo.png";
import {
  STATUS_LABEL, formatFcfa, FORMULE_VALUE, COT_LABEL, DOSSIER_LABEL,
  useAyantsDroit, useBeneficiaires, useNotifications, useMarkNotifLue,
  useUpsertAyantDroit, useDeleteAyantDroit, useUpsertBeneficiaire, useDeleteBeneficiaire,
  useUpsertDossier, logAudit,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/membre")({
  head: () => ({ meta: [{ title: "Espace membre — MuNAF" }] }),
  component: MembrePage,
});

type Tab = "accueil" | "cotisations" | "ayants" | "beneficiaires" | "dossiers" | "notifications" | "declarer";

function MembrePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("accueil");

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
    queryFn: async () => (await supabase.from("cotisations").select("*").eq("membre_id", membre!.id).order("mois", { ascending: false })).data ?? [],
    enabled: !!membre?.id,
  });
  const { data: dossiers } = useQuery({
    queryKey: ["my-dossiers", membre?.id],
    queryFn: async () => (await supabase.from("dossiers").select("*").eq("membre_id", membre!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!membre?.id,
  });
  const ayants = useAyantsDroit(membre?.id);
  const benefs = useBeneficiaires(membre?.id);
  const notifs = useNotifications(user?.id);

  if (loading || isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const unread = (notifs.data ?? []).filter((n: any) => !n.lu).length;
  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "accueil", label: "Mon profil", icon: ShieldCheck },
    { id: "cotisations", label: "Cotisations", icon: Wallet },
    { id: "ayants", label: "Ayants droit", icon: Users, count: ayants.data?.length },
    { id: "beneficiaires", label: "Bénéficiaires", icon: Heart, count: benefs.data?.length },
    { id: "dossiers", label: "Mes dossiers", icon: FileText, count: dossiers?.length },
    { id: "declarer", label: "Déclarer un décès", icon: FileUp },
    { id: "notifications", label: "Notifications", icon: Bell, count: unread },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} className="size-9" alt="MuNAF" />
            <span className="font-display font-bold">Mu<span className="text-gold">NAF</span></span>
            <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-primary font-bold">Espace membre</span>
          </Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {!membre ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <ShieldCheck className="size-10 mx-auto text-primary" />
            <h2 className="font-display font-bold text-xl mt-3">Profil membre non lié</h2>
            <p className="text-muted-foreground mt-2 text-sm">Votre compte n'est pas encore rattaché à un profil membre. Contactez votre délégué de quartier.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[240px_1fr] gap-5">
            <aside className="md:sticky md:top-20 self-start space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span className="flex items-center gap-2"><Icon className="size-4" /> {t.label}</span>
                    {!!t.count && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${active ? "bg-white/20" : "bg-gold/15 text-gold"}`}>{t.count}</span>}
                  </button>
                );
              })}
            </aside>

            <div className="space-y-5">
              {tab === "accueil" && <ProfilCard membre={membre} />}
              {tab === "cotisations" && <CotisationsList items={cotisations ?? []} formule={membre.formule} />}
              {tab === "ayants" && <AyantsManager membreId={membre.id} items={ayants.data ?? []} />}
              {tab === "beneficiaires" && <BeneficiairesManager membreId={membre.id} items={benefs.data ?? []} />}
              {tab === "dossiers" && <DossiersList items={dossiers ?? []} />}
              {tab === "declarer" && <DeclarerDeces membre={membre} onDone={() => setTab("dossiers")} />}
              {tab === "notifications" && <NotificationsList items={notifs.data ?? []} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ProfilCard({ membre }: any) {
  return (
    <>
      <div className="rounded-2xl border bg-card p-6 flex items-start gap-5">
        {membre.photo_url ? <img src={membre.photo_url} className="size-20 rounded-full object-cover" alt="" /> : <div className="size-20 rounded-full bg-muted" />}
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl">{membre.prenom} {membre.nom}</h1>
          <div className="text-sm text-muted-foreground">Matricule <span className="font-mono">{membre.matricule}</span> · {membre.quartier}</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{STATUS_LABEL[membre.status]}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">Capital {formatFcfa(FORMULE_VALUE[membre.formule] ?? 0)}</span>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-5">
        <InfoCell label="Téléphone" value={membre.telephone} />
        <InfoCell label="Date d'adhésion" value={membre.date_adhesion ? new Date(membre.date_adhesion).toLocaleDateString("fr-FR") : "—"} />
        <InfoCell label="Ville" value={membre.ville ?? "Daloa"} />
      </div>
    </>
  );
}

function InfoCell({ label, value }: any) {
  return <div className="rounded-xl border bg-card p-4"><div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div><div className="text-sm font-medium mt-1">{value}</div></div>;
}

function CotisationsList({ items, formule }: any) {
  const total = items.filter((c: any) => c.status === "payee").reduce((s: number, c: any) => s + (c.montant ?? 0), 0);
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2"><Wallet className="size-4 text-primary" /><h3 className="font-display font-semibold">Mes cotisations</h3></div>
        <div className="text-sm">Total payé : <span className="font-bold text-primary">{formatFcfa(total)}</span></div>
      </div>
      <div className="divide-y max-h-[60vh] overflow-y-auto">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucune cotisation enregistrée.</div>}
        {items.map((c: any) => (
          <div key={c.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{new Date(c.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</div>
              {c.date_paiement && <div className="text-xs text-muted-foreground">Payé le {new Date(c.date_paiement).toLocaleDateString("fr-FR")}</div>}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatFcfa(c.montant)}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${c.status === "payee" ? "bg-emerald-100 text-emerald-700" : c.status === "en_attente" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{COT_LABEL[c.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AyantsManager({ membreId, items }: any) {
  const [form, setForm] = useState<any | null>(null);
  const up = useUpsertAyantDroit();
  const del = useDeleteAyantDroit();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Ayants droit</h3>
        <button onClick={() => setForm({ membre_id: membreId, niveau: "secondaire" })} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"><Plus className="size-4" /> Ajouter</button>
      </div>
      <div className="rounded-2xl border bg-card divide-y">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun ayant droit enregistré.</div>}
        {items.map((a: any) => (
          <div key={a.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{a.prenom} {a.nom} <span className="text-xs text-muted-foreground">· {a.lien}</span></div>
              <div className="text-xs text-muted-foreground">{a.niveau === "principal" ? "Principal" : "Secondaire"} · {a.telephone ?? "—"}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setForm(a)} className="text-xs px-2 py-1 rounded hover:bg-muted">Modifier</button>
              <button onClick={() => del.mutate(a.id)} className="text-xs text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {form && <AyantForm value={form} onClose={() => setForm(null)} onSave={(v: any) => up.mutate(v, { onSuccess: () => { setForm(null); toast.success("Enregistré"); } })} />}
    </div>
  );
}

function AyantForm({ value, onClose, onSave }: any) {
  const [v, setV] = useState(value);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h4 className="font-display font-bold text-lg mb-4">{v.id ? "Modifier" : "Nouvel"} ayant droit</h4>
        <div className="space-y-3">
          <Field label="Prénom"><input value={v.prenom ?? ""} onChange={(e) => setV({ ...v, prenom: e.target.value })} className="input" /></Field>
          <Field label="Nom"><input value={v.nom ?? ""} onChange={(e) => setV({ ...v, nom: e.target.value })} className="input" /></Field>
          <Field label="Lien"><select value={v.lien ?? "conjoint"} onChange={(e) => setV({ ...v, lien: e.target.value })} className="input"><option value="conjoint">Conjoint(e)</option><option value="enfant">Enfant</option><option value="parent">Parent</option><option value="frere_soeur">Frère/Sœur</option></select></Field>
          <Field label="Téléphone"><input value={v.telephone ?? ""} onChange={(e) => setV({ ...v, telephone: e.target.value })} className="input" /></Field>
          <Field label="Niveau"><select value={v.niveau ?? "secondaire"} onChange={(e) => setV({ ...v, niveau: e.target.value })} className="input"><option value="principal">Principal</option><option value="secondaire">Secondaire</option></select></Field>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onClose} className="px-4 h-10 rounded-lg hover:bg-muted text-sm">Annuler</button>
          <button onClick={() => onSave(v)} className="px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function BeneficiairesManager({ membreId, items }: any) {
  const [form, setForm] = useState<any | null>(null);
  const up = useUpsertBeneficiaire();
  const del = useDeleteBeneficiaire();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Bénéficiaires du capital</h3>
        <button onClick={() => setForm({ membre_id: membreId, quote_part: 100 })} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"><Plus className="size-4" /> Ajouter</button>
      </div>
      <div className="rounded-2xl border bg-card divide-y">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun bénéficiaire désigné.</div>}
        {items.map((b: any) => (
          <div key={b.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{b.prenom} {b.nom} <span className="text-xs text-muted-foreground">· {b.lien}</span></div>
              <div className="text-xs text-muted-foreground">{b.telephone} · MoMo {b.compte_mobile_money ?? "—"}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gold/15 text-gold font-bold">{b.quote_part}%</span>
              <button onClick={() => setForm(b)} className="text-xs px-2 py-1 rounded hover:bg-muted">Modifier</button>
              <button onClick={() => del.mutate(b.id)} className="text-xs text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {form && <BenefForm value={form} onClose={() => setForm(null)} onSave={(v: any) => up.mutate(v, { onSuccess: () => { setForm(null); toast.success("Enregistré"); } })} />}
    </div>
  );
}

function BenefForm({ value, onClose, onSave }: any) {
  const [v, setV] = useState(value);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h4 className="font-display font-bold text-lg mb-4">{v.id ? "Modifier" : "Nouveau"} bénéficiaire</h4>
        <div className="space-y-3">
          <Field label="Prénom"><input value={v.prenom ?? ""} onChange={(e) => setV({ ...v, prenom: e.target.value })} className="input" /></Field>
          <Field label="Nom"><input value={v.nom ?? ""} onChange={(e) => setV({ ...v, nom: e.target.value })} className="input" /></Field>
          <Field label="Lien"><input value={v.lien ?? ""} onChange={(e) => setV({ ...v, lien: e.target.value })} className="input" placeholder="ex. conjoint, fils, mère…" /></Field>
          <Field label="Téléphone"><input value={v.telephone ?? ""} onChange={(e) => setV({ ...v, telephone: e.target.value })} className="input" /></Field>
          <Field label="Compte Mobile Money"><input value={v.compte_mobile_money ?? ""} onChange={(e) => setV({ ...v, compte_mobile_money: e.target.value })} className="input" /></Field>
          <Field label="Quote-part (%)"><input type="number" min="1" max="100" value={v.quote_part ?? 100} onChange={(e) => setV({ ...v, quote_part: +e.target.value })} className="input" /></Field>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onClose} className="px-4 h-10 rounded-lg hover:bg-muted text-sm">Annuler</button>
          <button onClick={() => onSave(v)} className="px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function DossiersList({ items }: any) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center gap-2"><FileText className="size-4 text-primary" /><h3 className="font-display font-semibold">Mes dossiers</h3></div>
      <div className="divide-y">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun dossier déclaré.</div>}
        {items.map((d: any) => (
          <div key={d.id} className="px-5 py-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-sm">{d.numero}</div>
                <div className="text-xs text-muted-foreground">Déclaré le {new Date(d.created_at).toLocaleDateString("fr-FR")}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{DOSSIER_LABEL[d.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeclarerDeces({ membre, onDone }: any) {
  const [v, setV] = useState<any>({ membre_id: membre.id, defunt_nom: "", defunt_prenom: "", lien: "membre", date_deces: "", lieu_deces: "" });
  const up = useUpsertDossier();
  return (
    <form onSubmit={(e) => { e.preventDefault(); up.mutate(v, { onSuccess: () => { toast.success("Dossier déclaré"); logAudit("declarer_deces", "dossier"); onDone(); } }); }} className="rounded-2xl border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-lg">Déclarer un décès</h3>
        <p className="text-xs text-muted-foreground">Renseignez les informations principales. Vous pourrez joindre les documents (acte de décès, CNI) ensuite.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Lien avec le défunt"><select value={v.lien} onChange={(e) => setV({ ...v, lien: e.target.value })} className="input"><option value="membre">Le membre lui-même</option><option value="conjoint">Conjoint(e)</option><option value="enfant">Enfant</option><option value="parent">Parent</option></select></Field>
        <Field label="Date du décès"><input type="date" value={v.date_deces} onChange={(e) => setV({ ...v, date_deces: e.target.value })} className="input" required /></Field>
        <Field label="Prénom du défunt"><input value={v.defunt_prenom} onChange={(e) => setV({ ...v, defunt_prenom: e.target.value })} className="input" required /></Field>
        <Field label="Nom du défunt"><input value={v.defunt_nom} onChange={(e) => setV({ ...v, defunt_nom: e.target.value })} className="input" required /></Field>
        <Field label="Lieu du décès"><input value={v.lieu_deces} onChange={(e) => setV({ ...v, lieu_deces: e.target.value })} className="input" /></Field>
      </div>
      <div className="flex justify-end">
        <button disabled={up.isPending} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">{up.isPending ? "Envoi…" : "Déclarer le décès"}</button>
      </div>
    </form>
  );
}

function NotificationsList({ items }: any) {
  const mark = useMarkNotifLue();
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center gap-2"><Bell className="size-4 text-primary" /><h3 className="font-display font-semibold">Notifications</h3></div>
      <div className="divide-y max-h-[60vh] overflow-y-auto">
        {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucune notification.</div>}
        {items.map((n: any) => (
          <button key={n.id} onClick={() => !n.lu && mark.mutate(n.id)} className={`block w-full text-left px-5 py-3 hover:bg-muted/50 ${!n.lu ? "bg-accent/50" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`size-2 rounded-full mt-2 ${n.lu ? "bg-muted-foreground/40" : "bg-gold"}`} />
              <div className="flex-1">
                <div className="text-sm font-semibold">{n.titre}</div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("fr-FR")}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return <label className="block"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</div>{children}</label>;
}
