
import { createClient } from '@supabase/supabase-js';

// Use the environment variables or hardcoded values if they are not available
// This is updated to use the values from src/integrations/supabase/client.ts
const supabaseUrl = "https://xgxalequiljxlgfyvaff.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneGFsZXF1aWxqeGxnZnl2YWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzgxMDEsImV4cCI6MjA2MDY1NDEwMX0.aV-3qhjXpNW0uOxZubzbb3b-WmUt1pqoqP5iTvvryDU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
