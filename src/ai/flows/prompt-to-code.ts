'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating website code (HTML, CSS, JavaScript) from a natural language prompt.
 *
 * - generateCode - A function that accepts a prompt and returns the generated code for a multi-page website.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt describing the desired website.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const PageSchema = z.object({
  filename: z.string().describe("The filename for the HTML page (e.g., 'index.html', 'about.html')."),
  html: z.string().describe('The generated HTML code for the page.'),
});

const GenerateCodeOutputSchema = z.object({
  pages: z.array(PageSchema).describe('An array of generated HTML pages.'),
  css: z.string().describe('The generated CSS code, shared across all pages.'),
  js: z.string().describe('The generated JavaScript code, shared across all pages.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are an AI web artisan that generates HTML, CSS, and JavaScript code for multi-page websites based on user prompts.

  Given the following prompt, generate the corresponding HTML for each page, and shared CSS and JavaScript code.

  Prompt: {{{prompt}}}

  - Create an 'index.html' file for the main landing page.
  - If the prompt implies other pages (e.g., "about", "contact", "portfolio"), create separate HTML files for them.
  - Use relative paths for links between pages (e.g., <a href="/about.html">).
  - The CSS and JavaScript should be shared across all pages.
  - Make sure to include all necessary parts in your code so that it functions correctly without additional code. Return the code in a structured format.

  The response MUST be in JSON format.
  {
    "pages": [
      { "filename": "index.html", "html": "..." },
      { "filename": "about.html", "html": "..." }
    ],
    "css": "...",
    "js": "..."
  }`,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
