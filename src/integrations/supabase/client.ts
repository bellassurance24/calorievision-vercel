import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Fallback to empty strings so the app boots without crashing even if env vars
// are missing. The Supabase client will simply fail gracefully on any network
// calls (all of which have try/catch wrappers in standalone mode).
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  ''
);

if (import.meta.env.DEV) {
  if (!supabaseUrl) console.warn('[Supabase] VITE_SUPABASE_URL is not set — running in offline mode');
  if (!supabaseAnonKey) console.warn('[Supabase] VITE_SUPABASE_ANON_KEY is not set — running in offline mode');
  // Connection log removed — URL is non-sensitive but unnecessary in console
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Implicit flow: recovery emails redirect to /auth with tokens in the
      // URL hash (#access_token=...&type=recovery). Auth.tsx reads the hash,
      // calls setSession(), and fires PASSWORD_RECOVERY.
      // PKCE is NOT used: Gmail link-preview consumes the ?code= before the
      // user clicks, and the SPA loses the code_verifier on every navigation.
      flowType: 'implicit',
    },
  }
);
