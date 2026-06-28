import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAssociations, useUpsertAssociation, useMembers } from "@/lib/api";
import { useState } from "react";
import { Building2, Plus, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/associations")({
  head: () => ({ meta: [{ title: "Associations — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const { data } = useAssociations();
  const { data: membres } = useMembers();
  const up = useUpsertAssociation();
  const [form, setForm] = useState<any | null>(null);

  const countFor = (id: string) => (membres ?? []).filter((m: any) => m.association_id === id).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display font-bold text-2xl">Associations</h1><p className="text-sm text-muted-foreground">{(data ?? []).length} association(s) enregistrée(s)</p></div>
        <button onClick={() => setForm({ type: "mutuelle", ville: "Daloa", status: "actif" })} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-2"><Plus className="size-4" /> Nouvelle association</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data ?? []).map((a: any) => (
          <div key={a.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Building2 className="size-5" /></div>
              <button onClick={() => setForm(a)} className="text-xs p-1 hover:bg-muted rounded"><Pencil className="size-4" /></button>
            </div>
            <h3 className="font-display font-bold mt-3">{a.nom}</h3>
            <div className="text-xs text-muted-foreground">{a.type} · {a.quartier}</div>
            <div className="flex gap-2 mt-3 text-xs"><span className="px-2 py-1 rounded-full bg-accent text-primary font-semibold">{countFor(a.id)} membre(s)</span><span className="px-2 py-1 rounded-full bg-muted">{a.status}</span></div>
            <div className="text-xs text-muted-foreground mt-3">Représentant : {a.representant_nom} · {a.representant_telephone}</div>
          </div>
        ))}
        {(data ?? []).length === 0 && <div className="col-span-full rounded-2xl border bg-card p-8 text-center text-muted-foreground">Aucune association. Créez la première.</div>}
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setForm(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); up.mutate(form, { onSuccess: () => setForm(null) }); }} className="bg-card rounded-2xl p-6 max-w-lg w-full space-y-3">
            <h4 className="font-display font-bold text-lg">{form.id ? "Modifier" : "Nouvelle"} association</h4>
            <Field label="Nom"><input required value={form.nom ?? ""} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input"><option value="mutuelle">Mutuelle</option><option value="tontine">Tontine</option><option value="cooperative">Coopérative</option><option value="religieuse">Religieuse</option><option value="syndicat">Syndicat</option></select></Field>
              <Field label="Quartier"><input required value={form.quartier ?? ""} onChange={(e) => setForm({ ...form, quartier: e.target.value })} className="input" /></Field>
              <Field label="Représentant"><input required value={form.representant_nom ?? ""} onChange={(e) => setForm({ ...form, representant_nom: e.target.value })} className="input" /></Field>
              <Field label="Téléphone"><input required value={form.representant_telephone ?? ""} onChange={(e) => setForm({ ...form, representant_telephone: e.target.value })} className="input" /></Field>
              <Field label="Email"><input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
              <Field label="Compte MoMo"><input value={form.compte_mobile_money ?? ""} onChange={(e) => setForm({ ...form, compte_mobile_money: e.target.value })} className="input" /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setForm(null)} className="px-4 h-10 rounded-lg hover:bg-muted text-sm">Annuler</button><button className="px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: any) { return <label className="block"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</div>{children}</label>; }
