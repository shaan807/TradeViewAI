import fs from 'fs/promises';
import path from 'path';
import { parse } from 'papaparse'; // Using papaparse for robust CSV parsing

export interface StockDataPoint {
  Date: string; // Stores the original timestamp string from CSV
  Timestamp: number; // Numeric timestamp for calculations and charts
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  direction: 'LONG' | 'SHORT' | 'None' | null;
  Support: number[];
  supportMin: number;
  supportMax: number;
  Resistance: number[];
  resistanceMin: number;
  resistanceMax: number;
  // For recharts custom candlestick
  ohlc: [number, number, number, number]; // open, high, low, close
  candleBody: [number, number]; // [Math.min(open,close), Math.max(open,close)]
  candleWick: [number, number]; // [low, high]
}

function parseJsonArrayString(arrString: string | null | undefined): number[] {
  if (!arrString) return [];
  try {
    // Handle Firebase data format
    if (typeof arrString === 'object') {
      return Object.values(arrString).map(Number).filter(n => !isNaN(n));
    }
    
    // Handle string format
    const correctedArrString = String(arrString)
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":');
      
    try {
      const parsed = JSON.parse(correctedArrString);
      if (Array.isArray(parsed)) {
        return parsed.map(item => Number(item)).filter(n => !isNaN(n));
      }
    } catch {
      if (correctedArrString.startsWith('[') && correctedArrString.endsWith(']')) {
        return correctedArrString
          .slice(1, -1)
          .split(',')
          .map(s => parseFloat(s.trim()))
          .filter(n => !isNaN(n));
      }
    }
    return [];
  } catch (e) {
    console.warn(`Failed to parse array data:`, e);
    return [];
  }
}

function safeNumber(value: any, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export async function loadStockData(): Promise<StockDataPoint[]> {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'TLSA-data.csv');
    const fileContent = await fs.readFile(csvPath, 'utf-8');
    rawCsvDataStore.setData(fileContent);

    const { data } = parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: header => header.trim(),
    });

    return data.map((row: any) => {
      try {
        const dateStr = safeString(row.timestamp);
        if (!dateStr) return null;

        const open = safeNumber(row.open);
        const high = safeNumber(row.high);
        const low = safeNumber(row.low);
        const close = safeNumber(row.close);
        const volume = safeNumber(row.volume);
        
        const numericTimestamp = new Date(dateStr).getTime();
        if (isNaN(numericTimestamp)) return null;

        const supportValues = parseJsonArrayString(row.Support);
        const resistanceValues = parseJsonArrayString(row.Resistance);

        // Ensure all required numeric values are valid
        if ([open, high, low, close, volume].some(n => !isFinite(n))) return null;

        return {
          Date: dateStr,
          Timestamp: numericTimestamp,
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume,
          direction: ['LONG', 'SHORT', 'None'].includes(row.direction) ? row.direction : null,
          Support: supportValues,
          supportMin: supportValues.length > 0 ? Math.min(...supportValues) : low,
          supportMax: supportValues.length > 0 ? Math.max(...supportValues) : low,
          Resistance: resistanceValues,
          resistanceMin: resistanceValues.length > 0 ? Math.min(...resistanceValues) : high,
          resistanceMax: resistanceValues.length > 0 ? Math.max(...resistanceValues) : high,
          ohlc: [open, high, low, close],
          candleBody: [Math.min(open, close), Math.max(open, close)],
          candleWick: [low, high],
        };
      } catch (error) {
        console.warn('Error processing row:', error);
        return null;
      }
    }).filter((row): row is StockDataPoint => row !== null);
  } catch (error) {
    console.error("Failed to load or parse stock data:", error);
    rawCsvDataStore.setData('');
    return [];
  }
}

class RawCsvDataStore {
  private rawCsv: string = '';
  setData(data: string) {
    this.rawCsv = data;
  }
  getData() {
    return this.rawCsv;
  }
}
export const rawCsvDataStore = new RawCsvDataStore();
