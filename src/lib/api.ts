import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const FORMULE_VALUE: Record<string, number> = {
  F100: 100000, F200: 200000, F300: 300000, F500: 500000, F1000: 1000000,
};
export const STATUS_LABEL: Record<string, string> = {
  actif: "Actif", carence: "En carence", suspendu: "Suspendu",
  expire: "Expiré", resilie: "Résilié", decede: "Décédé",
};
export const DOSSIER_LABEL: Record<string, string> = {
  declare: "Déclaré", verification: "Vérification", valide: "Validé",
  transmis: "Transmis", assistance_versee: "Assistance versée",
  cloture: "Clôturé", rejete: "Rejeté",
};
export const COT_LABEL: Record<string, string> = {
  payee: "Payée", en_attente: "En attente", en_retard: "En retard",
};

export const formatFcfa = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export function useMembers(filters?: { status?: string; quartier?: string; q?: string }) {
  return useQuery({
    queryKey: ["membres", filters],
    queryFn: async () => {
      let q = supabase.from("membres").select("*").order("created_at", { ascending: false }).limit(2000);
      if (filters?.status) q = q.eq("status", filters.status as any);
      if (filters?.quartier) q = q.eq("quartier", filters.quartier);
      if (filters?.q) q = q.or(`nom.ilike.%${filters.q}%,prenom.ilike.%${filters.q}%,matricule.ilike.%${filters.q}%,telephone.ilike.%${filters.q}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ["membre", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("membres").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [tot, actifs, carence, decedes, dossiers, cot] = await Promise.all([
        supabase.from("membres").select("id", { count: "exact", head: true }),
        supabase.from("membres").select("id", { count: "exact", head: true }).eq("status", "actif"),
        supabase.from("membres").select("id", { count: "exact", head: true }).eq("status", "carence"),
        supabase.from("membres").select("id", { count: "exact", head: true }).eq("status", "decede"),
        supabase.from("dossiers").select("id", { count: "exact", head: true }),
        supabase.from("cotisations").select("montant").eq("status", "payee"),
      ]);
      const total = tot.count ?? 0;
      const collecte = (cot.data ?? []).reduce((s, r: any) => s + (r.montant ?? 0), 0);
      return {
        total,
        actifs: actifs.count ?? 0,
        carence: carence.count ?? 0,
        decedes: decedes.count ?? 0,
        dossiers: dossiers.count ?? 0,
        collecte,
      };
    },
  });
}

export function useCotisations(membreId?: string) {
  return useQuery({
    queryKey: ["cotisations", membreId],
    queryFn: async () => {
      let q = supabase.from("cotisations").select("*, membres(nom,prenom,matricule,quartier)").order("mois", { ascending: false }).limit(500);
      if (membreId) q = q.eq("membre_id", membreId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useDossiers(status?: string) {
  return useQuery({
    queryKey: ["dossiers", status],
    queryFn: async () => {
      let q = supabase.from("dossiers").select("*, membres(nom,prenom,matricule,quartier,formule,photo_url)").order("created_at", { ascending: false });
      if (status) q = q.eq("status", status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useQuartiersStats() {
  return useQuery({
    queryKey: ["quartiers-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("membres").select("quartier,status");
      if (error) throw error;
      const map = new Map<string, { quartier: string; total: number; actifs: number; decedes: number }>();
      for (const m of data ?? []) {
        const k = (m as any).quartier as string;
        if (!map.has(k)) map.set(k, { quartier: k, total: 0, actifs: 0, decedes: 0 });
        const r = map.get(k)!;
        r.total++;
        if ((m as any).status === "actif") r.actifs++;
        if ((m as any).status === "decede") r.decedes++;
      }
      return Array.from(map.values()).sort((a, b) => b.total - a.total);
    },
  });
}

export function useUpsertMembre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase.from("membres").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const matricule = rest.matricule || `MNF-${Date.now().toString().slice(-5)}`;
        const { error } = await supabase.from("membres").insert({ ...rest, matricule });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["membres"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
  });
}

export function useDeleteMembre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("membres").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["membres"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
  });
}

export function useUpsertDossier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase.from("dossiers").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const numero = rest.numero || `DOS-${Date.now().toString().slice(-5)}`;
        const { error } = await supabase.from("dossiers").insert({ ...rest, numero });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dossiers"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
  });
}

export function useDeleteDossier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dossiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossiers"] }),
  });
}

export function useMarkCotisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; status: string }) => {
      const { error } = await supabase.from("cotisations").update({
        status: p.status as any,
        date_paiement: p.status === "payee" ? new Date().toISOString() : null,
      }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cotisations"] }),
  });
}

export async function uploadMemberPhoto(file: File, matricule: string) {
  const ext = file.name.split(".").pop();
  const path = `${matricule}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("member-photos").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadDossierDoc(file: File, dossierId: string) {
  const ext = file.name.split(".").pop();
  const path = `${dossierId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("dossier-documents").upload(path, file);
  if (error) throw error;
  await supabase.from("dossier_documents").insert({ dossier_id: dossierId, type: file.type, storage_path: path });
  return path;
}
