'use server';
/**
 * @fileOverview This file implements a Genkit flow for detecting suspicious behavior indicative of a minor's presence on the platform.
 *
 * - detectSuspectedMinor - A function that takes user data and message content as input and returns a determination of whether the user is suspected to be a minor.
 * - DetectSuspectedMinorInput - The input type for the detectSuspectedMinor function.
 * - DetectSuspectedMinorOutput - The return type for the detectSuspectedMinor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectSuspectedMinorInputSchema = z.object({
  userData: z
    .string()
    .describe('User data including profile information and chat history.'),
  messageContent: z
    .string()
    .describe('The content of the user messages to be analyzed.'),
});
export type DetectSuspectedMinorInput = z.infer<typeof DetectSuspectedMinorInputSchema>;

const DetectSuspectedMinorOutputSchema = z.object({
  isSuspectedMinor: z
    .boolean()
    .describe(
      'A boolean value indicating whether the user is suspected of being a minor based on the analysis of their data and message content.'
    ),
  reason: z
    .string()
    .describe(
      'A string explaining the reason why the user is suspected of being a minor. This field should provide details about the specific data or content that triggered the suspicion.'
    ),
});
export type DetectSuspectedMinorOutput = z.infer<typeof DetectSuspectedMinorOutputSchema>;

export async function detectSuspectedMinor(input: DetectSuspectedMinorInput): Promise<DetectSuspectedMinorOutput> {
  return detectSuspectedMinorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSuspectedMinorPrompt',
  input: {schema: DetectSuspectedMinorInputSchema},
  output: {schema: DetectSuspectedMinorOutputSchema},
  prompt: `You are an AI agent specializing in detecting potential minors on a chat platform.

  You are provided with user data and recent message content. Analyze this information to determine if there is a reasonable suspicion that the user is a minor.

  Consider factors such as:
  - Mentions of age or grade level
  - Use of language or slang common among minors
  - Discussions about activities or interests typical of minors
  - Any inconsistencies between profile information and chat content

  Based on your analysis, determine the isSuspectedMinor boolean. If the user is suspected of being a minor, provide a detailed reason explaining why.

  User Data: {{{userData}}}
  Message Content: {{{messageContent}}}
  `,
});

const detectSuspectedMinorFlow = ai.defineFlow(
  {
    name: 'detectSuspectedMinorFlow',
    inputSchema: DetectSuspectedMinorInputSchema,
    outputSchema: DetectSuspectedMinorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
