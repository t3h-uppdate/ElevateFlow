import { supabase } from './supabase';
import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  return 'ef_' + randomBytes(24).toString('hex');
}

export async function validateApiKey(apiKey: string) {
  const { data } = await supabase
    .from('api_keys')
    .select('company_id')
    .eq('key', apiKey)
    .single();

  return data?.company_id || null;
}
