import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "super_admin" | "admin" | "delegue" | "association" | "nsia" | "equipe" | "membre";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  role: Role | null;
  roles: Role[];
  loading: boolean;
  signInUsername: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const usernameToEmail = (u: string) =>
  `${u.replace(/^@/, "").toLowerCase().trim()}@munaf.local`;

const ORDER: Role[] = ["super_admin", "admin", "nsia", "delegue", "association", "equipe", "membre"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async (uid: string | undefined) => {
    if (!uid) { setRoles([]); setRole(null); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const rs = ((data ?? []).map((r: any) => r.role)) as Role[];
    setRoles(rs);
    const top = ORDER.find((r) => rs.includes(r)) ?? "membre";
    setRole(top);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      refreshRole(data.session?.user.id).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      refreshRole(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInUsername: AuthCtx["signInUsername"] = async (username, password) => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Identifiants invalides" };
    return {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, role, roles, loading, signInUsername, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}

export function homeForRole(r: Role | null): string {
  switch (r) {
    case "super_admin":
    case "admin":
    case "equipe":
      return "/admin";
    case "nsia": return "/nsia";
    case "delegue": return "/delegue";
    case "association": return "/association";
    default: return "/membre";
  }
}
