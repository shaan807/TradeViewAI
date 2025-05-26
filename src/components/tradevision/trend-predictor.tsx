"use client";

import type { PredictStockTrendsOutput } from '@/ai/flows/predict-stock-trends';
import { predictStockTrends } from '@/ai/flows/predict-stock-trends';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Zap, Loader2, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';


interface TrendPredictorProps {
  stockDataCsv: string;
}

const TrendPredictor: React.FC<TrendPredictorProps> = ({ stockDataCsv }) => {
  const [prediction, setPrediction] = useState<PredictStockTrendsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!stockDataCsv) {
      setError("Stock data is not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await predictStockTrends({ historicalData: stockDataCsv });
      setPrediction(result);
    } catch (err) {
      console.error('Error predicting trends:', err);
      setError('Failed to predict trends. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const confidenceValue = prediction?.confidenceLevel ? parseFloat(prediction.confidenceLevel.replace('%','')) : 0;


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap size={24} /> AI Trend Forecaster
        </CardTitle>
        <CardDescription>Predict future stock trends based on historical data using AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Loader2 size={48} className="animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing data and predicting trends...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center text-destructive p-4 bg-destructive/10 rounded-md">
            <AlertTriangle size={32} className="mb-2"/>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {prediction && !isLoading && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp size={20} className="text-primary"/> Trend Prediction
              </h3>
              <p className="text-foreground leading-relaxed">{prediction.trendPrediction}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Confidence Level</h3>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={confidenceValue} className="w-full h-3" />
                <span className="text-sm font-medium text-primary">{prediction.confidenceLevel}</span>
              </div>
            </div>
          </div>
        )}
         {!prediction && !isLoading && !error && (
          <div className="text-center p-8 text-muted-foreground">
            Click the button below to generate a trend prediction.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handlePredict} disabled={isLoading || !stockDataCsv} className="w-full">
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" /> Predicting...
            </>
          ) : (
            <>
             <Zap size={18} className="mr-2" /> Predict Trends
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrendPredictor;
