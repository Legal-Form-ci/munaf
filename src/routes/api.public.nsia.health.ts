import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-NSIA-API-Key",
};

export const Route = createFileRoute("/api/public/nsia/health")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        return new Response(
          JSON.stringify({
            ok: true,
            service: "MuNAF NSIA Integration API",
            version: "1.0.0",
            environment: process.env.NODE_ENV ?? "production",
            time: new Date().toISOString(),
            docs: "/nsia-api",
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...cors } },
        );
      },
    },
  },
});
