import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client using service role key.
 * Used for image uploads from admin API routes.
 * Service role bypasses RLS — only used server-side, never exposed to browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
