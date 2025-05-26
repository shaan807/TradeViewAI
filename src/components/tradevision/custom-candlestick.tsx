// @ts-nocheck : Recharts typing for custom shapes can be complex.
import React from 'react';

interface CustomCandleStickProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number; // This height is likely for the full range (low to high)
  low?: number;
  high?: number;
  open?: number;
  close?: number;
  fill?: string; // Not directly used, color is determined by open/close
}

const CustomCandleStick: React.FC<CustomCandleStickProps> = (props) => {
  const { x, y, width, height, open, close, high, low } = props;

  // Early return with empty SVG if any required prop is invalid
  if (!x || !y || !width || !height || typeof open !== 'number' || typeof close !== 'number' || typeof high !== 'number' || typeof low !== 'number') {
    console.log('Invalid candlestick props:', { x, y, width, height, open, close, high, low }); // Debug log
    return <g />;
  }

  try {
    const isBullish = close > open;
    const color = isBullish ? '#22c55e' : '#ef4444'; // Green for bullish, Red for bearish
    
    // Calculate the body position and size
    const priceRange = high - low;
    const bodyY = y + ((high - Math.max(open, close)) * height / priceRange);
    const bodyHeight = Math.abs(open - close) * height / priceRange;
    const wickX = x + width / 2;

    // Return empty SVG if any calculation resulted in NaN or Infinity
    if (!isFinite(bodyY) || !isFinite(bodyHeight) || !isFinite(wickX) || priceRange === 0) {
      console.log('Invalid candlestick calculations:', { bodyY, bodyHeight, wickX, priceRange }); // Debug log
      return <g />;
    }

    return (
      <g>
        {/* Wick */}
        <line x1={wickX} y1={y} x2={wickX} y2={y + height} stroke={color} strokeWidth={1.5} />
        {/* Body */}
        <rect x={x} y={bodyY} width={width} height={Math.max(1, bodyHeight)} fill={color} />
      </g>
    );
  } catch (error) {
    console.error('Error rendering candlestick:', error); // Debug log
    return <g />;
  }
};

export default CustomCandleStick;
