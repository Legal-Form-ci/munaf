// Helpers serveur partagés par les endpoints /api/public/nsia/*
// Valide X-NSIA-API-Key contre la table nsia_api_keys (hash SHA-256).
// Retombe sur une clé démo (env NSIA_API_KEY) si aucune clé n'existe encore.

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

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function sha256Hex(input: string) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vérifie la clé fournie. Renvoie null si OK, sinon une Response 401/403. */
export async function requireNsiaKey(request: Request): Promise<Response | null> {
  const provided = request.headers.get("x-nsia-api-key") ?? "";
  if (!provided) {
    return jsonResponse(
      { error: "missing_api_key", message: "Header X-NSIA-API-Key requis." },
      401,
    );
  }

  // 1) Clé démo (env) : fallback sandbox / bootstrap.
  const demo = process.env.NSIA_API_KEY ?? DEMO_KEY;
  if (provided === demo) return null;

  // 2) Clé stockée en base (comparaison par hash).
  try {
    const admin = await getAdmin();
    const hash = await sha256Hex(provided);
    const { data } = await (admin as any)
      .from("nsia_api_keys")
      .select("id,active,revoked_at")
      .eq("key_hash", hash)
      .maybeSingle();
    if (data && data.active && !data.revoked_at) {
      // Mise à jour last_used_at best-effort (fire and forget).
      (admin as any).from("nsia_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", data.id)
        .then(() => {}, () => {});
      return null;
    }
  } catch {}

  return jsonResponse({ error: "invalid_api_key", message: "Clé API NSIA invalide ou révoquée." }, 403);
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
