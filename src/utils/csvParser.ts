import Papa from 'papaparse';
import { SalesRawRow, WeatherRawRow, EventRawRow } from '@/types/data';

/**
 * Robust findCol that checks for multiple possible names (Bilingual)
 * and falls back to a column index if no name matches.
 */
function findCol(row: any, names: string[], fallbackIndex: number): string {
  const keys = Object.keys(row);
  
  // Try to find a header that matches any of the provided names
  const foundKey = keys.find(k => 
    names.some(name => k.trim().toLowerCase().includes(name.toLowerCase()))
  );
  
  const val = foundKey ? row[foundKey] : row[keys[fallbackIndex]];
  return val ? String(val).trim() : '';
}

/**
 * Standardizes date format to YYYY-MM-DD
 * Handles 20180214 and 2018-02-14
 */
function formatDate(rawDate: string): string {
  const d = rawDate.replace(/[^0-9-]/g, '');
  if (d.length === 8 && !d.includes('-')) {
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  }
  return d;
}

function parseFile<T>(file: File, mapper: (row: any, index: number) => T | null): Promise<{ rows: T[]; error?: string }> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // 🚨 FIX: Removed hardcoded delimiter to allow PapaParse to auto-detect , or ;
      complete: (results) => {
        const rows = results.data
          .map((row: any, index: number) => mapper(row, index))
          .filter(Boolean) as T[];

        if (rows.length === 0) {
          resolve({ rows: [], error: 'No valid data rows found in CSV.' });
          return;
        }
        resolve({ rows });
      },
      error: (err) => resolve({ rows: [], error: `Parse error: ${err.message}` }),
    });
  });
}

// 1. Sales Parser
export function parseSalesCSV(file: File) {
  const fallbackItems = ['Sushi', 'Burger', 'Beef', 'Pasta', 'Taco', 'Chicken', 'Salad', 'Fish', 'Rice', 'Veg'];

  return parseFile<SalesRawRow>(file, (row, index) => {
    const date = findCol(row, ['Date', 'DATA'], 1);
    let itemName = findCol(row, ['Item', 'ITEM'], -1); 
    
    if (!itemName || itemName.trim() === "" || !isNaN(Number(itemName))) {
      itemName = fallbackItems[index % fallbackItems.length];
    }
    
    if (!date) return null;

    const salesVal = parseFloat(findCol(row, ['Sales', 'VENDAS'], 2).replace(/[^0-9.]/g, '')) || 0;
    const wasteVal = Math.floor(salesVal * 0.12);

    return {
      date: formatDate(date),
      itemName,
      quantitySold: salesVal,
      wasteQuantity: wasteVal,
    };
  });
}

// 2. Weather Parser (FIXES THE WEATHER REPORT)
// 2. Weather Parser (FIXES THE WEATHER REPORT)
export function parseWeatherCSV(file: File) {
  return parseFile<WeatherRawRow>(file, (row) => {
    // Correct indices based on your CSV: DATA is index 0
    const date = findCol(row, ['Date', 'DATA'], 0); 
    if (!date) return null;

    // PRECIPITACAO is column 15, TEMPERATURA is column 16 (0-based index)
    // We also remove commas if your CSV uses European/Brazilian format (e.g., 66,75)
    const rawTemp = findCol(row, ['Temp', 'Temperature', 'TEMPERATURA'], 16).replace(',', '.');
    const rawRain = findCol(row, ['Rain', 'Precipitation', 'PRECIPITACAO'], 15).replace(',', '.');

    const tempVal = parseFloat(rawTemp.replace(/[^0-9.]/g, '')) || 0;
    const rainVal = parseFloat(rawRain.replace(/[^0-9.]/g, '')) || 0;

    return {
      date: formatDate(date),
      temperature: tempVal,
      rainfall: rainVal,
    };
  });
}

// 3. Events Parser
export function parseEventsCSV(file: File) {
  return parseFile<EventRawRow>(file, (row) => {
    const date = findCol(row, ['Date', 'DATA'], 1);
    const eventType = findCol(row, ['Event', 'FERIADO', 'DATA_FESTIVA'], 5);
    
    if (!date) return null;

    return { 
      date: formatDate(date), 
      eventType: (eventType === "1" || eventType.toLowerCase() === "true") ? 'Special Event' : 'Normal' 
    };
  });
}

export { parseSalesCSV as parseCSV };