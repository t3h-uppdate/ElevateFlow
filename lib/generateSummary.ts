import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { supabase } from './supabase';
import { Twilio } from 'twilio';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function generateAndSendSummary(leadId: string) {
  // Hämta alla meddelanden + lead + företag
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      id,
      phone,
      companies (
        id,
        name,
        phone_number,
        services
      )
    `)
    .eq('id', leadId)
    .single();

  if (!lead) return;

  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('lead_id', leadId)
    .order('created_at');

  if (!messages || messages.length === 0) return;

  const conversation = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  // Hämta tjänster
  const services = (lead.companies as any)?.services || [];
  const servicesText = services.length > 0 
    ? `Företaget erbjuder följande tjänster: ${services.join(', ')}. Fokusera sammanfattningen på relevanta delar för dessa tjänster.`
    : '';

  // Generera sammanfattning med AI
  const { text: summary } = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt: `Sammanfatta följande kundkonversation kort och tydligt på svenska. ${servicesText}\n\nKonversation:\n${conversation}`,
    maxTokens: 300,
  });

  // Skicka sammanfattning till hantverkaren
  const companyPhone = (lead.companies as any)?.phone_number;

  await twilioClient.messages.create({
    body: `Sammanfattning av lead:\n\n${summary}`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: companyPhone || lead.phone,
  });

  return summary;
}
