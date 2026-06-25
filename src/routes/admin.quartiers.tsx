import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getMembers, getStats, formatFcfa } from "@/lib/mock-data";
import { MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/regions")({
  head: () => ({ meta: [{ title: "Régions — MuNAF" }] }),
  component: () => (
    <AppShell>
      <RegionsPage />
    </AppShell>
  ),
});

function RegionsPage() {
  const stats = getStats();
  const members = getMembers();
  const sorted = [...stats.byRegion].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Régions & délégués</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Couverture territoriale et représentants locaux
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((r) => {
          const regionMembers = members.filter((m) => m.region === r.region);
          const cotise = regionMembers.reduce((s, m) => s + m.totalCotise, 0);
          const actifs = regionMembers.filter((m) => m.status === "actif").length;
          return (
            <div key={r.region} className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="size-11 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                  <MapPin className="size-5" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success font-medium">
                  {actifs} actifs
                </span>
              </div>
              <h3 className="mt-4 font-display font-bold text-lg">{r.region}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Membres</div>
                  <div className="font-semibold flex items-center gap-1.5"><Users className="size-3.5" />{r.count}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cotisé total</div>
                  <div className="font-semibold tabular-nums">{formatFcfa(cotise)}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {r.region.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">Délégué régional</div>
                  <div className="text-xs text-muted-foreground">{Math.ceil(r.count / 30)} délégués locaux</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
