'use server';

/**
 * @fileOverview This file defines a Genkit flow for smart theme selection based on the user's prompt.
 *
 * The flow analyzes the prompt to determine whether a light or dark theme is more appropriate
 * and returns the chosen theme.
 *
 * - `selectTheme` - A function that selects the appropriate theme based on the prompt.
 * - `ThemeSelectionInput` - The input type for the `selectTheme` function.
 * - `ThemeSelectionOutput` - The return type for the `selectTheme` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThemeSelectionInputSchema = z.object({
  prompt: z
    .string()
    .describe('The user prompt describing the website to be generated.'),
});
export type ThemeSelectionInput = z.infer<typeof ThemeSelectionInputSchema>;

const ThemeSelectionOutputSchema = z.object({
  theme: z
    .enum(['light', 'dark'])
    .describe('The selected theme for the website (light or dark).'),
});
export type ThemeSelectionOutput = z.infer<typeof ThemeSelectionOutputSchema>;

export async function selectTheme(input: ThemeSelectionInput): Promise<ThemeSelectionOutput> {
  return selectThemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'themeSelectionPrompt',
  input: {schema: ThemeSelectionInputSchema},
  output: {schema: ThemeSelectionOutputSchema},
  prompt: `You are a theme selection assistant. You will receive a prompt describing a website, and you should select either a light or dark theme for the website, depending on which is more appropriate.

Consider these guidelines when selecting a theme:
- Dark themes are generally preferred for developer-focused websites, or websites with a modern, sleek aesthetic.
- Light themes are generally preferred for professional, clean websites.

Prompt: {{{prompt}}}`,
});

const selectThemeFlow = ai.defineFlow(
  {
    name: 'selectThemeFlow',
    inputSchema: ThemeSelectionInputSchema,
    outputSchema: ThemeSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
