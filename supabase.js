import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://klugtgontmtbzovljcvn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MfCpHxlZUeW_UiCBYDAmbw_SLoLhT1P';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);