import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { useState } from "react";
import { Copy, Check, Terminal, Shield, Webhook, Plug, BookOpen } from "lucide-react";

export const Route = createFileRoute("/nsia-api")({
  head: () => ({ meta: [
    { title: "API d'intégration NSIA — MuNAF" },
    { name: "description", content: "Documentation développeur de l'API REST MuNAF pour les équipes NSIA Assurances : authentification, dossiers de décès, webhooks bidirectionnels." },
  ] }),
  component: () => <PublicLayout><Page /></PublicLayout>,
});

const BASE = typeof window !== "undefined" ? window.location.origin : "https://munaf.ci";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition opacity-0 group-hover:opacity-100"
      >{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</button>
      <pre className="bg-[#0e1633] text-[#e2e8f0] text-xs overflow-x-auto p-4 rounded-xl border border-white/5 font-mono leading-relaxed">
        <code className={`lang-${lang}`}>{code}</code>
      </pre>
    </div>
  );
}

function Section({ id, title, children }: any) {
  return <section id={id} className="scroll-mt-24 space-y-4 py-8 border-b last:border-0">
    <h2 className="font-display text-2xl font-bold text-primary">{title}</h2>
    <div className="prose prose-sm max-w-none text-foreground/80">{children}</div>
  </section>;
}

function Endpoint({ method, path, desc }: any) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-700",
    POST: "bg-blue-100 text-blue-700",
    PATCH: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg border bg-card">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors[method] ?? "bg-muted"}`}>{method}</span>
      <code className="text-xs font-mono">{path}</code>
      <span className="text-xs text-muted-foreground ml-auto">{desc}</span>
    </div>
  );
}

function Page() {
  return (
    <div className="bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-[#0e1633] text-primary-foreground p-8 md:p-12 mb-10">
          <div className="text-xs uppercase tracking-wider font-bold text-gold flex items-center gap-2">
            <Plug className="size-4" /> Documentation développeur · v1.0
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-3">API d'intégration <span className="text-gold">NSIA × MuNAF</span></h1>
          <p className="text-white/80 mt-4 max-w-3xl">
            API REST simple, sécurisée et indépendante du langage. Les équipes NSIA peuvent intégrer MuNAF
            depuis n'importe quelle stack (Node, Python, Java, .NET, PHP, Go…) en quelques heures.
            Authentification par clé API, format JSON, CORS activé, webhooks bidirectionnels.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3"><div className="text-gold font-bold text-xs">Base URL</div><code className="text-xs">{BASE}/api/public/nsia</code></div>
            <div className="bg-white/10 rounded-lg p-3"><div className="text-gold font-bold text-xs">Auth header</div><code className="text-xs">X-NSIA-API-Key</code></div>
            <div className="bg-white/10 rounded-lg p-3"><div className="text-gold font-bold text-xs">Format</div><code className="text-xs">application/json · UTF-8</code></div>
          </div>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-10">
          <aside className="hidden md:block sticky top-24 self-start space-y-1 text-sm">
            {[
              ["overview", "Vue d'ensemble", BookOpen],
              ["auth", "Authentification", Shield],
              ["endpoints", "Endpoints", Terminal],
              ["webhooks", "Webhooks entrants", Webhook],
              ["examples", "Exemples par langage", Plug],
              ["errors", "Codes d'erreur", Shield],
            ].map(([id, l, Icon]: any) => (
              <a key={id} href={`#${id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-foreground/70 hover:text-primary"><Icon className="size-3.5" />{l}</a>
            ))}
          </aside>

          <div className="min-w-0">
            <Section id="overview" title="Vue d'ensemble">
              <p>L'API MuNAF expose les dossiers de décès et les flux de synchronisation côté NSIA. Tous les
              échanges sont journalisés dans la table <code>nsia_sync</code>, consultable côté Admin MuNAF
              pour audit et détection d'écarts.</p>
              <ul>
                <li><strong>Lecture</strong> : récupérer la liste filtrée des dossiers, lire un dossier en détail.</li>
                <li><strong>Écriture</strong> : valider, rejeter, marquer comme versé (PATCH ou webhook).</li>
                <li><strong>Bidirectionnel</strong> : MuNAF transmet → NSIA traite → NSIA notifie via webhook → MuNAF clôt automatiquement.</li>
              </ul>
            </Section>

            <Section id="auth" title="Authentification">
              <p>Toutes les requêtes doivent inclure l'en-tête <code>X-NSIA-API-Key</code>. La clé est
              fournie par l'équipe MuNAF lors de l'onboarding NSIA et rotative à la demande.</p>
              <CodeBlock code={`curl ${BASE}/api/public/nsia/health \\
  -H "X-NSIA-API-Key: <votre_clé_NSIA>"`} />
              <p className="text-xs text-muted-foreground">Une clé de démonstration est disponible en environnement sandbox : <code>munaf-nsia-demo-key-2026</code>.</p>
            </Section>

            <Section id="endpoints" title="Endpoints REST">
              <div className="space-y-2 not-prose">
                <Endpoint method="GET" path="/api/public/nsia/health" desc="Statut & version" />
                <Endpoint method="GET" path="/api/public/nsia/dossiers" desc="Liste filtrable des dossiers" />
                <Endpoint method="GET" path="/api/public/nsia/dossiers/{id}" desc="Détail + documents joints" />
                <Endpoint method="PATCH" path="/api/public/nsia/dossiers/{id}" desc="Mise à jour de statut" />
                <Endpoint method="POST" path="/api/public/nsia/webhook" desc="Notifications NSIA → MuNAF" />
              </div>
              <h3 className="mt-6">Lister les dossiers</h3>
              <CodeBlock code={`GET ${BASE}/api/public/nsia/dossiers?status=transmis&limit=50&since=2026-01-01T00:00:00Z`} />
              <p>Paramètres : <code>status</code>, <code>limit</code> (1-500), <code>since</code> (ISO 8601).</p>

              <h3 className="mt-6">Mettre à jour un dossier (valider / rejeter / verser)</h3>
              <CodeBlock code={`PATCH ${BASE}/api/public/nsia/dossiers/{id}
Content-Type: application/json
X-NSIA-API-Key: <votre_clé>

{
  "status": "assistance_versee",
  "montant_assistance": 500000,
  "reference_nsia": "NSIA-CI-2026-01234"
}`} />
              <p>Statuts autorisés : <code>transmis</code>, <code>valide</code>, <code>rejete</code>, <code>assistance_versee</code>, <code>cloture</code>.</p>
            </Section>

            <Section id="webhooks" title="Webhooks entrants (NSIA → MuNAF)">
              <p>Le webhook unique permet à NSIA de pousser tout événement métier sans gérer plusieurs endpoints.</p>
              <CodeBlock code={`POST ${BASE}/api/public/nsia/webhook
X-NSIA-API-Key: <votre_clé>
Content-Type: application/json

{
  "event": "dossier.paid",
  "numero": "DOS-12345",
  "data": {
    "montant_assistance": 500000,
    "reference_nsia": "NSIA-CI-2026-01234",
    "beneficiaire": "Association Lobia"
  }
}`} />
              <p>Événements supportés : <code>dossier.validated</code>, <code>dossier.rejected</code>, <code>dossier.paid</code>, <code>dossier.note</code>.</p>
            </Section>

            <Section id="examples" title="Exemples par langage">
              <h3>Node.js / TypeScript</h3>
              <CodeBlock lang="ts" code={`const res = await fetch("${BASE}/api/public/nsia/dossiers?status=transmis", {
  headers: { "X-NSIA-API-Key": process.env.MUNAF_KEY! }
});
const { items } = await res.json();`} />
              <h3>Python</h3>
              <CodeBlock lang="python" code={`import requests, os
r = requests.get(
  "${BASE}/api/public/nsia/dossiers",
  params={"status": "transmis"},
  headers={"X-NSIA-API-Key": os.environ["MUNAF_KEY"]},
)
print(r.json()["count"], "dossiers à traiter")`} />
              <h3>PHP</h3>
              <CodeBlock lang="php" code={`<?php
$ch = curl_init("${BASE}/api/public/nsia/dossiers/$id");
curl_setopt_array($ch, [
  CURLOPT_CUSTOMREQUEST => "PATCH",
  CURLOPT_POSTFIELDS    => json_encode(["status" => "valide"]),
  CURLOPT_HTTPHEADER    => ["Content-Type: application/json", "X-NSIA-API-Key: $key"],
  CURLOPT_RETURNTRANSFER=> true,
]);
echo curl_exec($ch);`} />
              <h3>Java (HttpClient)</h3>
              <CodeBlock lang="java" code={`var req = HttpRequest.newBuilder()
  .uri(URI.create("${BASE}/api/public/nsia/dossiers/" + id))
  .header("X-NSIA-API-Key", key)
  .header("Content-Type", "application/json")
  .method("PATCH", HttpRequest.BodyPublishers.ofString("{\\"status\\":\\"valide\\"}"))
  .build();
HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());`} />
            </Section>

            <Section id="errors" title="Codes d'erreur">
              <table className="w-full text-sm not-prose">
                <thead><tr className="text-left border-b"><th className="py-2">Code</th><th>error</th><th>Description</th></tr></thead>
                <tbody className="divide-y">
                  <tr><td className="py-2 font-mono">401</td><td><code>missing_api_key</code></td><td>Header X-NSIA-API-Key absent.</td></tr>
                  <tr><td className="py-2 font-mono">403</td><td><code>invalid_api_key</code></td><td>Clé fournie incorrecte.</td></tr>
                  <tr><td className="py-2 font-mono">404</td><td><code>not_found</code></td><td>Dossier inexistant.</td></tr>
                  <tr><td className="py-2 font-mono">422</td><td><code>invalid_status</code></td><td>Statut non autorisé.</td></tr>
                  <tr><td className="py-2 font-mono">500</td><td><code>db_error</code></td><td>Erreur côté base — réessayer ou contacter MuNAF.</td></tr>
                </tbody>
              </table>
              <p className="mt-6 text-sm">Support intégration : <a href="mailto:dev@munaf.ci" className="text-primary underline">dev@munaf.ci</a></p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
