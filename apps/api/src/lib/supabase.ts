import { createClient } from "@supabase/supabase-js";

// Helper to extract Supabase URL from DATABASE_URL / DIRECT_URL if available
const getSupabaseUrlFallback = (): string | undefined => {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!dbUrl) return undefined;
  const match = dbUrl.match(/postgres\.([a-z0-9]+)[:@]/i);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  return undefined;
};

const supabaseUrl = process.env.SUPABASE_URL || getSupabaseUrlFallback();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ Supabase credentials (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY) are not fully configured in environment variables."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);
