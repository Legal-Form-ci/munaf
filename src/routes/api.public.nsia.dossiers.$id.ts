import { createFileRoute } from "@tanstack/react-router";
import {
  jsonResponse, optionsResponse, requireNsiaKey, getAdmin, logNsiaEvent,
} from "@/lib/nsia-auth";

const ALLOWED_STATUS = new Set([
  "transmis", "valide", "rejete", "assistance_versee", "cloture",
]);

export const Route = createFileRoute("/api/public/nsia/dossiers/$id")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),

      GET: async ({ request, params }) => {
        const guard = await requireNsiaKey(request); if (guard) return guard;
        const admin = await getAdmin();
        const { data, error } = await (admin as any).from("dossiers")
          .select("*, membres(matricule,nom,prenom,quartier,formule,telephone,photo_url,association_id), dossier_documents(*)")
          .eq("id", params.id).maybeSingle();
        if (error) return jsonResponse({ error: "db_error", message: error.message }, 500);
        if (!data) return jsonResponse({ error: "not_found" }, 404);
        return jsonResponse(data);
      },

      // PATCH : { status, motif_rejet?, montant_assistance?, reference_nsia? }
      PATCH: async ({ request, params }) => {
        const guard = await requireNsiaKey(request); if (guard) return guard;
        let body: any = {};
        try { body = await request.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }
        const patch: any = {};
        if (body.status) {
          if (!ALLOWED_STATUS.has(body.status)) {
            return jsonResponse({ error: "invalid_status", allowed: [...ALLOWED_STATUS] }, 422);
          }
          patch.status = body.status;
        }
        if (typeof body.motif_rejet === "string") patch.motif_rejet = body.motif_rejet;
        if (typeof body.montant_assistance === "number") patch.montant_assistance = body.montant_assistance;
        if (Object.keys(patch).length === 0) {
          return jsonResponse({ error: "empty_patch", message: "Aucun champ à mettre à jour." }, 400);
        }

        const admin = await getAdmin();
        const { data, error } = await (admin as any).from("dossiers")
          .update(patch).eq("id", params.id).select().maybeSingle();
        if (error) return jsonResponse({ error: "db_error", message: error.message }, 500);
        if (!data) return jsonResponse({ error: "not_found" }, 404);

        await logNsiaEvent({
          type: `nsia_patch_${patch.status ?? "fields"}`,
          dossier_id: params.id,
          status: "success",
          message: `Mise à jour NSIA → ${patch.status ?? "fields"}`,
          payload: body,
        });

        return jsonResponse({ ok: true, dossier: data });
      },
    },
  },
});
