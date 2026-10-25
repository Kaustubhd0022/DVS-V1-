/**
 * Supabase Auth client. When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set the app
 * runs in local-only mode (projects live in localStorage, as before).
 *
 * The anon key is designed to be public; never put the service-role key in a VITE_* variable.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const authEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = authEnabled
  ? createClient(url as string, anonKey as string)
  : null;
