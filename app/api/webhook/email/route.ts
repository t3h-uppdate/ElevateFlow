import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fromEmail = body.from;
    const subject = body.subject;
    const emailBody = body.text || body.html;

    const { data: lead } = await supabase
      .from('leads')
      .select('id, company_id')
      .eq('email', fromEmail)
      .single();

    if (!lead) return NextResponse.json({ success: true });

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

    const { text: aiReply } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: `${systemPrompt}\n\nTidigare konversation:\n${history}`,
      prompt: `Kunden skrev:\n\n${emailBody}`,
      maxTokens: 400,
    });

    await supabase.from('messages').insert([
      { lead_id: lead.id, role: 'user', content: emailBody },
      { lead_id: lead.id, role: 'assistant', content: aiReply },
    ]);

    await resend.emails.send({
      from: `ElevateFlow <leads@elevate-systems.se>`,
      to: fromEmail,
      subject: `Re: ${subject}`,
      text: aiReply,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email Webhook Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
