import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard, Users, Wallet, FileText, MapPin, Bell, Search,
  ShieldCheck, Home, LogOut, Menu, Building2, Cable, ScrollText, Settings,
  KeyRound, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/munaf-logo.png";
import { useAuth, homeForRole } from "@/lib/auth";

const NAV_BASE = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin","super_admin","equipe"] },
  { to: "/admin/membres", label: "Membres", icon: Users, roles: ["admin","super_admin","equipe"] },
  { to: "/admin/cotisations", label: "Cotisations", icon: Wallet, roles: ["admin","super_admin","equipe"] },
  { to: "/admin/dossiers", label: "Dossiers décès", icon: FileText, roles: ["admin","super_admin","equipe"] },
  { to: "/admin/associations", label: "Associations", icon: Building2, roles: ["admin","super_admin"] },
  { to: "/admin/quartiers", label: "Quartiers & délégués", icon: MapPin, roles: ["admin","super_admin"] },
  { to: "/admin/nsia", label: "Intégration NSIA", icon: Cable, roles: ["admin","super_admin"] },
  { to: "/admin/nsia-integration", label: "API & Webhooks NSIA", icon: KeyRound, roles: ["super_admin"] },
  { to: "/admin/alertes", label: "Alertes", icon: AlertTriangle, roles: ["admin","super_admin","equipe"] },
  { to: "/admin/audit", label: "Journal d'audit", icon: ScrollText, roles: ["admin","super_admin"] },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings, roles: ["super_admin"] },
  { to: "/verification", label: "Portail public", icon: ShieldCheck, roles: ["admin","super_admin","equipe"] },
  { to: "/", label: "Site public", icon: Home, roles: ["admin","super_admin","equipe"] },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { session, role, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) { navigate({ to: "/connexion" }); return; }
    if (!pathname.startsWith("/admin")) return;
    if (!["admin","super_admin","equipe"].includes(role ?? "")) {
      navigate({ to: homeForRole(role) as any });
    }
  }, [loading, session, role, pathname, navigate]);

  const nav = NAV_BASE.filter((n) => n.roles.includes((role ?? "membre") as any));
  const roleLabel = role === "super_admin" ? "Super Admin" : role === "equipe" ? "Équipe" : "Admin";

  const handleSignOut = async () => { await signOut(); navigate({ to: "/connexion" }); };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`${mobileOpen ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground`}>
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <img src={logo} alt="MuNAF" className="size-12 object-contain" />
          <div>
            <div className="font-display font-bold text-lg leading-tight">Mu<span className="text-gold">NAF</span></div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Console {roleLabel}</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/admin" ? pathname === "/admin" : to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 mx-3 mb-3 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground text-xs">
          <div className="font-semibold text-gold mb-1">Zone pilote — Daloa</div>
          <p className="text-sidebar-foreground/70 leading-relaxed">Partenaire assureur : NSIA Assurances CI.</p>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center px-4 lg:px-8 gap-3 sticky top-0 z-10">
          <button className="lg:hidden size-10 rounded-lg hover:bg-muted flex items-center justify-center" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <img src={logo} alt="MuNAF" className="lg:hidden size-9 object-contain" />
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Rechercher un membre, matricule, dossier…" className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:bg-card outline-none" />
          </div>
          <div className="flex-1 sm:hidden" />
          <button className="size-10 rounded-lg hover:bg-muted flex items-center justify-center relative"><Bell className="size-4" /></button>
          <div className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l">
            <div className="size-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">{(session?.user.user_metadata?.username ?? "AD").slice(0, 2).toUpperCase()}</div>
            <div className="text-xs"><div className="font-semibold">{session?.user.user_metadata?.full_name ?? "Administrateur"}</div><div className="text-muted-foreground">{roleLabel}</div></div>
          </div>
          <button onClick={handleSignOut} className="size-10 rounded-lg hover:bg-muted flex items-center justify-center" title="Déconnexion"><LogOut className="size-4" /></button>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
