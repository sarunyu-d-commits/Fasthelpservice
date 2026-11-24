"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AuthContext, Profile } from "@/lib/types";

const AuthStateContext = createContext<AuthContext | null>(null);

export function useAuth() {
  return useContext(AuthStateContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthContext | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    let active = true;

    async function loadProfile(userId: string, email?: string) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      setAuth({
        user: { id: userId, email },
        profile: (profile as Profile | null) ?? null,
      });
    }

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user || !active) return;
      void loadProfile(user.id, user.email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setAuth(null);
        return;
      }
      void loadProfile(user.id, user.email);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthStateContext.Provider value={auth}>{children}</AuthStateContext.Provider>
  );
}
