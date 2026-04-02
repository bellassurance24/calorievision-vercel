import { createContext, useContext, useEffect, useRef, useState, PropsWithChildren } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SignInResult {
  error: Error | null;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      // Use RPC (SECURITY DEFINER) to bypass RLS timing issues
      const { data: hasAdminRole } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      return !!hasAdminRole;
    } catch (err) {
      console.error("Error in checkAdminRole:", err);
      return false;
    }
  };

  const isSigningInRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Listener for ongoing auth changes (does NOT control isLoading)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // CRITICAL: Skip auth state changes while signIn is in progress.
      if (isSigningInRef.current) return;

      // Only reset admin on explicit sign-out
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      // Only re-check admin role if we don't already have it confirmed
      if (session?.user) {
        // Don't downgrade isAdmin during async re-checks
        checkAdminRole(session.user.id).then((admin) => {
          if (isMounted && admin) setIsAdmin(true);
          // Never set isAdmin to false here — only SIGNED_OUT does that
        });
      }
    });

    // INITIAL load — controls isLoading
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const admin = await checkAdminRole(session.user.id);
          if (isMounted) setIsAdmin(admin);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    isSigningInRef.current = true;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error as Error, isAdmin: false };
      }

      const signedInUser = data.session?.user;
      if (!signedInUser) {
        return { error: new Error("No session returned"), isAdmin: false };
      }

      // Use the session returned directly by signInWithPassword (no extra getSession call)
      setSession(data.session);
      setUser(signedInUser);

      // Use RPC call to bypass RLS timing issues
      const { data: hasAdminRole } = await supabase.rpc("has_role", {
        _user_id: signedInUser.id,
        _role: "admin",
      });

      const admin = !!hasAdminRole;
      setIsAdmin(admin);
      return { error: null, isAdmin: admin };
    } finally {
      setIsLoading(false);
      // Delay resetting the guard so transient auth events (SIGNED_OUT → SIGNED_IN)
      // fired by Supabase after signIn are ignored and don't reset isAdmin.
      setTimeout(() => {
        isSigningInRef.current = false;
      }, 3000);
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
