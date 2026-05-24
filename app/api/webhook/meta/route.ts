import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Detta är samma logik som /api/lead men anpassad för Meta
async function handleMetaLead(leadData: any) {
  const { full_name, phone_number, email, field_data } = leadData;

  // Extrahera fält från Meta (kan variera beroende på formulär)
  const projectDescription = field_data?.find((f: any) => 
    f.name.toLowerCase().includes('projekt') || 
    f.name.toLowerCase().includes('beskrivning')
  )?.values?.[0] || '';

  const service = field_data?.find((f: any) => 
    f.name.toLowerCase().includes('tjänst') || 
    f.name.toLowerCase().includes('arbete')
  )?.values?.[0] || 'Okänd tjänst';

  // Anropa din befintliga lead-hanterare
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: '00000000-0000-0000-0000-000000000000', // Ändra till rätt company_id
      customerName: full_name,
      phone: phone_number,
      email: email,
      service: service,
      projectDescription: projectDescription,
    }),
  });

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta skickar leads i "entry" array
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgen = change.value;
          
          // Hämta fullständig lead-data från Meta Graph API (rekommenderas)
          // För enkelhet använder vi här det som kommer i webhooken
          await handleMetaLead({
            full_name: leadgen.full_name,
            phone_number: leadgen.phone_number,
            email: leadgen.email,
            field_data: leadgen.field_data,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Meta Webhook Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// Meta kräver en GET för att verifiera webhooken
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return new NextResponse('Forbidden', { status: 403 });
}
