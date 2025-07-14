import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ojjvnsnlxjvblmzqkutu.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qanZuc25seGp2YmxtenFrdXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTg3MDAsImV4cCI6MjA2MzkzNDcwMH0.JD-uxRuAF1EV5sBz1_NapPWmsKCvqk_-NEVPirnfTuA";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

