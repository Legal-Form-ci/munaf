import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & support — MuNAF" },
      { name: "description", content: "Joignez l'équipe MuNAF par téléphone, WhatsApp, e-mail ou directement à notre bureau de Daloa." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Page />
    </PublicLayout>
  ),
});

function Page() {
  return (
    <>
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Contact & support</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">Nous sommes à votre écoute.</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          {[
            { icon: MapPin, t: "Bureau MuNAF Daloa", d: "Quartier Commerce, face à la mairie\nBP 421 — Daloa, Côte d'Ivoire" },
            { icon: Phone, t: "Standard", d: "+225 27 32 78 00 00\nLun – Sam · 8h – 18h" },
            { icon: MessageCircle, t: "WhatsApp", d: "+225 07 00 00 00 00\nRéponse en moins d'une heure" },
            { icon: Mail, t: "E-mail", d: "contact@munaf.ci\nsupport@munaf.ci" },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border bg-card p-5 flex gap-4">
              <div className="size-11 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <c.icon className="size-5" />
              </div>
              <div>
                <div className="font-display font-bold">{c.t}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line mt-1">{c.d}</div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Démo — message non envoyé. À connecter à Lovable Cloud.");
          }}
          className="rounded-2xl border bg-card p-6 space-y-4"
        >
          <h2 className="font-display font-bold text-xl">Écrivez-nous</h2>
          {[
            { id: "nom", label: "Nom complet", type: "text" },
            { id: "tel", label: "Téléphone", type: "tel", placeholder: "+225 …" },
            { id: "email", label: "E-mail", type: "email" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium mb-1.5">{f.label}</label>
              <input
                id={f.id}
                type={f.type}
                placeholder={f.placeholder}
                className="w-full h-11 px-3 rounded-lg border bg-background focus:border-ring outline-none"
              />
            </div>
          ))}
          <div>
            <label htmlFor="msg" className="block text-sm font-medium mb-1.5">Message</label>
            <textarea
              id="msg"
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg border bg-background focus:border-ring outline-none resize-none"
            />
          </div>
          <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            Envoyer le message
          </button>
        </form>
      </section>
    </>
  );
}
