import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandlestickChart from "@/components/tradevision/candlestick-chart";
import Chatbot from "@/components/tradevision/chatbot";
import TrendPredictor from "@/components/tradevision/trend-predictor";
import { loadStockData, rawCsvDataStore } from "@/lib/data-loader";
import type { StockDataPoint } from "@/lib/data-loader";
import { BarChart3, MessageCircle, Zap, Brain, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default async function TradeVisionPage() {
  const stockData: StockDataPoint[] = await loadStockData();
  console.log('Loaded stock data length:', stockData.length);
  const stockDataCsv: string = rawCsvDataStore.getData();
  console.log('Has CSV data:', !!stockDataCsv);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="app-header p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center">
          <Brain size={32} className="mr-3 text-accent"/>
          <h1 className="text-3xl font-bold tracking-tight">TradeVisionAI</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-6 px-4">
        <Tabs defaultValue="visualizer" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="visualizer" className="py-3 text-base">
              <LineChart className="mr-2 h-5 w-5" /> Price/Volume Visualizer 
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="py-3 text-base">
              <MessageCircle className="mr-2 h-5 w-5" /> AI Analyst Chat
            </TabsTrigger>
            <TabsTrigger value="predictor" className="py-3 text-base">
              <Zap className="mr-2 h-5 w-5" /> Trend Forecaster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualizer">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">TSLA Price and Volume</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                {stockData.length > 0 ? (
                  <div className="h-[700px] w-full min-h-[500px]">
                    <CandlestickChart data={stockData} />
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground h-[550px] flex items-center justify-center">
                    Failed to load stock data for the chart.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chatbot">
            {stockDataCsv ? (
               <Chatbot stockDataCsv={stockDataCsv} />
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Stock data for chatbot is unavailable.
              </div>
            )}
          </TabsContent>
          <TabsContent value="predictor">
             {stockDataCsv ? (
               <TrendPredictor stockDataCsv={stockDataCsv} />
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                 Stock data for trend prediction is unavailable.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} TradeVisionAI. All rights reserved.
      </footer>
    </div>
  );
}
