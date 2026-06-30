// Helpers serveur partagés par les endpoints /api/public/nsia/*
// Vérification de la clé API NSIA (header X-NSIA-API-Key)
// + helpers de réponse CORS / JSON.

const DEMO_KEY = "munaf-nsia-demo-key-2026";

export const NSIA_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-NSIA-API-Key, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...NSIA_CORS },
  });
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: NSIA_CORS });
}

/** Vérifie X-NSIA-API-Key. Renvoie null si OK, sinon une Response 401. */
export function requireNsiaKey(request: Request): Response | null {
  const provided = request.headers.get("x-nsia-api-key") ?? "";
  const expected = process.env.NSIA_API_KEY ?? DEMO_KEY;
  if (!provided) {
    return jsonResponse(
      { error: "missing_api_key", message: "Header X-NSIA-API-Key requis." },
      401,
    );
  }
  if (provided !== expected) {
    return jsonResponse(
      { error: "invalid_api_key", message: "Clé API NSIA invalide." },
      403,
    );
  }
  return null;
}

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Trace l'appel API entrant dans la table nsia_sync (best-effort). */
export async function logNsiaEvent(payload: {
  type: string;
  dossier_id?: string | null;
  status: "success" | "failed" | "received";
  message?: string;
  payload?: any;
}) {
  try {
    const admin = await getAdmin();
    await (admin as any).from("nsia_sync").insert(payload);
  } catch {}
}
