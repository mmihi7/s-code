
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Use the environment variables from the other client file for consistency
const supabaseUrl = "https://xgxalequiljxlgfyvaff.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneGFsZXF1aWxqeGxnZnl2YWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzgxMDEsImV4cCI6MjA2MDY1NDEwMX0.aV-3qhjXpNW0uOxZubzbb3b-WmUt1pqoqP5iTvvryDU";

// Create a properly typed Supabase client with the same configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
