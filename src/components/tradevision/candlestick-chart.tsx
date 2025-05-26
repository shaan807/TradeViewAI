"use client";

import type { StockDataPoint } from '@/lib/data-loader';
import { suppressChartWarnings } from '@/lib/chart-validation';
import React, { useEffect } from 'react';
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
import { format } from 'date-fns';

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
  
  const size = 8; 
  let path;

  if (payload.direction === 'LONG') {
    path = `M ${cx} ${cy} L ${cx - size / 2} ${cy + size} L ${cx + size / 2} ${cy + size} Z`;
  } else if (payload.direction === 'SHORT') {
    path = `M ${cx} ${cy} L ${cx - size / 2} ${cy - size} L ${cx + size / 2} ${cy - size} Z`;
  } else {
    return null; 
  }
  return <path d={path} fill={fill} />;
};

const CircleShape = (props: any) => {
  const { cx, cy, fill } = props;
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;
  return <circle cx={cx} cy={cy} r={4} fill={fill} />;
};


const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  useEffect(() => {
    suppressChartWarnings();
  }, []);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">No data available for chart.</div>;
  }

  const yDomainMargin = 0.15; 
  const allPrices = data.flatMap(d => [d.Low, d.High, d.supportMin, d.supportMax, d.resistanceMin, d.resistanceMax].filter(p => typeof p === 'number'));
  const minY = Math.min(...allPrices, Infinity);
  const maxY = Math.max(...allPrices, -Infinity);
  const yDomainMin = minY * (1 - yDomainMargin);
  const yDomainMax = maxY * (1 + yDomainMargin);
  
  const priceRange = maxY - minY;
  const arrowOffset = priceRange * 0.03; 

  const chartData = data.map(d => ({
    ...d,
    supportBand: (d.supportMin !== null && d.supportMax !== null && d.supportMin !== d.supportMax) ? [d.supportMin, d.supportMax] : null,
    resistanceBand: (d.resistanceMin !== null && d.resistanceMax !== null && d.resistanceMin !== d.resistanceMax) ? [d.resistanceMin, d.resistanceMax] : null,
  }));

  const longMarkers = data
    .filter(d => d.direction === 'LONG')
    .map(d => ({ ...d, Timestamp: d.Timestamp, yPos: d.Low - arrowOffset }));
  
  const shortMarkers = data
    .filter(d => d.direction === 'SHORT')
    .map(d => ({ ...d, Timestamp: d.Timestamp, yPos: d.High + arrowOffset }));
  
  const noneMarkers = data
    .filter(d => d.direction === 'None')
    .map(d => ({ ...d, Timestamp: d.Timestamp, yPos: (d.High + d.Low) / 2 }));


  return (
    <div className="h-[700px] w-full p-4 bg-card rounded-lg shadow-md"> 
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
          <XAxis
            dataKey="Timestamp"
            tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
            minTickGap={30}
            stroke="hsl(var(--muted-foreground))"
            scale="band"
            allowDataOverflow={true}
            allowDecimals={false}
          />
          <YAxis
            orientation="right"
            domain={[yDomainMin, yDomainMax]}
            tickFormatter={(value) => value.toFixed(2)}
            stroke="hsl(var(--muted-foreground))"
            width={80}
            allowDataOverflow={true}
            allowDecimals={false}
          />
          <Tooltip 
            content={<CustomTooltipContent />} 
            cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
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
            stroke="hsl(var(--chart-1) / 0.6)"
            fill="hsl(var(--chart-1) / 0.2)"
            strokeWidth={1.5}
            name="Support"
            connectNulls={true}
            isAnimationActive={false}
          />
          
          <Area
            type="monotoneX"
            dataKey="resistanceBand"
            stroke="hsl(var(--chart-2) / 0.6)"
            fill="hsl(var(--chart-2) / 0.2)"
            strokeWidth={1.5}
            name="Resistance"
            connectNulls={true}
            isAnimationActive={false}
          />
          
          <Bar 
            dataKey="candleWick" 
            shape={<CustomCandleStick />} 
            fill="transparent" 
            barSize={12}
            isAnimationActive={false}
          />
          
          <Scatter 
            name="LONG" 
            data={longMarkers} 
            dataKey="yPos" 
            fill="hsl(var(--chart-1))" 
            shape={<ArrowShape />}
            isAnimationActive={false}
          />
          <Scatter 
            name="SHORT" 
            data={shortMarkers} 
            dataKey="yPos" 
            fill="hsl(var(--chart-2))" 
            shape={<ArrowShape />}
            isAnimationActive={false}
          />
          <Scatter 
            name="None" 
            data={noneMarkers} 
            dataKey="yPos" 
            fill="hsl(var(--chart-4))" 
            shape={<CircleShape />}
            isAnimationActive={false}
          />
          <ZAxis range={[100, 100]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// This file is no longer directly used by page.tsx but kept for reference or potential future use.
export default CandlestickChart;
