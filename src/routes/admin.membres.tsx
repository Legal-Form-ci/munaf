import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getMembers, formatFcfa, STATUS_LABEL, type MemberStatus } from "@/lib/mock-data";
import { MemberStatusBadge } from "@/components/StatusBadge";
import { useMemo, useState } from "react";
import { Search, Filter, Download, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/membres")({
  head: () => ({ meta: [{ title: "Membres — MuNAF" }] }),
  component: () => (
    <AppShell>
      <MembersPage />
    </AppShell>
  ),
});

const STATUSES: MemberStatus[] = ["actif", "carence", "suspendu", "expire", "resilie", "decede"];

function MembersPage() {
  const all = getMembers();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filtered = useMemo(() => {
    const qLow = q.toLowerCase();
    return all.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (!qLow) return true;
      return (
        m.nom.toLowerCase().includes(qLow) ||
        m.prenom.toLowerCase().includes(qLow) ||
        m.matricule.toLowerCase().includes(qLow) ||
        m.quartier.toLowerCase().includes(qLow) ||
        m.telephone.includes(qLow)
      );
    });
  }, [all, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Membres</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length.toLocaleString("fr-FR")} membre{filtered.length > 1 ? "s" : ""} —
            tous les souscripteurs MuNAF
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-lg border bg-card text-sm font-medium hover:bg-muted flex items-center gap-2">
            <Download className="size-4" /> Exporter
          </button>
          <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
            <UserPlus className="size-4" /> Nouveau membre
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Rechercher nom, matricule, quartier, téléphone…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:bg-card outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-muted-foreground" />
          <button
            onClick={() => { setStatus("all"); setPage(1); }}
            className={`px-3 h-8 rounded-full text-xs font-medium border ${status === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
          >
            Tous
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 h-8 rounded-full text-xs font-medium border ${status === s ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Membre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Matricule</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Localité</th>
                <th className="text-left px-4 py-3 font-medium">Formule</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cotisé</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={m.photo} alt="" className="size-10 rounded-full object-cover ring-1 ring-border" />
                      <div>
                        <div className="font-medium">{m.prenom} {m.nom}</div>
                        <div className="text-xs text-muted-foreground">{m.profession} · {m.telephone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{m.matricule}</code>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div>{m.quartier}</div>
                    <div className="text-xs text-muted-foreground">Daloa</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold tabular-nums">{formatFcfa(m.formule)}</div>
                    <div className="text-xs text-muted-foreground">{formatFcfa(m.primeAnnuelle)}/an</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell tabular-nums">{formatFcfa(m.totalCotise)}</td>
                  <td className="px-4 py-3"><MemberStatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30 text-sm">
          <div className="text-muted-foreground">
            Page {page} sur {totalPages} · {filtered.length.toLocaleString("fr-FR")} résultats
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 h-8 rounded-lg border bg-card disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 h-8 rounded-lg border bg-card disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
