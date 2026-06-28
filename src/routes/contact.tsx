import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Phone, Mail, MapPin, MessageCircle, Building2, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & support — MuNAF" },
      { name: "description", content: "Joignez l'équipe MuNAF par téléphone, WhatsApp, e-mail ou directement à notre bureau de Daloa. Support 6j/7." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Page />
    </PublicLayout>
  ),
});

const SUJETS = [
  "Adhésion individuelle",
  "Adhésion association / mutuelle",
  "Devenir délégué",
  "Question sur une cotisation",
  "Déclaration de décès",
  "Intégration NSIA",
  "Autre",
] as const;

const ContactSchema = z.object({
  nom: z.string().trim().min(2, "Nom trop court").max(120),
  telephone: z.string().trim().min(6, "Téléphone invalide").max(30),
  email: z.string().trim().max(200).email("Email invalide").optional().or(z.literal("")),
  sujet: z.enum(SUJETS),
  message: z.string().trim().min(5, "Message trop court").max(2000),
});

function Page() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      nom: String(fd.get("nom") || ""),
      telephone: String(fd.get("telephone") || ""),
      email: String(fd.get("email") || ""),
      sujet: String(fd.get("sujet") || "") as (typeof SUJETS)[number],
      message: String(fd.get("message") || ""),
    };
    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      nom: parsed.data.nom,
      telephone: parsed.data.telephone,
      email: parsed.data.email ? parsed.data.email : null,
      sujet: parsed.data.sujet,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Envoi impossible. Réessayez ou appelez-nous.");
      return;
    }
    toast.success("Message envoyé. Notre équipe vous recontacte sous 24 h.");
    setSent(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <>
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Contact & support</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">Nous sommes à votre écoute.</h1>
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            Particulier, association ou délégué : notre équipe de Daloa vous accompagne dans toutes vos
            démarches.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          {[
            { icon: MapPin, t: "Bureau MuNAF Daloa", d: "Quartier Commerce, face à la mairie\nBP 421 — Daloa, Côte d'Ivoire" },
            { icon: Phone, t: "Standard téléphonique", d: "+225 27 32 78 00 00\nLun – Sam · 8h – 18h" },
            { icon: MessageCircle, t: "WhatsApp Business", d: "+225 07 00 00 00 00\nRéponse en moins d'une heure" },
            { icon: Mail, t: "E-mail", d: "contact@munaf.ci\nsupport@munaf.ci" },
            { icon: Building2, t: "Partenaire assureur", d: "NSIA Assurances Côte d'Ivoire\nPour toute question sur le versement d'une assistance, MuNAF reste votre interlocuteur unique." },
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

        {sent ? (
          <div className="rounded-2xl border-2 border-success/40 bg-success/5 p-8 text-center h-fit">
            <div className="size-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="font-display font-bold text-xl">Message bien reçu</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Notre équipe vous recontacte sous 24 h au numéro indiqué. Pour une demande urgente, appelez
              directement le +225 27 32 78 00 00.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 px-5 py-2.5 rounded-lg border bg-card hover:bg-muted text-sm font-medium"
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 space-y-4 h-fit">
            <h2 className="font-display font-bold text-xl">Écrivez-nous</h2>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium mb-1.5">Nom complet</label>
              <input id="nom" name="nom" required maxLength={120} className="w-full h-11 px-3 rounded-lg border bg-background focus:border-ring outline-none" />
            </div>
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium mb-1.5">Téléphone (Mobile Money)</label>
              <input id="telephone" name="telephone" type="tel" required maxLength={30} placeholder="+225 …" className="w-full h-11 px-3 rounded-lg border bg-background focus:border-ring outline-none" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">E-mail (optionnel)</label>
              <input id="email" name="email" type="email" maxLength={200} className="w-full h-11 px-3 rounded-lg border bg-background focus:border-ring outline-none" />
            </div>
            <div>
              <label htmlFor="sujet" className="block text-sm font-medium mb-1.5">Sujet</label>
              <select id="sujet" name="sujet" required defaultValue={SUJETS[0]} className="w-full h-11 px-3 rounded-lg border bg-background focus:border-ring outline-none">
                {SUJETS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="msg" className="block text-sm font-medium mb-1.5">Message</label>
              <textarea id="msg" name="message" required minLength={5} maxLength={2000} rows={5} className="w-full px-3 py-2.5 rounded-lg border bg-background focus:border-ring outline-none resize-none" />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Envoi en cours…" : "Envoyer le message"}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              En envoyant ce formulaire, vous acceptez d'être recontacté par l'équipe MuNAF.
            </p>
          </form>
        )}
      </section>
    </>
  );
}
