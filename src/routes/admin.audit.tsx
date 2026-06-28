import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuditLog } from "@/lib/api";
import { Clock, User } from "lucide-react";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "Journal d'audit — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const { data } = useAuditLog(500);
  return (
    <div className="space-y-5">
      <div><h1 className="font-display font-bold text-2xl">Journal d'audit</h1><p className="text-sm text-muted-foreground">Historique immuable de toutes les actions sur la plateforme.</p></div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Utilisateur</th><th className="text-left px-4 py-2">Action</th><th className="text-left px-4 py-2">Entité</th><th className="text-left px-4 py-2">Détails</th></tr></thead>
          <tbody className="divide-y">
            {(data ?? []).map((e: any) => (
              <tr key={e.id}>
                <td className="px-4 py-2 text-xs"><div className="flex items-center gap-1 text-muted-foreground"><Clock className="size-3" />{new Date(e.created_at).toLocaleString("fr-FR")}</div></td>
                <td className="px-4 py-2 text-xs"><div className="flex items-center gap-1"><User className="size-3" />{e.user_label ?? "—"}</div></td>
                <td className="px-4 py-2"><span className="text-xs px-2 py-1 rounded-full bg-accent text-primary font-semibold">{e.action}</span></td>
                <td className="px-4 py-2 text-xs">{e.entite}{e.entite_id ? ` · ${e.entite_id.slice(0, 8)}…` : ""}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground max-w-md truncate">{e.details ? JSON.stringify(e.details) : "—"}</td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">Aucune action journalisée.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
