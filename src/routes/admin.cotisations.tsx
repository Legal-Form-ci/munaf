import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getCotisations, formatFcfa } from "@/lib/mock-data";
import { Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/cotisations")({
  head: () => ({ meta: [{ title: "Cotisations — MuNAF" }] }),
  component: () => (
    <AppShell>
      <CotisationsPage />
    </AppShell>
  ),
});

const MODE_STYLES: Record<string, string> = {
  Wave: "bg-blue-500/15 text-blue-700",
  "Orange Money": "bg-orange-500/15 text-orange-700",
  "MTN Money": "bg-yellow-500/15 text-yellow-700",
  "Moov Money": "bg-cyan-500/15 text-cyan-700",
  Manuel: "bg-muted text-muted-foreground",
};

function CotisationsPage() {
  const list = getCotisations();
  const total = list.filter((c) => c.statut === "réussi").reduce((s, c) => s + c.montant, 0);
  const enAttente = list.filter((c) => c.statut === "en_attente").reduce((s, c) => s + c.montant, 0);
  const echoues = list.filter((c) => c.statut === "échoué").length;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Cotisations</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivi des paiements numériques et manuels</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Wallet} label="Total transactions" value={list.length.toString()} accent="primary" />
        <SummaryCard icon={CheckCircle2} label="Collecté (réussi)" value={formatFcfa(total)} accent="success" />
        <SummaryCard icon={Clock} label="En attente" value={formatFcfa(enAttente)} accent="warning" />
        <SummaryCard icon={XCircle} label="Échoués" value={echoues.toString()} accent="destructive" />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Référence</th>
                <th className="text-left px-4 py-3 font-medium">Membre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium">Mode</th>
                <th className="text-left px-4 py-3 font-medium">Montant</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.slice(0, 80).map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><code className="text-xs bg-muted px-2 py-1 rounded">{c.reference}</code></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={c.memberPhoto} alt="" className="size-8 rounded-full object-cover" />
                      <span className="font-medium">{c.memberNom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${MODE_STYLES[c.mode]}`}>{c.mode}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatFcfa(c.montant)}</td>
                  <td className="px-4 py-3">
                    {c.statut === "réussi" && <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="size-3.5" />Réussi</span>}
                    {c.statut === "en_attente" && <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-foreground"><Clock className="size-3.5" />En attente</span>}
                    {c.statut === "échoué" && <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="size-3.5" />Échoué</span>}
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

function SummaryCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  const cls: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className={`size-10 rounded-xl flex items-center justify-center ${cls[accent]}`}>
        <Icon className="size-5" />
      </div>
      <div className="mt-4 text-xl font-display font-bold tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
