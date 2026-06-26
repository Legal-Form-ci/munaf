import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Menu, X, Phone, Mail, MapPin, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/munaf-logo.png";

const PUBLIC_NAV = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/formules", label: "Formules" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top utility bar with key actions in gold */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-9 flex items-center justify-between gap-3">
          <div className="hidden md:flex items-center gap-5 text-white/75">
            <span className="flex items-center gap-1.5"><MapPin className="size-3" /> Daloa, Côte d'Ivoire</span>
            <span className="flex items-center gap-1.5"><Phone className="size-3" /> +225 27 32 78 00 00</span>
            <span className="hidden lg:flex items-center gap-1.5"><Mail className="size-3" /> contact@munaf.ci</span>
          </div>
          <div className="md:hidden text-white/75 flex items-center gap-1.5">
            <MapPin className="size-3" /> Daloa
          </div>
          <div className="flex items-center gap-1 md:gap-3 text-[11px] md:text-xs font-semibold">
            <Link to="/verification" className="flex items-center gap-1 text-gold hover:text-gold/80">
              <ShieldCheck className="size-3.5" /><span className="hidden sm:inline">Vérifier un membre</span><span className="sm:hidden">Vérifier</span>
            </Link>
            <span className="text-white/30">·</span>
            <Link to="/formules" className="flex items-center gap-1 text-gold hover:text-gold/80">
              <UserPlus className="size-3.5" /><span className="hidden sm:inline">Devenir membre</span><span className="sm:hidden">Adhérer</span>
            </Link>
            <span className="text-white/30">·</span>
            <Link to="/connexion" className="flex items-center gap-1 text-gold hover:text-gold/80">
              <LogIn className="size-3.5" /><span className="hidden sm:inline">Espace membre</span><span className="sm:hidden">Connexion</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Header — uncluttered: only navigational links */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="MuNAF" className="size-10 object-contain" />
            <div className="leading-tight">
              <div className="font-display font-bold text-lg">
                Mu<span className="text-gold">NAF</span>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground hidden sm:block">
                Mutuelle Numérique d'Assistance Familiale
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_NAV.map((l) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "text-primary bg-accent" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="lg:hidden size-10 rounded-lg hover:bg-muted flex items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t bg-background">
            <nav className="flex flex-col p-3 gap-1">
              {PUBLIC_NAV.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-sidebar text-sidebar-foreground mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="" className="size-9 object-contain" />
              <div className="font-display font-bold text-lg">Mu<span className="text-gold">NAF</span></div>
            </div>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              Parce qu'un décès ne devrait jamais ruiner une famille. Zone pilote : Daloa, Haut-Sassandra.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Plateforme</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link to="/a-propos" className="hover:text-gold">À propos</Link></li>
              <li><Link to="/comment-ca-marche" className="hover:text-gold">Comment ça marche</Link></li>
              <li><Link to="/formules" className="hover:text-gold">Formules</Link></li>
              <li><Link to="/verification" className="hover:text-gold">Vérifier un membre</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Espaces</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link to="/connexion" className="hover:text-gold">Espace membre</Link></li>
              <li><Link to="/connexion" className="hover:text-gold">Espace délégué</Link></li>
              <li><Link to="/connexion" className="hover:text-gold">Back-office admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li className="flex items-start gap-2"><MapPin className="size-3.5 mt-0.5 shrink-0" /> Quartier Commerce, Daloa</li>
              <li className="flex items-start gap-2"><Phone className="size-3.5 mt-0.5 shrink-0" /> +225 27 32 78 00 00</li>
              <li className="flex items-start gap-2"><Mail className="size-3.5 mt-0.5 shrink-0" /> contact@munaf.ci</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-sidebar-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-sidebar-foreground/50">
            <div>© 2026 MuNAF — Mutuelle Numérique d'Assistance Familiale</div>
            <div>Zone pilote Daloa · Haut-Sassandra</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
