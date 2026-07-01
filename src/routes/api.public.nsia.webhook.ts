import { createFileRoute } from "@tanstack/react-router";
import {
  jsonResponse, optionsResponse, requireNsiaKey, getAdmin, logNsiaEvent,
} from "@/lib/nsia-auth";

/**
 * Webhook entrant NSIA → MuNAF.
 * Body attendu :
 * {
 *   event: "dossier.validated" | "dossier.rejected" | "dossier.paid" | "dossier.note",
 *   dossier_id?: string,
 *   numero?: string,
 *   data?: { status?, motif_rejet?, montant_assistance?, reference_nsia? }
 * }
 */
export const Route = createFileRoute("/api/public/nsia/webhook")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      POST: async ({ request }) => {
        const guard = await requireNsiaKey(request); if (guard) return guard;
        let body: any = {};
        try { body = await request.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }
        const { event, dossier_id, numero, data } = body ?? {};
        if (!event) return jsonResponse({ error: "missing_event" }, 422);

        const admin = await getAdmin();

        // Résoudre le dossier
        let dossier: any = null;
        if (dossier_id) {
          const r = await (admin as any).from("dossiers").select("*").eq("id", dossier_id).maybeSingle();
          dossier = r.data;
        } else if (numero) {
          const r = await (admin as any).from("dossiers").select("*").eq("numero", numero).maybeSingle();
          dossier = r.data;
        }
        if (!dossier) {
          await logNsiaEvent({ type: event, status: "failed", message: "Dossier introuvable", payload: body });
          return jsonResponse({ error: "dossier_not_found" }, 404);
        }

        const map: Record<string, string | null> = {
          "dossier.validated": "valide",
          "dossier.rejected": "rejete",
          "dossier.paid": "assistance_versee",
          "dossier.note": null,
        };
        const newStatus = map[event];
        const patch: any = {};
        if (newStatus) patch.status = newStatus;
        if (data?.motif_rejet) patch.motif_rejet = data.motif_rejet;
        if (typeof data?.montant_assistance === "number") patch.montant_assistance = data.montant_assistance;

        if (Object.keys(patch).length > 0) {
          const u = await (admin as any).from("dossiers").update(patch).eq("id", dossier.id);
          if (u.error) {
            await logNsiaEvent({ type: event, dossier_id: dossier.id, status: "failed", message: u.error.message, payload: body });
            return jsonResponse({ error: "db_error", message: u.error.message }, 500);
          }
        }

        // Si versé, enregistrer un paiement traçable
        if (event === "dossier.paid") {
          await (admin as any).from("paiements_assistance").insert({
            dossier_id: dossier.id,
            type: "nsia_vers_munaf",
            montant: data?.montant_assistance ?? dossier.montant_assistance ?? 0,
            beneficiaire_nom: data?.beneficiaire ?? null,
            reference: data?.reference_nsia ?? `NSIA-${dossier.numero}`,
          });
        }

        await logNsiaEvent({
          type: event,
          dossier_id: dossier.id,
          status: "received",
          message: `Webhook ${event} traité`,
          payload: body,
        });

        return jsonResponse({ ok: true, dossier_id: dossier.id, applied: patch });
      },
    },
  },
});
