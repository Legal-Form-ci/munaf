import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  useNsiaSync, useDossiers, useCreateNsiaSync, formatFcfa, DOSSIER_LABEL,
} from "@/lib/api";
import { useMemo, useState } from "react";
import {
  RefreshCw, Send, CheckCircle2, AlertCircle, AlertTriangle, Activity,
  Copy, Check, ExternalLink, KeyRound, Wifi, TimerReset, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/nsia")({
  head: () => ({ meta: [{ title: "Intégration NSIA — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

const DEMO_API_KEY = "munaf-nsia-demo-key-2026";

function Page() {
  const { data: sync, refetch: refetchSync, isFetching } = useNsiaSync(100);
  const { data: dossiers } = useDossiers();
  const createSync = useCreateNsiaSync();
  const [copied, setCopied] = useState(false);

  const aTransmettre = (dossiers ?? []).filter((d: any) => d.status === "valide");
  const events = sync ?? [];

  // ── Indicateurs de synchronisation ────────────────────────────────
  const stats = useMemo(() => {
    const total = events.length;
    const success = events.filter((e: any) => e.status === "success" || e.status === "received").length;
    const failed = events.filter((e: any) => e.status === "failed").length;
    const lastSync = events[0]?.created_at as string | undefined;
    const last24h = events.filter((e: any) => Date.now() - new Date(e.created_at).getTime() < 86400000).length;
    const rate = total > 0 ? Math.round((success / total) * 100) : 100;
    const ageMin = lastSync ? Math.round((Date.now() - new Date(lastSync).getTime()) / 60000) : null;
    return { total, success, failed, lastSync, ageMin, last24h, rate };
  }, [events]);

  // ── Détection d'écarts (drift) ────────────────────────────────────
  const ecarts = useMemo(() => {
    const list: any[] = [];
    // 1) Dossier coté MuNAF = "transmis" mais aucun événement NSIA depuis > 3 jours
    for (const d of dossiers ?? []) {
      if (d.status !== "transmis") continue;
      const lastEvt = events.find((e: any) => e.dossier_id === d.id);
      const ageDays = lastEvt
        ? (Date.now() - new Date(lastEvt.created_at).getTime()) / 86400000
        : (Date.now() - new Date(d.updated_at ?? d.created_at).getTime()) / 86400000;
      if (ageDays > 3) {
        list.push({
          type: "no_response",
          dossier: d,
          message: `Transmis depuis ${Math.round(ageDays)} j sans réponse NSIA`,
        });
      }
    }
    // 2) Dernier événement NSIA dit "verse" mais dossier MuNAF pas encore "assistance_versee"
    for (const e of events) {
      if (e.type?.includes("paid") || e.type?.includes("verse")) {
        const d = (dossiers ?? []).find((x: any) => x.id === e.dossier_id);
        if (d && !["assistance_versee", "cloture"].includes(d.status)) {
          list.push({ type: "status_mismatch", dossier: d, message: `NSIA a notifié versé · statut MuNAF = ${d.status}` });
        }
      }
    }
    // 3) Échecs récents (< 48h)
    for (const e of events.slice(0, 20)) {
      if (e.status === "failed") {
        list.push({ type: "failure", dossier: e.dossiers, message: e.message ?? "Échec API", evt: e });
      }
    }
    return list.slice(0, 30);
  }, [dossiers, events]);

  const transmettre = async (d: any) => {
    await createSync.mutateAsync({
      type: "dossier_transmis", dossier_id: d.id, status: "success",
      message: `Transmis à NSIA · ${d.numero}`,
      payload: { numero: d.numero, montant: d.montant_assistance },
    });
    toast.success("Dossier transmis à NSIA");
  };

  const pingApi = async () => {
    try {
      const r = await fetch("/api/public/nsia/health", { headers: { "X-NSIA-API-Key": DEMO_API_KEY } });
      const j = await r.json();
      if (r.ok) {
        await createSync.mutateAsync({ type: "ping", status: "success", message: `Ping OK · v${j.version}` });
        toast.success(`API OK · v${j.version}`);
      } else throw new Error(j.error);
    } catch (e: any) {
      await createSync.mutateAsync({ type: "ping", status: "failed", message: e.message });
      toast.error("Ping API échoué");
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(DEMO_API_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Intégration NSIA</h1>
          <p className="text-sm text-muted-foreground">
            Indicateurs de synchronisation bidirectionnelle, détection d'écarts et accès développeur NSIA.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/nsia-api" className="h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-2 hover:bg-muted">
            <ExternalLink className="size-3.5" /> Doc API publique
          </Link>
          <button onClick={() => refetchSync()} disabled={isFetching} className="h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-2 hover:bg-muted">
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Rafraîchir
          </button>
          <button onClick={pingApi} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-2">
            <Wifi className="size-3.5" /> Tester l'API
          </button>
        </div>
      </div>

      {/* KPIs de synchronisation */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="État connexion" value={stats.failed === 0 ? "Stable" : "Dégradée"} icon={Wifi} tone={stats.failed === 0 ? "ok" : "warn"} sub={`${stats.rate}% succès`} />
        <Kpi label="Dernière sync" value={stats.ageMin == null ? "—" : stats.ageMin < 60 ? `il y a ${stats.ageMin} min` : `il y a ${Math.round(stats.ageMin / 60)} h`} icon={TimerReset} tone={stats.ageMin != null && stats.ageMin < 60 ? "ok" : "warn"} sub={stats.lastSync ? new Date(stats.lastSync).toLocaleString("fr-FR") : ""} />
        <Kpi label="Événements 24h" value={stats.last24h} icon={Activity} tone="info" />
        <Kpi label="À transmettre" value={aTransmettre.length} icon={Send} tone={aTransmettre.length > 0 ? "warn" : "ok"} />
        <Kpi label="Écarts détectés" value={ecarts.length} icon={ShieldAlert} tone={ecarts.length > 0 ? "danger" : "ok"} />
      </div>

      {/* Bloc clé API + endpoint */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary to-[#0e1633] text-primary-foreground p-5">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="size-4 text-gold" />
          <h3 className="font-display font-bold">Accès développeur NSIA</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-gold font-bold">Base URL</div>
            <code className="text-xs break-all">{typeof window !== "undefined" ? window.location.origin : ""}/api/public/nsia</code>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-gold font-bold flex items-center justify-between">
              Clé API (sandbox)
              <button onClick={copyKey} className="text-white/80 hover:text-white">
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              </button>
            </div>
            <code className="text-xs">{DEMO_API_KEY}</code>
          </div>
        </div>
        <p className="text-xs text-white/70 mt-3">
          Lecture (GET dossiers), écriture (PATCH statut) et webhooks NSIA → MuNAF. La documentation publique
          détaille les exemples en Node, Python, PHP, Java.
        </p>
      </div>

      {/* Écarts */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2 bg-muted/30">
          <ShieldAlert className="size-4 text-red-600" />
          <h3 className="font-display font-semibold">Écarts de synchronisation</h3>
          <span className="text-xs text-muted-foreground ml-auto">{ecarts.length} détecté(s)</span>
        </div>
        {ecarts.length === 0 ? (
          <div className="p-6 text-sm text-center text-emerald-600 flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4" /> Aucun écart détecté — synchronisation cohérente.
          </div>
        ) : (
          <div className="divide-y">
            {ecarts.map((e: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                  e.type === "failure" ? "bg-red-100 text-red-700" :
                  e.type === "status_mismatch" ? "bg-amber-100 text-amber-700" :
                  "bg-orange-100 text-orange-700"
                }`}>{e.type.replace("_", " ")}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{e.dossier?.numero ?? e.dossier?.matricule ?? "—"} · {e.dossier?.prenom ?? ""} {e.dossier?.nom ?? ""}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.message}</div>
                </div>
                <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dossiers à transmettre */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Send className="size-4 text-primary" />
          <h3 className="font-display font-semibold">Dossiers prêts à transmettre</h3>
          <span className="text-xs text-muted-foreground ml-auto">{aTransmettre.length}</span>
        </div>
        <div className="divide-y max-h-80 overflow-y-auto">
          {aTransmettre.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun dossier en attente.</div>}
          {aTransmettre.map((d: any) => (
            <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{d.membres?.prenom} {d.membres?.nom}</div>
                <div className="text-xs text-muted-foreground">{d.numero} · {formatFcfa(d.montant_assistance ?? 0)} · {d.membres?.quartier}</div>
              </div>
              <button onClick={() => transmettre(d)} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shrink-0">
                <Send className="size-3" /> Transmettre
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Journal de synchronisation */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <RefreshCw className="size-4 text-primary" />
          <h3 className="font-display font-semibold">Derniers événements</h3>
          <span className="text-xs text-muted-foreground ml-auto">{events.length}</span>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase"><tr>
            <th className="text-left px-4 py-2">Date</th>
            <th className="text-left px-4 py-2">Type</th>
            <th className="text-left px-4 py-2">Dossier</th>
            <th className="text-left px-4 py-2">Statut</th>
            <th className="text-left px-4 py-2">Message</th>
          </tr></thead>
          <tbody className="divide-y">
            {events.slice(0, 50).map((s: any) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-2 text-xs font-mono">{s.type}</td>
                <td className="px-4 py-2 font-mono text-xs">{s.dossiers?.numero ?? "—"}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    s.status === "success" ? "bg-emerald-100 text-emerald-700" :
                    s.status === "received" ? "bg-blue-100 text-blue-700" :
                    s.status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{s.status}</span>
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground max-w-md truncate">{s.message ?? "—"}</td>
              </tr>
            ))}
            {events.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">Journal vide.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone = "info" }: any) {
  const tones: any = {
    ok: "text-emerald-600 bg-emerald-50",
    warn: "text-amber-600 bg-amber-50",
    danger: "text-red-600 bg-red-50",
    info: "text-primary bg-accent",
  };
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{label}</div>
          <div className="text-xl font-display font-bold mt-1 truncate">{value}</div>
          {sub && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
        </div>
        <div className={`size-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}
