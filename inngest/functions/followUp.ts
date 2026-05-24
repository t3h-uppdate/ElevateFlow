import { inngest } from '../client';
import { supabase } from '@/lib/supabase';
import { Twilio } from 'twilio';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export const followUpFunction = inngest.createFunction(
  { id: 'lead-follow-up' },
  { event: 'lead/created' },
  async ({ event, step }) => {
    const { leadId } = event.data;

    // Vänta 4 timmar
    await step.sleep('wait-4h', '4h');

    // Hämta lead
    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (!lead) return;

    // Skicka uppföljning
    const message = `Hej ${lead.name}! Har du haft möjlighet att titta på offerten? Vi finns här om du har frågor.`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: lead.phone,
    });

    // Spara meddelande
    await supabase.from('messages').insert({
      lead_id: leadId,
      role: 'assistant',
      content: message,
    });
  }
);