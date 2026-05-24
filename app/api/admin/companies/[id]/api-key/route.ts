import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateApiKey } from '@/lib/apiKey';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  const newKey = generateApiKey();

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      company_id: companyId,
      key: newKey,
      name: 'Default API Key',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ apiKey: newKey });
}
