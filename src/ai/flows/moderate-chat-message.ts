'use server';

/**
 * @fileOverview Implements content moderation for chat messages.
 *
 * - moderateChatMessage - A function that moderates the chat message.
 * - ModerateChatMessageInput - The input type for the moderateChatMessage function.
 * - ModerateChatMessageOutput - The return type for the moderateChatMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateChatMessageInputSchema = z.object({
  message: z.string().describe('The chat message to moderate.'),
});
export type ModerateChatMessageInput = z.infer<typeof ModerateChatMessageInputSchema>;

const ModerateChatMessageOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the message is safe or not.'),
  reason: z.string().optional().describe('The reason why the message is not safe.'),
});
export type ModerateChatMessageOutput = z.infer<typeof ModerateChatMessageOutputSchema>;

export async function moderateChatMessage(input: ModerateChatMessageInput): Promise<ModerateChatMessageOutput> {
  return moderateChatMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateChatMessagePrompt',
  input: {schema: ModerateChatMessageInputSchema},
  output: {schema: ModerateChatMessageOutputSchema},
  prompt: `You are a content moderation expert. Your job is to determine whether a given message is safe or not.

Message: {{{message}}}

Respond with a JSON object that contains:
- isSafe: true if the message is safe, false otherwise.
- reason: If the message is not safe, provide a brief explanation why. If the message is safe, this field should not be included in the response.
`,
});

const moderateChatMessageFlow = ai.defineFlow(
  {
    name: 'moderateChatMessageFlow',
    inputSchema: ModerateChatMessageInputSchema,
    outputSchema: ModerateChatMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
