import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "delegue" | "membre";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  role: Role | null;
  loading: boolean;
  signInUsername: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const usernameToEmail = (u: string) =>
  `${u.replace(/^@/, "").toLowerCase().trim()}@munaf.local`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async (uid: string | undefined) => {
    if (!uid) return setRole(null);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const roles = (data ?? []).map((r) => r.role as Role);
    if (roles.includes("admin")) setRole("admin");
    else if (roles.includes("delegue")) setRole("delegue");
    else setRole("membre");
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, role, loading, signInUsername, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}
