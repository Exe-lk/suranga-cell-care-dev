import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wkzdnwchsvrvucjpcqvh.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndremRud2Noc3ZydnVjanBjcXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODQ3NjAsImV4cCI6MjA2MTU2MDc2MH0.eLpRU_oejVxFtwp6N1ND1wxBnnERxbzfIjWMjS9ipR8";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

