import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getStats, getDossiers, getCotisations, getMembers, formatFcfa } from "@/lib/mock-data";
import { MemberStatusBadge, DossierStatusBadge } from "@/components/StatusBadge";
import { Users, TrendingUp, FileText, HandCoins, ArrowUpRight, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Tableau de bord — MuNAF" }],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "gold" | "success" | "info";
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  };
  return (
    <div className="rounded-2xl bg-card border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`size-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>
          <Icon className="size-5" />
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-4">
        <div className="text-2xl font-display font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
        {hint && <div className="text-xs text-success mt-1.5">{hint}</div>}
      </div>
    </div>
  );
}

function Dashboard() {
  const stats = getStats();
  const dossiers = getDossiers().slice(0, 5);
  const cotisations = getCotisations().slice(0, 6);
  const recentMembers = getMembers().slice(-5).reverse();
  const maxRegion = Math.max(...stats.byRegion.map((r) => r.count));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Hero */}
      <div className="rounded-2xl bg-brand-gradient text-white p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-gold/10 blur-2xl" />
        <div className="relative">
          <div className="text-gold text-xs uppercase tracking-widest font-semibold mb-2">
            Tableau de bord national
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">Bonjour, Super Administrateur 👋</h1>
          <p className="text-white/70 mt-2 max-w-xl text-sm lg:text-base">
            Vue d'ensemble en temps réel de la mutuelle. {stats.totalMembers.toLocaleString("fr-FR")} membres
            inscrits dans {stats.byRegion.length} régions.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Membres inscrits" value={stats.totalMembers.toLocaleString("fr-FR")} hint="+12% ce mois" icon={Users} accent="primary" />
        <Kpi label="Cotisations collectées" value={formatFcfa(stats.cotisationsCollectees)} hint="60 derniers jours" icon={TrendingUp} accent="gold" />
        <Kpi label="Dossiers décès" value={String(stats.dossiersTotal)} hint={`${stats.dossiersEnCours} en cours`} icon={FileText} accent="info" />
        <Kpi label="Assistances versées" value={formatFcfa(stats.assistancesVersees)} hint="Cumul" icon={HandCoins} accent="success" />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { k: "actif", l: "Actifs", v: stats.actifs, cls: "bg-success" },
          { k: "carence", l: "En carence", v: stats.carence, cls: "bg-warning" },
          { k: "suspendu", l: "Suspendus", v: stats.suspendus, cls: "bg-muted-foreground" },
          { k: "expire", l: "Expirés", v: stats.expires, cls: "bg-orange-500" },
          { k: "resilie", l: "Résiliés", v: stats.resilies, cls: "bg-muted-foreground" },
          { k: "decede", l: "Décédés", v: stats.decedes, cls: "bg-destructive" },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border bg-card p-4">
            <div className={`size-2 rounded-full ${s.cls} mb-2`} />
            <div className="text-xl font-display font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent dossiers */}
        <div className="lg:col-span-2 rounded-2xl border bg-card">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="font-display font-bold text-lg">Dossiers décès récents</h2>
              <p className="text-xs text-muted-foreground">Validation et suivi des prestations</p>
            </div>
            <Link to="/dossiers" className="text-sm text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="divide-y">
            {dossiers.map((d) => (
              <div key={d.id} className="p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
                <img src={d.memberPhoto} alt="" className="size-11 rounded-full object-cover ring-2 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{d.memberNom}</span>
                    <span className="text-xs text-muted-foreground">· {d.numero}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {d.village}, {d.region} — déclaré le {d.declareLe}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold">{formatFcfa(d.montantAssistance)}</div>
                  <div className="text-xs text-muted-foreground">Capital</div>
                </div>
                <DossierStatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Régions */}
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-display font-bold text-lg">Répartition géographique</h2>
          <p className="text-xs text-muted-foreground mb-4">Membres par région</p>
          <div className="space-y-3">
            {stats.byRegion.sort((a, b) => b.count - a.count).map((r) => (
              <div key={r.region}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{r.region}</span>
                  <span className="text-muted-foreground tabular-nums">{r.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient rounded-full"
                    style={{ width: `${(r.count / maxRegion) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent cotisations */}
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display font-bold text-lg">Cotisations récentes</h2>
            <Link to="/cotisations" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y">
            {cotisations.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-3">
                <img src={c.memberPhoto} alt="" className="size-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.memberNom}</div>
                  <div className="text-xs text-muted-foreground">{c.mode} · {c.date}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{formatFcfa(c.montant)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* New members */}
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="font-display font-bold text-lg">Nouvelles inscriptions</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <AlertCircle className="size-3" /> En période de carence (90 jours)
              </p>
            </div>
            <Link to="/membres" className="text-sm text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="divide-y">
            {recentMembers.map((m) => (
              <div key={m.id} className="p-4 flex items-center gap-3">
                <img src={m.photo} alt="" className="size-10 rounded-full object-cover ring-2 ring-gold/30" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.prenom} {m.nom}</div>
                  <div className="text-xs text-muted-foreground">{m.village} · {formatFcfa(m.formule)}</div>
                </div>
                <MemberStatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
