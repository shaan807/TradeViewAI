// 'use server'
'use server';

/**
 * @fileOverview Predicts future stock trends using historical data.
 *
 * - predictStockTrends - A function that predicts stock trends.
 * - PredictStockTrendsInput - The input type for the predictStockTrends function.
 * - PredictStockTrendsOutput - The return type for the predictStockTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictStockTrendsInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical stock data in CSV format, including date, open, high, low, close, and volume.'
    ),
});
export type PredictStockTrendsInput = z.infer<typeof PredictStockTrendsInputSchema>;

const PredictStockTrendsOutputSchema = z.object({
  trendPrediction: z
    .string()
    .describe('A prediction of future stock trends based on the historical data.'),
  confidenceLevel: z
    .string()
    .describe('A level of confidence in percentage about the trend prediction.'),
});
export type PredictStockTrendsOutput = z.infer<typeof PredictStockTrendsOutputSchema>;

export async function predictStockTrends(input: PredictStockTrendsInput): Promise<PredictStockTrendsOutput> {
  return predictStockTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictStockTrendsPrompt',
  input: {schema: PredictStockTrendsInputSchema},
  output: {schema: PredictStockTrendsOutputSchema},
  prompt: `You are an expert financial analyst specializing in predicting stock market trends.

You will use the provided historical stock data to predict future trends.  Assess the data for patterns such as moving averages, support and resistance levels, and volume changes.

Historical Data: {{{historicalData}}}

Based on this data, provide a prediction of future stock trends and a confidence level for your prediction.

Output in JSON format.
`,
});

const predictStockTrendsFlow = ai.defineFlow(
  {
    name: 'predictStockTrendsFlow',
    inputSchema: PredictStockTrendsInputSchema,
    outputSchema: PredictStockTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
