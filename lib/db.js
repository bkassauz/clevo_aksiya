import { createClient } from '@supabase/supabase-js';
export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
export const getSetting = async k => (await db.from('settings').select('value').eq('key', k).maybeSingle()).data?.value;
export const setSetting = (k, v) => db.from('settings').upsert({ key: k, value: v });
