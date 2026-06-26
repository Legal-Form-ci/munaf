import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCotisations, useMarkCotisation, formatFcfa, COT_LABEL } from "@/lib/api";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cotisations")({
  head: () => ({ meta: [{ title: "Cotisations — MuNAF" }] }),
  component: () => (<AppShell><Page /></AppShell>),
});

function Page() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useCotisations();
  const mark = useMarkCotisation();
  const filtered = (data ?? []).filter((c: any) => !status || c.status === status);

  const totals = (data ?? []).reduce((acc: any, c: any) => {
    acc.total += c.montant; if (c.status === "payee") acc.payee += c.montant;
    else if (c.status === "en_attente") acc.attente += c.montant;
    else acc.retard += c.montant; return acc;
  }, { total: 0, payee: 0, attente: 0, retard: 0 });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl">Cotisations</h1>
        <p className="text-sm text-muted-foreground">Suivi des paiements mensuels.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total" value={formatFcfa(totals.total)} />
        <Stat label="Payées" value={formatFcfa(totals.payee)} accent="emerald" />
        <Stat label="En attente" value={formatFcfa(totals.attente)} accent="amber" />
        <Stat label="En retard" value={formatFcfa(totals.retard)} accent="red" />
      </div>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-3 rounded-lg border bg-card text-sm">
        <option value="">Toutes</option>
        <option value="payee">Payées</option>
        <option value="en_attente">En attente</option>
        <option value="en_retard">En retard</option>
      </select>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase">
              <tr><th className="px-4 py-3">Membre</th><th className="px-4 py-3">Mois</th><th className="px-4 py-3">Montant</th><th className="px-4 py-3">Statut</th><th></th></tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="size-5 animate-spin mx-auto" /></td></tr> :
                filtered.slice(0, 200).map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.membres?.prenom} {c.membres?.nom}</div>
                    <div className="text-xs text-muted-foreground font-mono">{c.membres?.matricule}</div>
                  </td>
                  <td className="px-4 py-3">{new Date(c.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</td>
                  <td className="px-4 py-3 font-semibold">{formatFcfa(c.montant)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.status === "payee" ? "bg-emerald-100 text-emerald-700" : c.status === "en_attente" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {COT_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.status !== "payee" && (
                      <button onClick={() => mark.mutate({ id: c.id, status: "payee" }, { onSuccess: () => toast.success("Marquée payée") })} className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Payer
                      </button>
                    )}
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
function Stat({ label, value, accent }: any) {
  const map: any = { emerald: "text-emerald-700", amber: "text-amber-700", red: "text-red-700" };
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase text-muted-foreground font-semibold">{label}</div>
      <div className={`text-xl font-display font-bold mt-1 ${map[accent] ?? ""}`}>{value}</div>
    </div>
  );
}
