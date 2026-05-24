import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const numMedia = parseInt(formData.get('NumMedia') as string || '0');

  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('phone', from)
    .single();

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  // Hantera bilder
  for (let i = 0; i < numMedia; i++) {
    const mediaUrl = formData.get(`MediaUrl${i}`) as string;
    const contentType = formData.get(`MediaContentType${i}`) as string;

    if (mediaUrl) {
      await supabase.from('lead_media').insert({
        lead_id: lead.id,
        media_url: mediaUrl,
        media_type: contentType,
      });

      // Spara också som meddelande
      await supabase.from('messages').insert({
        lead_id: lead.id,
        role: 'user',
        content: `[Bild skickad]`,
        media_url: mediaUrl,
      });
    }
  }

  return NextResponse.json({ success: true });
}
