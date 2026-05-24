import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { Twilio } from 'twilio';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyId, service, customerName, phone, email, projectDescription } = body;

  // Hämta företag + tjänster
  const { data: company } = await supabase
    .from('companies')
    .select('name, system_prompt, services')
    .eq('id', companyId)
    .single();

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  // Bygg dynamisk prompt baserat på valda tjänster
  const servicesText = company.services && company.services.length > 0 
    ? `Företaget erbjuder följande tjänster: ${company.services.join(', ')}.`
    : '';

  const systemPrompt = company.system_prompt || 
    `Du är en professionell och vänlig assistent åt ${company.name}. ${servicesText} Var alltid kortfattad och hjälpsam.`;

  // Skapa lead
  const { data: lead } = await supabase
    .from('leads')
    .insert({
      company_id: companyId,
      name: customerName,
      phone,
      email,
      service,
      project_description: projectDescription,
      status: 'new',
    })
    .select()
    .single();

  // Generera AI-svar med dynamisk prompt
  const { text: aiMessage } = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    prompt: `Kund: ${customerName}\nTjänst: ${service}\nProjekt: ${projectDescription || ''}`,
    maxTokens: 300,
  });

  // Spara meddelande
  if (lead) {
    await supabase.from('messages').insert({
      lead_id: lead.id,
      role: 'assistant',
      content: aiMessage,
    });
  }

  // Skicka SMS
  if (phone) {
    await twilioClient.messages.create({
      body: aiMessage,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });
  }

  return NextResponse.json({ success: true, aiMessage });
}
