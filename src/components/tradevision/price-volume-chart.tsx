"use client";

import type { StockDataPoint } from '@/lib/data-loader';
import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  Cell,
  ReferenceLine,
  Brush,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface PriceVolumeChartProps {
  data: StockDataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#1a1a1a', padding: '10px', border: '1px solid #333' }}>
        <p style={{ margin: '0 0 5px' }}>{format(new Date(data.Timestamp), 'MMM dd, yyyy')}</p>
        <p style={{ margin: '0 0 5px' }}>Price: ${data.Close.toFixed(2)}</p>
        <p style={{ margin: '0' }}>Volume: {Number(data.Volume).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({ data }) => {
  const [showVolume, setShowVolume] = useState(true);

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const chartData = data;
  const latestPrice = chartData[chartData.length - 1]?.Close;

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          background: showVolume ? '#2563eb' : '#374151',
          padding: '6px 12px',
          borderRadius: '6px',
          color: 'white'
        }}>
          <input
            type="checkbox"
            checked={showVolume}
            onChange={(e) => setShowVolume(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Show Volume
        </label>
      </div>
      
      <div style={{ height: '600px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="Timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
              stroke="#666"
            />
            <YAxis
              yAxisId="price"
              orientation="left"
              stroke="#666"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            {showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Area
              type="monotone"
              dataKey="Close"
              yAxisId="price"
              stroke="#2563eb"
              fill="#2563eb33"
              name="Price"
            />

            {showVolume && (
              <Bar 
                dataKey="Volume" 
                yAxisId="volume" 
                name="Volume"
                fill="#4ade8033"
                stroke="#4ade80"
              />
            )}

            {latestPrice && (
              <ReferenceLine
                yAxisId="price"
                y={latestPrice}
                stroke="#2563eb"
                strokeDasharray="3 3"
              />
            )}

            <Brush
              dataKey="Timestamp"
              height={40}
              stroke="#2563eb"
              tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceVolumeChart;
