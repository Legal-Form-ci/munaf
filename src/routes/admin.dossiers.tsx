import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useDossiers, useUpsertDossier, useDeleteDossier, uploadDossierDoc, formatFcfa, DOSSIER_LABEL } from "@/lib/api";
import { Loader2, FileText, Upload, Pencil, Trash2, X, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dossiers")({
  head: () => ({ meta: [{ title: "Dossiers décès — MuNAF" }] }),
  component: () => (<AppShell><Page /></AppShell>),
});

const STATUSES = ["declare","verification","valide","transmis","assistance_versee","cloture","rejete"];

function Page() {
  const [status, setStatus] = useState("");
  const [edit, setEdit] = useState<any | null>(null);
  const { data, isLoading } = useDossiers(status || undefined);
  const upsert = useUpsertDossier();
  const del = useDeleteDossier();

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl">Dossiers décès</h1>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} dossiers</p>
        </div>
        <button onClick={() => setEdit({})} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-2"><Plus className="size-4" /> Nouveau dossier</button>
      </div>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-3 rounded-lg border bg-card text-sm">
        <option value="">Tous statuts</option>
        {STATUSES.map((s) => <option key={s} value={s}>{DOSSIER_LABEL[s]}</option>)}
      </select>

      {isLoading ? <Loader2 className="size-6 animate-spin text-primary mx-auto my-12" /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {(data ?? []).map((d: any) => (
            <div key={d.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                {d.membres?.photo_url ? <img src={d.membres.photo_url} className="size-12 rounded-full object-cover" /> :
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center"><FileText className="size-5" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{d.membres?.prenom} {d.membres?.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-primary font-semibold">{DOSSIER_LABEL[d.status]}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.numero} · {d.membres?.quartier}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEdit(d)} className="p-2 rounded hover:bg-muted"><Pencil className="size-4" /></button>
                  <button onClick={() => { if (confirm(`Supprimer ${d.numero} ?`)) del.mutate(d.id, { onSuccess: () => toast.success("Supprimé") }); }} className="p-2 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div><div className="text-muted-foreground">Décès</div><div className="font-medium">{new Date(d.date_deces).toLocaleDateString("fr-FR")}</div></div>
                <div><div className="text-muted-foreground">Assistance</div><div className="font-medium">{formatFcfa(d.montant_assistance ?? 0)}</div></div>
                <div className="col-span-2"><div className="text-muted-foreground">Déclarant</div><div className="font-medium">{d.declarant_nom} · {d.declarant_telephone}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && <DossierDrawer dossier={edit} onClose={() => setEdit(null)} onSave={async (p: any) => { await upsert.mutateAsync(p); toast.success("Enregistré"); setEdit(null); }} />}
    </div>
  );
}

function DossierDrawer({ dossier, onClose, onSave }: any) {
  const [form, setForm] = useState({
    id: dossier.id,
    numero: dossier.numero ?? "",
    membre_id: dossier.membre_id ?? "",
    declarant_nom: dossier.declarant_nom ?? "",
    declarant_telephone: dossier.declarant_telephone ?? "",
    declarant_lien: dossier.declarant_lien ?? "Conjoint",
    date_deces: dossier.date_deces ?? new Date().toISOString().slice(0,10),
    lieu_deces: dossier.lieu_deces ?? "Daloa",
    status: dossier.status ?? "declare",
    montant_assistance: dossier.montant_assistance ?? 0,
    notes: dossier.notes ?? "",
  });
  const [uploading, setUploading] = useState(false);

  const handleDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !dossier.id) return;
    setUploading(true);
    try { await uploadDossierDoc(file, dossier.id); toast.success("Document ajouté"); }
    catch (err: any) { toast.error(err.message); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-card overflow-y-auto">
        <div className="sticky top-0 bg-card border-b px-5 py-4 flex items-center justify-between">
          <h2 className="font-display font-bold">{dossier.id ? "Modifier" : "Nouveau"} dossier</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-muted"><X className="size-4" /></button>
        </div>
        <form className="p-5 space-y-3" onSubmit={async (e) => { e.preventDefault(); await onSave(form); }}>
          {!dossier.id && (
            <label className="block">
              <span className="text-xs font-semibold uppercase text-muted-foreground">ID Membre (UUID)</span>
              <input required value={form.membre_id} onChange={(e) => setForm({...form, membre_id: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm font-mono" />
              <span className="text-[11px] text-muted-foreground">Copiez l'ID depuis la liste des membres</span>
            </label>
          )}
          <label className="block">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Statut</span>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{DOSSIER_LABEL[s]}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Déclarant</span>
              <input required value={form.declarant_nom} onChange={(e) => setForm({...form, declarant_nom: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Tel.</span>
              <input required value={form.declarant_telephone} onChange={(e) => setForm({...form, declarant_telephone: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Date décès</span>
              <input required type="date" value={form.date_deces} onChange={(e) => setForm({...form, date_deces: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Lieu</span>
              <input value={form.lieu_deces} onChange={(e) => setForm({...form, lieu_deces: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm" /></label>
          </div>
          <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Montant assistance (FCFA)</span>
            <input type="number" value={form.montant_assistance} onChange={(e) => setForm({...form, montant_assistance: Number(e.target.value)})} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Notes</span>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={3} className="mt-1 w-full p-3 rounded-lg border bg-card text-sm" /></label>

          {dossier.id && (
            <label className="flex items-center gap-2 h-10 px-3 rounded-lg border bg-muted/30 text-sm cursor-pointer hover:bg-muted">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Joindre un document (PDF, image)
              <input type="file" onChange={handleDoc} className="hidden" />
            </label>
          )}
          <button type="submit" className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold mt-2">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
