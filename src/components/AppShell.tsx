import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  MapPin,
  Bell,
  Settings,
  Search,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/munaf-logo.png";

const NAV = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/membres", label: "Membres", icon: Users },
  { to: "/cotisations", label: "Cotisations", icon: Wallet },
  { to: "/dossiers", label: "Dossiers décès", icon: FileText },
  { to: "/regions", label: "Régions & délégués", icon: MapPin },
  { to: "/verification", label: "Portail public", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-11 rounded-xl bg-white/95 p-1 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="MuNAF" className="size-full object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-tight">
              Mu<span className="text-gold">NAF</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Console Admin
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground text-xs">
          <div className="font-semibold text-gold mb-1">Données de démonstration</div>
          <p className="text-sidebar-foreground/70 leading-relaxed">
            1 000 membres fictifs. Sera remplacé à la connexion de Lovable Cloud.
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-10">
          <div className="lg:hidden size-9 rounded-lg bg-primary p-1 flex items-center justify-center">
            <img src={logo} alt="MuNAF" className="size-full object-contain" />
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Rechercher un membre, matricule, dossier…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:bg-card outline-none transition-colors"
            />
          </div>
          <button className="size-10 rounded-lg hover:bg-muted flex items-center justify-center relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-gold" />
          </button>
          <button className="size-10 rounded-lg hover:bg-muted hidden sm:flex items-center justify-center">
            <Settings className="size-4" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-tight">Super Admin</div>
              <div className="text-xs text-muted-foreground">MuNAF National</div>
            </div>
            <div className="size-9 rounded-full bg-gold-gradient text-primary font-bold flex items-center justify-center text-sm">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
