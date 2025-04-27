import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ufpxciobfwuhpjkfnhvz.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcHhjaW9iZnd1aHBqa2ZuaHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzEzNjcsImV4cCI6MjA2MDQ0NzM2N30.e7yHOwQiuEqZXDJcYrDRCg2wB-83an_b2sXjRlZs_p4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);