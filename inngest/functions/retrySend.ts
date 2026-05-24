import { inngest } from '../client';
import { Twilio } from 'twilio';
import { Resend } from 'resend';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export const retrySendMessage = inngest.createFunction(
  { 
    id: 'retry-send-message',
    retries: 3, // Automatisk retry upp till 3 gånger
  },
  { event: 'message/send' },
  async ({ event, step }) => {
    const { type, to, body, email } = event.data;

    try {
      if (type === 'sms') {
        await twilioClient.messages.create({
          body,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to,
        });
      } else if (type === 'email') {
        await resend.emails.send({
          from: 'ElevateFlow <leads@elevate-systems.se>',
          to: email,
          subject: 'Uppdatering från ElevateFlow',
          text: body,
        });
      }
    } catch (error) {
      console.error('Failed to send message, will retry:', error);
      throw error; // Detta triggar Inngest retry
    }
  }
);
