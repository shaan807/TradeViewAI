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
  const { x, y, width, height, open, close } = props;

  // Early return with empty SVG if any required prop is invalid
  if (!x || !y || !width || !height || typeof open !== 'number' || typeof close !== 'number') {
    return <g />;
  }

  try {
    const isBullish = close > open;
    const color = isBullish ? 'var(--chart-1)' : 'var(--chart-2)'; // Green for bullish, Red for bearish
    
    // Ensure all calculations are valid numbers
    const bodyY = y + ((props.high ?? 0) - Math.max(open, close)) * (height / ((props.high ?? 0) - (props.low ?? 0) || 1));
    const bodyHeight = Math.abs(open - close) * (height / ((props.high ?? 0) - (props.low ?? 0) || 1));
    const wickX = x + width / 2;

    // Return empty SVG if any calculation resulted in NaN or Infinity
    if (!isFinite(bodyY) || !isFinite(bodyHeight) || !isFinite(wickX)) {
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
    // Return empty SVG on any error
    return <g />;
  }
};

export default CustomCandleStick;
