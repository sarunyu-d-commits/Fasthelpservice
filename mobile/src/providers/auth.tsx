import * as Linking from "expo-linking";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  isSupabaseConfigured,
  NOT_CONFIGURED,
  supabase,
} from "@/lib/supabase";
import type { Profile, Role } from "@/lib/types";

type AuthResult = { error?: string; message?: string };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
  }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (
    password: string,
    confirmPassword: string,
  ) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function translateAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "อีเมลนี้ถูกใช้สมัครแล้ว";
  }
  if (lower.includes("password should be at least")) {
    return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  }
  if (lower.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoading(false);
        if (data.session?.user) void loadProfile(data.session.user.id);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          void loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { error: translateAuthError(error.message) };
    return {};
  }, []);

  const signUp = useCallback(
    async (input: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      role: Role;
    }) => {
      if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
      if (!input.fullName.trim() || !input.email.trim() || !input.password) {
        return { error: "กรุณากรอกชื่อ อีเมล และรหัสผ่าน" };
      }
      if (input.password.length < 6) {
        return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
      }

      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: {
            full_name: input.fullName.trim(),
            phone: input.phone.trim(),
            role: input.role,
          },
          emailRedirectTo: Linking.createURL("auth/callback", {
            queryParams: {
              next: input.role === "provider" ? "/provider" : "/bookings",
            },
          }),
        },
      });

      if (error) return { error: translateAuthError(error.message) };
      if (!data.session) {
        return {
          message:
            "สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ",
        };
      }
      return {};
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await loadProfile(user.id);
  }, [loadProfile]);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL("auth/callback", {
        queryParams: { next: "/reset-password" },
      }),
    });
    if (error) return { error: translateAuthError(error.message) };
    return {
      message:
        "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว กรุณาตรวจสอบกล่องจดหมายหรือโฟลเดอร์สแปม",
    };
  }, []);

  const updatePassword = useCallback(
    async (password: string, confirmPassword: string) => {
      if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
      if (password.length < 6) {
        return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
      }
      if (password !== confirmPassword) {
        return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: translateAuthError(error.message) };
      return { message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      requestPasswordReset,
      updatePassword,
    }),
    [
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      requestPasswordReset,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
