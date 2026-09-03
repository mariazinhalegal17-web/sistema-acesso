import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://klugtgontmtbzovljcvn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_o9-s0PEdfgQ3cgpSrWXu2A_Y8mfCOFt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);