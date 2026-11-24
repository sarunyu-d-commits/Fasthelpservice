"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AuthContext, Profile, Role } from "@/lib/types";

const AuthStateContext = createContext<AuthContext | null>(null);

export function useAuth() {
  return useContext(AuthStateContext);
}

function profileFromSession(session: Session | null): Profile {
  const user = session!.user;
  const meta = user.user_metadata ?? {};
  const role: Role =
    meta.role === "provider" || meta.role === "admin" ? meta.role : "customer";

  // ใช้ข้อมูลใน cookie ก่อน ไม่ต้องรอ query profile → header ไม่กระพริบ
  return {
    id: user.id,
    full_name: typeof meta.full_name === "string" ? meta.full_name : "",
    phone: typeof meta.phone === "string" ? meta.phone : null,
    role,
    avatar_url: null,
    created_at: user.created_at ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthContext | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    let active = true;

    function applySession(session: Session | null) {
      const user = session?.user;
      const id = ++requestId.current;

      if (!user) {
        setAuth(null);
        return;
      }

      setAuth({
        user: { id: user.id, email: user.email },
        profile: profileFromSession(session),
      });

      // เติมข้อมูลจริงจาก profiles ในพื้นหลัง
      void supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!active || requestId.current !== id || !data) return;
          setAuth({
            user: { id: user.id, email: user.email },
            profile: data as Profile,
          });
        });
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (active) applySession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) applySession(session);
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
