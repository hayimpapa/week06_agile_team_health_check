import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a one-off Supabase client that injects the admin PIN header.
 * This lets the RLS policy on `responses` verify the PIN.
 */
export function supabaseWithPin(pin) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { 'x-admin-pin': pin },
    },
  });
}
