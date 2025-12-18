import { createClient } from '@supabase/supabase-js';

// Access environment variables safely by casting import.meta to any
// This resolves the TypeScript error: Property 'env' does not exist on type 'ImportMeta'
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || 'https://ixfiawsbekmxmqghsssh.supabase.co';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zmlhd3NiZWtteG1xZ2hzc3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MTAxMzIsImV4cCI6MjA4MTA4NjEzMn0.Sk3Zjj0pFfsoaU-XDSxjdqcPD7OKoDX5RDsFRCEbLsY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);