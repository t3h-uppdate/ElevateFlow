import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { Twilio } from 'twilio';
import { supabase } from '@/lib/supabase';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;

    // Hitta lead
    const { data: lead } = await supabase
      .from('leads')
      .select('id, company_id')
      .eq('phone', from)
      .single();

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // Hämta historik + företag
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('lead_id', lead.id)
      .order('created_at');

    const { data: company } = await supabase
      .from('companies')
      .select('system_prompt, services, name')
      .eq('id', lead.company_id)
      .single();

    const history = messages?.map(m => `${m.role}: ${m.content}`).join('\n') || '';
    
    const servicesText = company?.services?.length 
      ? `Företaget erbjuder: ${company.services.join(', ')}.` 
      : '';

    const systemPrompt = company?.system_prompt || 
      `Du är en professionell assistent åt ${company?.name}. ${servicesText}`;

    // Generera svar
    const { text: aiReply } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: `${systemPrompt}\n\nTidigare konversation:\n${history}`,
      prompt: `Kunden svarade: "${body}"`,
      maxTokens: 300,
    });

    // Spara meddelanden
    await supabase.from('messages').insert([
      { lead_id: lead.id, role: 'user', content: body },
      { lead_id: lead.id, role: 'assistant', content: aiReply },
    ]);

    // Skicka svar
    await twilioClient.messages.create({
      body: aiReply,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: from,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SMS Webhook Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
