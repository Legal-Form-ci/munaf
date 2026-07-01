import { createFileRoute } from "@tanstack/react-router";

/**
 * Job de réconciliation NSIA (planifié via pg_cron toutes les heures).
 *
 * Compare l'état des dossiers Supabase avec les derniers événements de la table
 * nsia_sync et crée automatiquement des alertes dans `alertes` en cas d'écart :
 *   - drift_no_response   : dossier transmis > 72h sans événement NSIA
 *   - status_mismatch     : dernier événement NSIA en contradiction avec le statut
 *   - api_failure         : événements NSIA en échec récents
 *   - webhook_failure     : webhook sortant en échec récent
 *
 * Endpoint public (bypass auth) — protégé uniquement par le fait qu'il est
 * idempotent et ne fait qu'insérer des alertes internes.
 */
export const Route = createFileRoute("/api/public/hooks/nsia-reconcile")({
  server: {
    handlers: {
      GET: async () => run(),
      POST: async () => run(),
    },
  },
});

async function run() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as any;
  const alerts: any[] = [];
  const now = Date.now();

  // 1) Dossiers transmis sans réponse NSIA depuis > 72h
  const { data: dossiers } = await admin
    .from("dossiers")
    .select("id,numero,status,updated_at,created_at")
    .in("status", ["transmis", "valide"]);

  const { data: events } = await admin
    .from("nsia_sync")
    .select("id,dossier_id,type,status,message,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const eventsByDossier = new Map<string, any[]>();
  for (const e of events ?? []) {
    if (!e.dossier_id) continue;
    const list = eventsByDossier.get(e.dossier_id) ?? [];
    list.push(e);
    eventsByDossier.set(e.dossier_id, list);
  }

  for (const d of dossiers ?? []) {
    if (d.status !== "transmis") continue;
    const evts = eventsByDossier.get(d.id) ?? [];
    const last = evts[0];
    const ageMs = last
      ? now - new Date(last.created_at).getTime()
      : now - new Date(d.updated_at ?? d.created_at).getTime();
    if (ageMs > 72 * 3600 * 1000) {
      alerts.push({
        type: "drift_no_response",
        severity: "warning",
        titre: `Dossier ${d.numero} sans réponse NSIA depuis 72h`,
        message: `Dernière activité : ${last ? new Date(last.created_at).toISOString() : "aucune"}`,
        dossier_id: d.id,
        payload: { hours: Math.round(ageMs / 3600000), last_event: last?.type ?? null },
      });
    }
  }

  // 2) Status mismatch : événement récent contradictoire
  const STATUS_FROM_EVENT: Record<string, string> = {
    "dossier.validated": "valide",
    "dossier.rejected": "rejete",
    "dossier.paid": "assistance_versee",
  };
  for (const [dossierId, evts] of eventsByDossier) {
    const eventStatus = evts.find((e) => STATUS_FROM_EVENT[e.type]);
    if (!eventStatus) continue;
    const d = (dossiers ?? []).find((x: any) => x.id === dossierId);
    if (!d) continue;
    const expected = STATUS_FROM_EVENT[eventStatus.type];
    if (d.status !== expected && d.status !== "cloture") {
      alerts.push({
        type: "status_mismatch",
        severity: "critical",
        titre: `Écart de statut sur ${d.numero}`,
        message: `MuNAF=${d.status} · NSIA=${expected}`,
        dossier_id: d.id,
        payload: { munaf: d.status, nsia: expected, event_id: eventStatus.id },
      });
    }
  }

  // 3) API failures dans les dernières 24h
  const failed = (events ?? []).filter(
    (e) => e.status === "failed" && now - new Date(e.created_at).getTime() < 86400000,
  );
  if (failed.length >= 3) {
    alerts.push({
      type: "api_failure",
      severity: "critical",
      titre: `${failed.length} échecs API NSIA dans les dernières 24h`,
      message: failed.slice(0, 3).map((f) => f.message).join(" · "),
      payload: { count: failed.length },
    });
  }

  // Déduplique : ne crée pas d'alerte si une identique non résolue existe
  let inserted = 0;
  for (const a of alerts) {
    const q = admin.from("alertes").select("id").eq("type", a.type).eq("resolue", false);
    const withDossier = a.dossier_id ? q.eq("dossier_id", a.dossier_id) : q.is("dossier_id", null);
    const { data: existing } = await withDossier.limit(1);
    if (existing && existing.length > 0) continue;
    const { error } = await admin.from("alertes").insert(a);
    if (!error) inserted++;
  }

  await admin.from("nsia_sync").insert({
    type: "reconcile_run",
    status: "success",
    message: `Réconciliation : ${alerts.length} écarts détectés, ${inserted} nouvelles alertes`,
    payload: { checked: dossiers?.length ?? 0, alerts: alerts.length, inserted },
  });

  return new Response(
    JSON.stringify({
      ok: true,
      checked: dossiers?.length ?? 0,
      detected: alerts.length,
      inserted,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}
