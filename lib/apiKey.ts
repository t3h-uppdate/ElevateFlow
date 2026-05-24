import { supabase } from './supabase';
import { randomBytes } from 'crypto';

export async function validateApiKey(apiKey: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('api_key', apiKey)
    .single();

  if (error || !data) return null;
  return data.id;
}

export function generateApiKey() {
  // Generates a secure random API key prefixed with ef_
  return `ef_${randomBytes(24).toString('hex')}`;
}