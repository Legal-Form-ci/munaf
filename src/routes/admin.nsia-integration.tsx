import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound, Plus, Trash2, Copy, Check, Webhook, ExternalLink, ShieldAlert,
  BookOpen, RefreshCw, PowerOff, ClipboardCopy,
} from "lucide-react";
import {
  useNsiaApiKeys, useCreateNsiaApiKey, useRevokeNsiaApiKey, useDeleteNsiaApiKey,
  useNsiaWebhooks, useUpsertNsiaWebhook, useDeleteNsiaWebhook,
  runNsiaReconcile,
} from "@/lib/api";

export const Route = createFileRoute("/admin/nsia-integration")({
  head: () => ({ meta: [{ title: "API & Webhooks NSIA — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

const TABS = [
  { id: "keys", label: "Clés API", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "docs", label: "Documentation", icon: BookOpen },
  { id: "reconcile", label: "Réconciliation", icon: RefreshCw },
] as const;

function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("keys");
  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <div className="text-xs uppercase tracking-wider text-gold font-bold">Super-admin</div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">Intégration NSIA — API & Webhooks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Générez les clés API, configurez les webhooks sortants et partagez la documentation
          avec les équipes développeurs NSIA.
        </p>
      </header>

      <div className="flex flex-wrap gap-1 border-b overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="size-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "keys" && <KeysTab />}
      {tab === "webhooks" && <WebhooksTab />}
      {tab === "docs" && <DocsTab />}
      {tab === "reconcile" && <ReconcileTab />}
    </div>
  );
}

// ─────────────────────────────────── CLÉS API ───────────────────────────────────

function KeysTab() {
  const { data: keys, isLoading } = useNsiaApiKeys();
  const createKey = useCreateNsiaApiKey();
  const revoke = useRevokeNsiaApiKey();
  const del = useDeleteNsiaApiKey();
  const [label, setLabel] = useState("");
  const [env, setEnv] = useState("production");
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    try {
      const { key } = await createKey.mutateAsync({ label: label.trim(), environment: env });
      setFreshKey(key);
      setLabel("");
      toast.success("Clé API générée — copiez-la maintenant, elle ne sera plus visible.");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus className="size-4" /> Nouvelle clé API</h2>
        <form onSubmit={submit} className="grid md:grid-cols-[1fr_180px_auto] gap-3">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (ex : NSIA Production, Équipe DEV NSIA)" className="input" required />
          <select value={env} onChange={(e) => setEnv(e.target.value)} className="input">
            <option value="production">Production</option>
            <option value="sandbox">Sandbox</option>
          </select>
          <button className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Générer</button>
        </form>
        {freshKey && (
          <div className="mt-4 rounded-lg border-2 border-gold bg-gold/10 p-4">
            <div className="text-xs font-bold text-gold uppercase mb-2">⚠️ Clé secrète — copiez-la maintenant</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white p-3 rounded font-mono break-all">{freshKey}</code>
              <button onClick={() => { navigator.clipboard.writeText(freshKey); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="p-2 rounded bg-primary text-primary-foreground shrink-0">
                {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}
              </button>
            </div>
            <button onClick={() => setFreshKey(null)} className="mt-3 text-xs text-primary underline">J'ai copié la clé, masquer</button>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 md:p-6 border-b">
          <h2 className="font-bold text-lg">Clés existantes</h2>
          <p className="text-xs text-muted-foreground">Le hash SHA-256 est stocké ; la valeur en clair n'est disponible qu'à la génération.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Label</th><th className="text-left p-3">Env.</th><th className="text-left p-3">Prefix</th><th className="text-left p-3">Dernière utilisation</th><th className="text-left p-3">Statut</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>}
              {!isLoading && (keys ?? []).length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Aucune clé pour l'instant.</td></tr>}
              {(keys ?? []).map((k: any) => (
                <tr key={k.id}>
                  <td className="p-3 font-medium">{k.label}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${k.environment === "production" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{k.environment}</span></td>
                  <td className="p-3 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="p-3 text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString("fr-FR") : "Jamais"}</td>
                  <td className="p-3">
                    {k.active ? <span className="text-emerald-700 text-xs font-semibold">Active</span> : <span className="text-red-700 text-xs font-semibold">Révoquée</span>}
                  </td>
                  <td className="p-3 flex gap-1 justify-end">
                    {k.active && <button onClick={() => revoke.mutate(k.id)} title="Révoquer" className="p-1.5 rounded hover:bg-muted text-amber-600"><PowerOff className="size-4" /></button>}
                    <button onClick={() => { if (confirm("Supprimer définitivement ?")) del.mutate(k.id); }} title="Supprimer" className="p-1.5 rounded hover:bg-muted text-red-600"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────── WEBHOOKS ───────────────────────────────────

const EVENTS = [
  "dossier.transmis", "dossier.updated", "dossier.validated", "dossier.rejected", "dossier.paid",
];

function WebhooksTab() {
  const { data: hooks, isLoading } = useNsiaWebhooks();
  const upsert = useUpsertNsiaWebhook();
  const del = useDeleteNsiaWebhook();
  const [form, setForm] = useState({ label: "", url: "", events: ["dossier.transmis", "dossier.updated"] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert.mutateAsync(form);
      setForm({ label: "", url: "", events: ["dossier.transmis", "dossier.updated"] });
      toast.success("Webhook enregistré. Un secret HMAC a été généré.");
    } catch (e: any) { toast.error(e.message ?? "Erreur"); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-bold text-lg mb-4">Nouveau webhook sortant</h2>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (ex : NSIA Sinistres Prod)" className="input" required />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://api.nsia.ci/webhooks/munaf" type="url" className="input" required />
          <div className="md:col-span-2">
            <div className="text-xs font-semibold mb-2">Événements à envoyer</div>
            <div className="flex flex-wrap gap-2">
              {EVENTS.map((ev) => {
                const on = form.events.includes(ev);
                return (
                  <button type="button" key={ev} onClick={() => setForm({ ...form, events: on ? form.events.filter((e) => e !== ev) : [...form.events, ev] })}
                    className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>{ev}</button>
                );
              })}
            </div>
          </div>
          <button className="md:col-span-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Enregistrer le webhook</button>
        </form>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 md:p-6 border-b"><h2 className="font-bold text-lg">Webhooks configurés</h2></div>
        <div className="divide-y">
          {isLoading && <div className="p-6 text-muted-foreground text-sm">Chargement…</div>}
          {!isLoading && (hooks ?? []).length === 0 && <div className="p-6 text-muted-foreground text-sm">Aucun webhook configuré.</div>}
          {(hooks ?? []).map((h: any) => (
            <div key={h.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{h.label} {h.active ? <span className="ml-2 text-emerald-700 text-xs">● actif</span> : <span className="ml-2 text-muted-foreground text-xs">inactif</span>}</div>
                <div className="text-xs font-mono text-muted-foreground truncate">{h.url}</div>
                <div className="text-xs mt-1 flex flex-wrap gap-1">{(h.events ?? []).map((e: string) => <span key={e} className="bg-muted px-2 py-0.5 rounded">{e}</span>)}</div>
                <div className="text-xs mt-1 text-muted-foreground">Secret HMAC : <code className="font-mono">{h.secret?.slice(0, 12)}…</code> · Dernière livraison : {h.last_delivery_at ? `${new Date(h.last_delivery_at).toLocaleString("fr-FR")} (HTTP ${h.last_status ?? "-"})` : "jamais"}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => upsert.mutate({ id: h.id, active: !h.active, secret: h.secret })}
                  className="text-xs px-3 py-1.5 rounded border hover:bg-muted">{h.active ? "Désactiver" : "Activer"}</button>
                <button onClick={() => { if (confirm("Supprimer ?")) del.mutate(h.id); }} className="text-xs px-3 py-1.5 rounded border text-red-600 hover:bg-red-50">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────── DOCUMENTATION ───────────────────────────────────

function DocsTab() {
  const url = typeof window !== "undefined" ? `${window.location.origin}/nsia-api` : "/nsia-api";
  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2"><BookOpen className="size-5" /> Documentation développeur</h2>
          <p className="text-sm text-muted-foreground mt-1">La documentation complète (endpoints, exemples Node/Python/PHP/Java, webhooks) est hébergée sur une page dédiée.</p>
        </div>
        <a href="/nsia-api" target="_blank" rel="noreferrer"
          className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 justify-center">
          Ouvrir la documentation <ExternalLink className="size-4" />
        </a>
      </div>
      <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
        <div><span className="font-semibold">Base URL :</span> <code>{typeof window !== "undefined" ? window.location.origin : ""}/api/public/nsia</code></div>
        <div><span className="font-semibold">Auth :</span> header <code>X-NSIA-API-Key</code></div>
        <div><span className="font-semibold">Lien partageable NSIA :</span> <code>{url}</code>
          <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Lien copié"); }} className="ml-2 text-primary underline text-xs">Copier</button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Envoyez ce lien + une clé API générée dans l'onglet <b>Clés API</b> à l'équipe technique NSIA.
        Elle contient : endpoints REST, exemples de code, format des webhooks, codes d'erreur.
      </div>
    </div>
  );
}

// ─────────────────────────────────── RÉCONCILIATION ───────────────────────────────────

function ReconcileTab() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    setRunning(true);
    try {
      const r = await runNsiaReconcile();
      setResult(r);
      toast.success(`Réconciliation OK — ${r.detected ?? 0} écart(s) détecté(s), ${r.inserted ?? 0} nouvelle(s) alerte(s)`);
    } catch (e: any) { toast.error(e.message ?? "Erreur"); }
    finally { setRunning(false); }
  };

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <ShieldAlert className="size-6 text-gold shrink-0 mt-1" />
        <div>
          <h2 className="font-bold text-lg">Job de réconciliation NSIA</h2>
          <p className="text-sm text-muted-foreground">
            Compare les statuts des dossiers Supabase avec les derniers événements NSIA et crée
            automatiquement des <b>alertes</b> en cas d'écart (aucune réponse &gt; 72h, statut
            incohérent, échecs API répétés). Le job s'exécute automatiquement toutes les heures
            via pg_cron ; ce bouton permet un déclenchement manuel.
          </p>
        </div>
      </div>

      <button onClick={run} disabled={running}
        className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50">
        <RefreshCw className={`size-4 ${running ? "animate-spin" : ""}`} /> {running ? "Analyse en cours…" : "Lancer maintenant"}
      </button>

      {result && (
        <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
          <div><b>Dossiers analysés :</b> {result.checked}</div>
          <div><b>Écarts détectés :</b> {result.detected}</div>
          <div><b>Nouvelles alertes créées :</b> {result.inserted}</div>
          <div className="text-xs text-muted-foreground">{result.timestamp}</div>
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-4">
        <b>Planification (à exécuter une seule fois dans le SQL Editor Supabase) :</b>
        <pre className="mt-2 bg-[#0e1633] text-white p-3 rounded-lg overflow-x-auto text-[11px]">{`SELECT cron.schedule('nsia-reconcile-hourly','0 * * * *',$$
  SELECT net.http_post(
    url:='https://project--5181194d-1285-432c-bbf7-5551442e2b31.lovable.app/api/public/hooks/nsia-reconcile',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  );
$$);`}</pre>
        <div className="mt-1">Voir <code>plan.md §14–15</code> pour le SQL complet.</div>
      </div>
    </div>
  );
}
