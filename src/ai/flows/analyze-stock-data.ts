// noinspection ES6ConvertVarToLetConst
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing stock data using the Gemini API.
 *
 * - analyzeStockData - A function that accepts a question about stock data and returns an answer.
 * - AnalyzeStockDataInput - The input type for the analyzeStockData function.
 * - AnalyzeStockDataOutput - The return type for the analyzeStockData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStockDataInputSchema = z.object({
  question: z.string().describe('The question about the stock data.'),
  stockData: z.string().describe('The TSLA stock data in CSV format.'),
});
export type AnalyzeStockDataInput = z.infer<typeof AnalyzeStockDataInputSchema>;

const AnalyzeStockDataOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the stock data.'),
});
export type AnalyzeStockDataOutput = z.infer<typeof AnalyzeStockDataOutputSchema>;

export async function analyzeStockData(input: AnalyzeStockDataInput): Promise<AnalyzeStockDataOutput> {
  return analyzeStockDataFlow(input);
}

const analyzeStockDataPrompt = ai.definePrompt({
  name: 'analyzeStockDataPrompt',
  input: {schema: AnalyzeStockDataInputSchema},
  output: {schema: AnalyzeStockDataOutputSchema},
  prompt: `You are a financial analyst specializing in stock data analysis.
  You are provided with TSLA stock data in CSV format. The data contains OHLCV data, support and resistance levels, and direction.
  Your task is to answer questions about the data accurately and concisely.
  
  Stock Data:\n{{{stockData}}}
  
  Question: {{{question}}}
  
  Answer:`, // Keep this area clear, it will be populated by the prompt
});

const analyzeStockDataFlow = ai.defineFlow(
  {
    name: 'analyzeStockDataFlow',
    inputSchema: AnalyzeStockDataInputSchema,
    outputSchema: AnalyzeStockDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeStockDataPrompt(input);
    return output!;
  }
);
