export interface SalesDataRow {
  date: string;
  itemName: string;
  quantitySold: number;
  wasteQuantity: number;
  temperature: number;
  rainfall: number;
  eventType?: string;
}

export interface SalesRawRow {
  date: string;
  itemName: string;
  quantitySold: number;
  wasteQuantity: number;
}

export interface WeatherRawRow {
  date: string;
  temperature: number;
  rainfall: number;
}

export interface EventRawRow {
  date: string;
  eventType: string;
}

export interface DatasetMeta<T> {
  rows: T[];
  uploadedAt: string;
  fileName: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  error?: string;
}

export interface PredictionResult {
  itemName: string;
  predictedWaste: number;
  confidenceScore: number;
  avgSales: number;
  recommendedOrderQty: number;
  recommendation: 'Increase' | 'Decrease' | 'Maintain';
  profitImpact: number;
  factors: string[];
}

export interface WeatherSummary {
  hotDays: number;
  rainyDays: number;
  winterDays: number;
  avgTemp: number;
  totalRainfall: number;
  wasteByWeather: { type: string; avgWaste: number; avgSales: number }[];
}

export interface KPIData {
  totalDailySales: number;
  predictedWaste: number;
  recommendedOrderQty: number;
  wasteReductionPct: number;
  projectedSavings: number;
}

export const SALES_REQUIRED_COLUMNS = ['Date', 'Item Name', 'Quantity Sold', 'Waste Quantity'];
export const WEATHER_REQUIRED_COLUMNS = ['Date', 'Temperature', 'Rainfall'];
export const EVENTS_REQUIRED_COLUMNS = ['Date', 'Event Type'];

// Keep for backward compat
export const REQUIRED_COLUMNS = [
  'Date',
  'Item Name',
  'Quantity Sold',
  'Waste Quantity',
  'Temperature',
  'Rainfall',
];

export const HOT_THRESHOLD = 30;
export const WINTER_THRESHOLD = 15;
export const WASTE_COST_PER_KG = 50; // ₹ per kg
