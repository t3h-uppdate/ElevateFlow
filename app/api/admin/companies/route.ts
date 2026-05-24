import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: body.name,
      system_prompt: body.system_prompt || null,
      phone_number: body.phone_number || null,
      email: body.email || null,
      services: body.services || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
