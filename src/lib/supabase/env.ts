export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase is optional at build/dev time so the site is always demoable with
 * placeholder content before a Supabase project is wired up. Callers should
 * check this before querying and fall back to placeholder data.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
