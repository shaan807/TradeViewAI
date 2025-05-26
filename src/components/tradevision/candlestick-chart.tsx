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
  const { cx, cy, payload } = props;
  if (!payload || typeof cx !== 'number' || typeof cy !== 'number') return null;
  
  const size = 25; // Increased size for better visibility
  let path;
  let color;

  if (payload.direction === 'LONG') {
    // Upward pointing arrow below candle
    path = `M ${cx} ${cy - size} L ${cx - size/2} ${cy} L ${cx + size/2} ${cy} Z`;
    color = '#22c55e';
  } else if (payload.direction === 'SHORT') {
    // Downward pointing arrow above candle
    path = `M ${cx} ${cy + size} L ${cx - size/2} ${cy} L ${cx + size/2} ${cy} Z`;
    color = '#ef4444';
  } else {
    return null;
  }
  return (
    <path d={path} fill={color} stroke={color} strokeWidth={3} />
  );
};

const CircleShape = (props: any) => {
  const { cx, cy } = props;
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={12} 
      fill="#eab308" 
      stroke="#eab308"
      strokeWidth={3}
    />
  );
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
  const arrowOffset = priceRange * 0.05; // Increased offset for better separation

  const chartData = filteredData.map(d => ({
    ...d,
    candleWick: {
      x: d.Timestamp,
      high: d.High,
      low: d.Low,
      open: d.Open,
      close: d.Close
    },
    supportMin: d.supportMin,
    supportMax: d.supportMax,
    resistanceMin: d.resistanceMin,
    resistanceMax: d.resistanceMax,
  }));

  const longMarkers = filteredData
    .filter(d => d.direction === 'LONG')
    .map(d => ({ 
      ...d, 
      Timestamp: d.Timestamp, 
      yPos: d.Low - arrowOffset
    }));
  
  const shortMarkers = filteredData
    .filter(d => d.direction === 'SHORT')
    .map(d => ({ 
      ...d, 
      Timestamp: d.Timestamp, 
      yPos: d.High + arrowOffset
    }));
  
  const noneMarkers = filteredData
    .filter(d => d.direction === 'None')
    .map(d => ({ 
      ...d, 
      Timestamp: d.Timestamp, 
      yPos: (d.High + d.Low) / 2
    }));

  const customLegendPayload = [
    { value: 'Support', type: 'circle', color: '#22c55e', id: 'Support' },
    { value: 'Resistance', type: 'circle', color: '#ef4444', id: 'Resistance' },
    { value: 'LONG', type: 'circle', color: '#22c55e', id: 'LONG' },
    { value: 'SHORT', type: 'circle', color: '#ef4444', id: 'SHORT' },
    { value: 'None', type: 'circle', color: '#eab308', id: 'None' },
  ];

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
            />
            <YAxis
              orientation="right"
              domain={[yDomainMin, yDomainMax]}
              tickFormatter={(value) => value.toFixed(2)}
              stroke="#666"
              width={80}
            />
            
            {/* Support Band (green, as a band between min and max) */}
            <Area
              type="monotone"
              dataKey="supportMax"
              stroke="none"
              fill="#22c55e33"
              fillOpacity={0.3}
              name="Support"
              connectNulls={true}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="supportMin"
              stroke="#22c55e"
              fill="none"
              connectNulls={true}
              isAnimationActive={false}
              hide={true}
            />
            
            {/* Resistance Band (red, as a band between min and max) */}
            <Area
              type="monotone"
              dataKey="resistanceMax"
              stroke="none"
              fill="#ef444433"
              fillOpacity={0.3}
              name="Resistance"
              connectNulls={true}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="resistanceMin"
              stroke="#ef4444"
              fill="none"
              connectNulls={true}
              isAnimationActive={false}
              hide={true}
            />
            
            {/* Candlesticks */}
            <Bar 
              dataKey="candleWick" 
              shape={<CustomCandleStick />}
              isAnimationActive={false}
              barSize={8}
              hide={true}
            />
            
            {/* Direction Markers */}
            <Scatter 
              name="LONG" 
              data={longMarkers} 
              dataKey="yPos"
              shape={<ArrowShape />}
              isAnimationActive={false}
              fill="#22c55e"
              zAxisId={1}
            />
            <Scatter 
              name="SHORT" 
              data={shortMarkers} 
              dataKey="yPos"
              shape={<ArrowShape />}
              isAnimationActive={false}
              fill="#ef4444"
              zAxisId={1}
            />
            <Scatter 
              name="None" 
              data={noneMarkers} 
              dataKey="yPos"
              shape={<CircleShape />}
              isAnimationActive={false}
              fill="#eab308"
              zAxisId={1}
            />
            
            <Tooltip content={<CustomTooltipContent />} />
            <Legend 
              verticalAlign="top" 
              align="center"
              iconSize={10}
              iconType="circle"
              payload={customLegendPayload}
            />
            <ZAxis range={[300, 300]} zAxisId={1} /> {/* Increased range for better marker visibility */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// This file is no longer directly used by page.tsx but kept for reference or potential future use.
export default CandlestickChart;
