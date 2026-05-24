import { inngest } from '../client';
import { generateAndSendSummary } from '@/lib/generateSummary';

export const sendConversationSummary = inngest.createFunction(
  { id: 'send-conversation-summary' },
  { event: 'conversation/ended' },
  async ({ event, step }) => {
    const { leadId } = event.data;

    await step.run('generate-summary', async () => {
      await generateAndSendSummary(leadId);
    });
  }
);
