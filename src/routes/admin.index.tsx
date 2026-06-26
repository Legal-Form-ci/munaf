import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStats, useDossiers, useMembers, formatFcfa, STATUS_LABEL, DOSSIER_LABEL } from "@/lib/api";
import { Users, TrendingUp, FileText, HandCoins, ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Tableau de bord — MuNAF Daloa" }] }),
  component: () => (<AppShell><Dashboard /></AppShell>),
});

function Kpi({ label, value, hint, icon: Icon, color = "primary" }: any) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
          <div className="text-3xl font-display font-bold mt-2">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`size-10 rounded-lg flex items-center justify-center ${color === "gold" ? "bg-gold/15 text-gold" : "bg-primary/10 text-primary"}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const stats = useStats();
  const dossiers = useDossiers();
  const recents = useMembers();

  if (stats.isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  const s = stats.data!;
  const recentDossiers = (dossiers.data ?? []).slice(0, 5);
  const recentMembres = (recents.data ?? []).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble en temps réel — zone pilote de Daloa.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Membres" value={s.total.toLocaleString("fr-FR")} hint={`${s.actifs} actifs · ${s.carence} en carence`} icon={Users} />
        <Kpi label="Cotisations collectées" value={formatFcfa(s.collecte)} hint="Cumul payées" icon={HandCoins} color="gold" />
        <Kpi label="Dossiers décès" value={s.dossiers} hint={`${s.decedes} membres décédés`} icon={FileText} />
        <Kpi label="Taux de couverture" value={`${s.total ? Math.round((s.actifs / s.total) * 100) : 0}%`} hint="Membres actifs" icon={TrendingUp} color="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-display font-semibold">Dossiers récents</h3>
            <Link to="/admin/dossiers" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              Voir tous <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentDossiers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground"><AlertCircle className="size-5 mx-auto mb-2" /> Aucun dossier.</div>
            ) : recentDossiers.map((d: any) => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{d.membres?.prenom} {d.membres?.nom}</div>
                  <div className="text-xs text-muted-foreground">{d.numero} · {d.membres?.quartier}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{DOSSIER_LABEL[d.status]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b"><h3 className="font-display font-semibold">Nouveaux membres</h3></div>
          <div className="divide-y">
            {recentMembres.map((m: any) => (
              <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                {m.photo_url ? <img src={m.photo_url} alt="" className="size-9 rounded-full object-cover" /> :
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{m.prenom[0]}{m.nom[0]}</div>}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{m.prenom} {m.nom}</div>
                  <div className="text-xs text-muted-foreground">{m.quartier} · {STATUS_LABEL[m.status]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
