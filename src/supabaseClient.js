import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Environment variables yoxlayın
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is missing from environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is missing from environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);