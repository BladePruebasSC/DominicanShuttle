import { createClient } from "@supabase/supabase-js";

let cached: ReturnType<typeof createClient<any>> | null = null;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) return null;

  if (!cached) {
    // Usamos <any> para no acoplar el server a tipos generados de Supabase.
    cached = createClient<any>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cached;
}

