import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard, Users, Wallet, FileText, MapPin, Bell, Search,
  ShieldCheck, Home, LogOut, Menu,
} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/munaf-logo.png";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/membres", label: "Membres", icon: Users },
  { to: "/admin/cotisations", label: "Cotisations", icon: Wallet },
  { to: "/admin/dossiers", label: "Dossiers décès", icon: FileText },
  { to: "/admin/quartiers", label: "Quartiers & délégués", icon: MapPin },
  { to: "/verification", label: "Portail public", icon: ShieldCheck },
  { to: "/", label: "Site public", icon: Home },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { session, role, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!session || (role !== "admin" && pathname.startsWith("/admin")))) {
      navigate({ to: "/connexion" });
    }
  }, [loading, session, role, pathname, navigate]);

  const initials = (session?.user.user_metadata?.username ?? "AD").slice(0, 2).toUpperCase();
  const fullName = session?.user.user_metadata?.full_name ?? "Administrateur";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/connexion" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${mobileOpen ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground`}>
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <img src={logo} alt="MuNAF" className="size-12 object-contain" />
          <div>
            <div className="font-display font-bold text-lg leading-tight">Mu<span className="text-gold">NAF</span></div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Console {role === "admin" ? "Admin" : role === "delegue" ? "Délégué" : "Membre"}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/admin" ? pathname === "/admin"
              : to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                         : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mx-3 mb-3 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground text-xs">
          <div className="font-semibold text-gold mb-1">Zone pilote — Daloa</div>
          <p className="text-sidebar-foreground/70 leading-relaxed">
            Plateforme connectée à la base de données MuNAF.
          </p>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center px-4 lg:px-8 gap-3 sticky top-0 z-10">
          <button className="lg:hidden size-10 rounded-lg hover:bg-muted flex items-center justify-center" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
          <img src={logo} alt="MuNAF" className="lg:hidden size-9 object-contain" />
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Rechercher un membre, matricule, dossier…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:bg-card outline-none"
            />
          </div>
          <div className="flex-1 sm:hidden" />
          <button className="size-10 rounded-lg hover:bg-muted flex items-center justify-center relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-gold" />
          </button>
          <button
            onClick={handleSignOut}
            className="size-10 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"
            title="Se déconnecter"
          >
            <LogOut className="size-4" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-tight">{fullName}</div>
              <div className="text-xs text-muted-foreground capitalize">{role ?? "—"}</div>
            </div>
            <div className="size-9 rounded-full bg-gold-gradient text-primary font-bold flex items-center justify-center text-sm">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
