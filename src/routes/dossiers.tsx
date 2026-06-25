import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getDossiers, formatFcfa, DOSSIER_LABEL, type DossierStatus } from "@/lib/mock-data";
import { DossierStatusBadge } from "@/components/StatusBadge";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/dossiers")({
  head: () => ({ meta: [{ title: "Dossiers décès — MuNAF" }] }),
  component: () => (
    <AppShell>
      <DossiersPage />
    </AppShell>
  ),
});

const STATUSES: DossierStatus[] = ["declare", "verification", "valide", "transmis", "assistance_versee", "cloture"];

function DossiersPage() {
  const all = getDossiers();
  const [filter, setFilter] = useState<DossierStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? all : all.filter((d) => d.status === filter)),
    [all, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    STATUSES.forEach((s) => (c[s] = all.filter((d) => d.status === s).length));
    return c;
  }, [all]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Dossiers décès</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivi des déclarations, validations et versements d'assistance
        </p>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`rounded-xl border p-4 text-left transition-all ${
              filter === s ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card hover:border-primary/40"
            }`}
          >
            <div className="text-2xl font-display font-bold">{counts[s]}</div>
            <div className="text-xs text-muted-foreground mt-1">{DOSSIER_LABEL[s]}</div>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-display font-bold">{filtered.length} dossier(s)</h2>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="text-sm text-primary hover:underline">
              Effacer le filtre
            </button>
          )}
        </div>
        <div className="divide-y">
          {filtered.map((d) => (
            <div key={d.id} className="p-5 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-4">
                <img src={d.memberPhoto} alt="" className="size-14 rounded-xl object-cover ring-2 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{d.memberNom}</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{d.numero}</code>
                    <DossierStatusBadge status={d.status} />
                  </div>
                  <div className="mt-1.5 text-sm text-muted-foreground">
                    Décès : <span className="text-foreground">{d.dateDeces}</span> ·
                    Déclaré le {d.declareLe} par <span className="text-foreground">{d.declarePar}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {d.village}, {d.region} · Bénéficiaire : <span className="text-foreground">{d.beneficiaire}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-display font-bold text-gold">{formatFcfa(d.montantAssistance)}</div>
                  <div className="text-xs text-muted-foreground">Capital assistance</div>
                  <button className="mt-2 inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border text-xs font-medium hover:bg-muted">
                    <FileText className="size-3.5" /> Voir dossier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
