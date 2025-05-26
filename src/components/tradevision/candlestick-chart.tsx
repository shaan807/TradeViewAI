"use client";

import type { StockDataPoint } from '@/lib/data-loader';
import { suppressChartWarnings } from '@/lib/chart-validation';
import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Area, 
  Scatter,
  ZAxis,
} from 'recharts';
import CustomCandleStick from './custom-candlestick';
import { format, parse } from 'date-fns';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface CandlestickChartProps {
  data: StockDataPoint[];
}

const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    const supportData = payload.find((p: any) => p.dataKey === 'supportBand');
    const resistanceData = payload.find((p: any) => p.dataKey === 'resistanceBand');

    return (
      <div className="bg-card p-3 border border-border rounded-md shadow-lg">
        <p className="font-semibold text-card-foreground">{format(new Date(data.Timestamp), 'MMM dd, yyyy')}</p>
        <p className="text-sm text-muted-foreground">Open: <span className="font-medium text-foreground">{data.Open.toFixed(2)}</span></p>
        <p className="text-sm text-muted-foreground">High: <span className="font-medium text-foreground">{data.High.toFixed(2)}</span></p>
        <p className="text-sm text-muted-foreground">Low: <span className="font-medium text-foreground">{data.Low.toFixed(2)}</span></p>
        <p className="text-sm text-muted-foreground">Close: <span className="font-medium text-foreground">{data.Close.toFixed(2)}</span></p>
        <p className="text-sm text-muted-foreground">Volume: <span className="font-medium text-foreground">{data.Volume.toLocaleString()}</span></p>
        {data.direction && <p className="text-sm text-muted-foreground">Direction: <span className="font-medium text-foreground">{data.direction}</span></p>}
        {supportData && data.supportMin !== data.supportMax && (
          <p className="text-sm text-muted-foreground">Support: <span className="font-medium text-foreground">{data.supportMin.toFixed(2)} - {data.supportMax.toFixed(2)}</span></p>
        )}
        {resistanceData && data.resistanceMin !== data.resistanceMax && (
           <p className="text-sm text-muted-foreground">Resistance: <span className="font-medium text-foreground">{data.resistanceMin.toFixed(2)} - {data.resistanceMax.toFixed(2)}</span></p>
        )}
      </div>
    );
  }
  return null;
};

const ArrowShape = (props: any) => {
  const { cx, cy, payload, fill } = props;
  if (!payload || typeof cx !== 'number' || typeof cy !== 'number') return null;
  
  const size = 10; // Size of the arrow
  let path;
  let color;

  if (payload.direction === 'LONG') {
    // Upward pointing arrow below the candle
    path = `M ${cx} ${cy} L ${cx - size / 2} ${cy + size} L ${cx + size / 2} ${cy + size} Z`;
    color = '#22c55e'; // Green color
  } else if (payload.direction === 'SHORT') {
    // Downward pointing arrow above the candle
    path = `M ${cx} ${cy} L ${cx - size / 2} ${cy - size} L ${cx + size / 2} ${cy - size} Z`;
    color = '#ef4444'; // Red color
  } else {
    return null;
  }
  return <path d={path} fill={color} />;
};

const CircleShape = (props: any) => {
  const { cx, cy } = props;
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;
  return <circle cx={cx} cy={cy} r={5} fill="#eab308" />; // Yellow color for None direction
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const [enableDateFilter, setEnableDateFilter] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (enableDateFilter && startDate && endDate) {
      const filtered = data.filter(item => {
        const itemDate = new Date(item.Timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [data, enableDateFilter, startDate, endDate]);

  useEffect(() => {
    suppressChartWarnings();
  }, []);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">No data available for chart.</div>;
  }

  const yDomainMargin = 0.15; 
  const allPrices = filteredData.flatMap(d => [d.Low, d.High, d.supportMin, d.supportMax, d.resistanceMin, d.resistanceMax].filter(p => typeof p === 'number'));
  const minY = Math.min(...allPrices, Infinity);
  const maxY = Math.max(...allPrices, -Infinity);
  const yDomainMin = minY * (1 - yDomainMargin);
  const yDomainMax = maxY * (1 + yDomainMargin);
  
  const priceRange = maxY - minY;
  const arrowOffset = priceRange * 0.03;

  const chartData = filteredData.map(d => ({
    ...d,
    candleWick: {
      open: d.Open,
      high: d.High,
      low: d.Low,
      close: d.Close
    },
    supportBand: (d.supportMin !== null && d.supportMax !== null) ? [d.supportMin, d.supportMax] : null,
    resistanceBand: (d.resistanceMin !== null && d.resistanceMax !== null) ? [d.resistanceMin, d.resistanceMax] : null,
  }));

  const longMarkers = filteredData
    .filter(d => d.direction === 'LONG')
    .map(d => ({ ...d, Timestamp: d.Timestamp, yPos: d.Low - arrowOffset }));
  
  const shortMarkers = filteredData
    .filter(d => d.direction === 'SHORT')
    .map(d => ({ ...d, Timestamp: d.Timestamp, yPos: d.High + arrowOffset }));
  
  const noneMarkers = filteredData
    .filter(d => d.direction === 'None')
    .map(d => ({ ...d, Timestamp: d.Timestamp, yPos: (d.High + d.Low) / 2 }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <Switch
            checked={enableDateFilter}
            onCheckedChange={setEnableDateFilter}
            id="date-filter"
          />
          <Label htmlFor="date-filter">Filter by Date Range</Label>
        </div>
        
        {enableDateFilter && (
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="h-[700px] w-full p-4 bg-background rounded-lg shadow-md"> 
        <ResponsiveContainer width="100%" height="100%" minHeight={500}>
          <ComposedChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            className="bg-background"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="Timestamp"
              tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
              minTickGap={30}
              stroke="#666"
              scale="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              allowDataOverflow={true}
              allowDecimals={false}
            />
            <YAxis
              orientation="right"
              domain={[yDomainMin, yDomainMax]}
              tickFormatter={(value) => value.toFixed(2)}
              stroke="#666"
              width={80}
              allowDataOverflow={true}
              allowDecimals={false}
            />
            <Tooltip 
              content={<CustomTooltipContent />} 
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              isAnimationActive={false}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              verticalAlign="top"
              align="center"
            />

            <Area
              type="monotoneX"
              dataKey="supportBand"
              stroke="#22c55e"
              fill="#22c55e33"
              strokeWidth={1.5}
              name="Support"
              connectNulls={true}
              isAnimationActive={false}
            />
            
            <Area
              type="monotoneX"
              dataKey="resistanceBand"
              stroke="#ef4444"
              fill="#ef444433"
              strokeWidth={1.5}
              name="Resistance"
              connectNulls={true}
              isAnimationActive={false}
            />
            
            <Bar 
              dataKey="candleWick" 
              shape={<CustomCandleStick />} 
              fill="transparent" 
              barSize={8}
              isAnimationActive={false}
            />
            
            <Scatter 
              name="LONG" 
              data={longMarkers} 
              dataKey="yPos" 
              fill="#22c55e"
              shape={<ArrowShape />}
              isAnimationActive={false}
            />
            <Scatter 
              name="SHORT" 
              data={shortMarkers} 
              dataKey="yPos" 
              fill="#ef4444"
              shape={<ArrowShape />}
              isAnimationActive={false}
            />
            <Scatter 
              name="None" 
              data={noneMarkers} 
              dataKey="yPos" 
              fill="#eab308"
              shape={<CircleShape />}
              isAnimationActive={false}
            />
            <ZAxis range={[100, 100]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// This file is no longer directly used by page.tsx but kept for reference or potential future use.
export default CandlestickChart;
