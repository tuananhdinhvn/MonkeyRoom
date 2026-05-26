import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkyjbonuahvpgkknzchh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWpib251YWh2cGdra256Y2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzkzMTksImV4cCI6MjA5MzIxNTMxOX0.6oaleTXCvAoSpwtOWvslZt28g0BaCO3oJCNy0Lmg5gw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
