import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMembers, useUpsertMembre, useDeleteMembre, uploadMemberPhoto, STATUS_LABEL, formatFcfa, FORMULE_VALUE } from "@/lib/api";
import { useState } from "react";
import { Search, UserPlus, Loader2, Pencil, Trash2, X, Upload, IdCard, FileSignature } from "lucide-react";
import { generateCarteMembre, generateAttestation } from "@/lib/pdf";
import { toast } from "sonner";


export const Route = createFileRoute("/admin/membres")({
  head: () => ({ meta: [{ title: "Membres — MuNAF" }] }),
  component: () => (<AppShell><MembersPage /></AppShell>),
});

const STATUSES = ["actif","carence","suspendu","expire","resilie","decede"];
const FORMULES = ["F100","F200","F300","F500","F1000"];

function statusClasses(s: string) {
  return {
    actif: "bg-emerald-100 text-emerald-700",
    carence: "bg-amber-100 text-amber-700",
    suspendu: "bg-orange-100 text-orange-700",
    expire: "bg-red-100 text-red-700",
    resilie: "bg-slate-200 text-slate-700",
    decede: "bg-slate-800 text-white",
  }[s] ?? "bg-muted";
}

function MembersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [edit, setEdit] = useState<any | null>(null);
  const { data, isLoading } = useMembers({ q: q || undefined, status: status || undefined });
  const upsert = useUpsertMembre();
  const del = useDeleteMembre();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Membres</h1>
          <p className="text-sm text-muted-foreground">{(data?.length ?? 0).toLocaleString("fr-FR")} résultats</p>
        </div>
        <button onClick={() => setEdit({})} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-2">
          <UserPlus className="size-4" /> Nouveau membre
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, matricule, téléphone…" className="w-full h-10 pl-9 pr-3 rounded-lg border bg-card text-sm" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-3 rounded-lg border bg-card text-sm">
          <option value="">Tous statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3 hidden md:table-cell">Quartier</th>
                <th className="px-4 py-3 hidden lg:table-cell">Téléphone</th>
                <th className="px-4 py-3">Formule</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center"><Loader2 className="size-5 animate-spin mx-auto" /></td></tr>
              ) : (data ?? []).slice(0, 100).map((m: any) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {m.photo_url ? <img src={m.photo_url} alt="" className="size-9 rounded-full object-cover" /> :
                      <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{m.prenom[0]}{m.nom[0]}</div>}
                    <div>
                      <div className="font-medium">{m.prenom} {m.nom}</div>
                      <div className="text-xs text-muted-foreground">{m.profession}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{m.matricule}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{m.quartier}</td>
                  <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs">{m.telephone}</td>
                  <td className="px-4 py-3">{formatFcfa(FORMULE_VALUE[m.formule])}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClasses(m.status)}`}>{STATUS_LABEL[m.status]}</span></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button title="Carte membre PDF" onClick={() => generateCarteMembre(m).then(() => toast.success("Carte téléchargée")).catch(() => toast.error("Erreur PDF"))} className="p-2 rounded hover:bg-muted"><IdCard className="size-4" /></button>
                    <button title="Attestation PDF" onClick={() => generateAttestation(m).then(() => toast.success("Attestation téléchargée")).catch(() => toast.error("Erreur PDF"))} className="p-2 rounded hover:bg-muted"><FileSignature className="size-4" /></button>
                    <button title="Modifier" onClick={() => setEdit(m)} className="p-2 rounded hover:bg-muted"><Pencil className="size-4" /></button>
                    <button title="Supprimer" onClick={() => { if (confirm(`Supprimer ${m.prenom} ${m.nom} ?`)) del.mutate(m.id, { onSuccess: () => toast.success("Membre supprimé") }); }} className="p-2 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(data?.length ?? 0) > 100 && <div className="p-3 text-xs text-center text-muted-foreground border-t">100 premiers affichés — affinez la recherche.</div>}
      </div>

      {edit && <MemberDrawer member={edit} onClose={() => setEdit(null)} onSave={async (payload) => {
        await upsert.mutateAsync(payload);
        toast.success("Membre enregistré");
        setEdit(null);
      }} />}
    </div>
  );
}

function MemberDrawer({ member, onClose, onSave }: { member: any; onClose: () => void; onSave: (p: any) => Promise<void> }) {
  const [form, setForm] = useState({
    id: member.id, nom: member.nom ?? "", prenom: member.prenom ?? "", sexe: member.sexe ?? "M",
    telephone: member.telephone ?? "", quartier: member.quartier ?? "Commerce", profession: member.profession ?? "",
    formule: member.formule ?? "F200", status: member.status ?? "carence", photo_url: member.photo_url ?? "",
    matricule: member.matricule ?? "",
  });
  const [uploading, setUploading] = useState(false);
  const upd = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMemberPhoto(file, form.matricule || `temp-${Date.now()}`);
      upd("photo_url", url); toast.success("Photo téléversée");
    } catch (err: any) { toast.error(err.message); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-card overflow-y-auto">
        <div className="sticky top-0 bg-card border-b px-5 py-4 flex items-center justify-between">
          <h2 className="font-display font-bold">{member.id ? "Modifier" : "Nouveau"} membre</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-muted"><X className="size-4" /></button>
        </div>
        <form className="p-5 space-y-3" onSubmit={async (e) => { e.preventDefault(); await onSave(form); }}>
          <div className="flex items-center gap-3">
            {form.photo_url ? <img src={form.photo_url} className="size-16 rounded-full object-cover border" /> :
              <div className="size-16 rounded-full bg-muted" />}
            <label className="flex-1 h-10 px-3 rounded-lg border bg-muted/30 text-sm flex items-center gap-2 cursor-pointer hover:bg-muted">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Téléverser photo
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" value={form.prenom} onChange={(v: string) => upd("prenom", v)} />
            <Field label="Nom" value={form.nom} onChange={(v: string) => upd("nom", v)} />
          </div>
          <Field label="Téléphone" value={form.telephone} onChange={(v: string) => upd("telephone", v)} />
          <Field label="Profession" value={form.profession} onChange={(v: string) => upd("profession", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Sexe" value={form.sexe} onChange={(v: string) => upd("sexe", v)} options={[["M","Masculin"],["F","Féminin"]]} />
            <Field label="Quartier" value={form.quartier} onChange={(v: string) => upd("quartier", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Formule" value={form.formule} onChange={(v: string) => upd("formule", v)} options={FORMULES.map((f) => [f, formatFcfa(FORMULE_VALUE[f])])} />
            <Select label="Statut" value={form.status} onChange={(v: string) => upd("status", v)} options={STATUSES.map((s) => [s, STATUS_LABEL[s]])} />
          </div>
          <button type="submit" className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold mt-2">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: any) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm" />
    </label>
  );
}
function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border bg-card text-sm">
        {options.map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
