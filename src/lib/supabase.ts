import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://nxwjkawsnjrebxzdkedl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_N3sGFMf59Kt2EKcrusYdDw_qfcoRiy5';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
