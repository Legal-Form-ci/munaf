import { createFileRoute } from "@tanstack/react-router";
import {
  NSIA_CORS, jsonResponse, optionsResponse, requireNsiaKey, getAdmin, logNsiaEvent,
} from "@/lib/nsia-auth";

export const Route = createFileRoute("/api/public/nsia/dossiers")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),

      // GET /api/public/nsia/dossiers?status=transmis&limit=50&since=ISO
      GET: async ({ request }) => {
        const guard = requireNsiaKey(request); if (guard) return guard;
        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 500);
        const since = url.searchParams.get("since");

        const admin = await getAdmin();
        let q = (admin as any).from("dossiers")
          .select("id,numero,status,date_deces,montant_assistance,motif_rejet,created_at,updated_at,membres(matricule,nom,prenom,quartier,formule,telephone,association_id)")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (status) q = q.eq("status", status);
        if (since) q = q.gte("updated_at", since);
        const { data, error } = await q;
        if (error) return jsonResponse({ error: "db_error", message: error.message }, 500);
        await logNsiaEvent({ type: "api_list_dossiers", status: "success", message: `count=${data?.length ?? 0}` });
        return jsonResponse({ count: data?.length ?? 0, items: data ?? [] });
      },
    },
  },
});
