import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { SalesDataRow, SalesRawRow, WeatherRawRow, EventRawRow, DatasetMeta } from '@/types/data';

interface DataContextType {
  salesDataset: DatasetMeta<SalesRawRow> | null;
  weatherDataset: DatasetMeta<WeatherRawRow> | null;
  eventsDataset: DatasetMeta<EventRawRow> | null;
  setSalesDataset: (ds: DatasetMeta<SalesRawRow> | null) => void;
  setWeatherDataset: (ds: DatasetMeta<WeatherRawRow> | null) => void;
  setEventsDataset: (ds: DatasetMeta<EventRawRow> | null) => void;
  clearSales: () => void;
  clearWeather: () => void;
  clearEvents: () => void;
  clearData: () => void;
  /** Merged rows from all datasets, ready for analytics */
  mergedRows: SalesDataRow[];
  isDataReady: boolean;
  /** Legacy compat: a dataset-like object */
  dataset: { rows: SalesDataRow[]; uploadedAt: string; fileName: string; status: 'ready' } | null;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

const SALES_KEY = 'skwm_sales';
const WEATHER_KEY = 'skwm_weather';
const EVENTS_KEY = 'skwm_events';

function loadFromStorage<T>(key: string): DatasetMeta<T> | null {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveToStorage<T>(key: string, ds: DatasetMeta<T> | null) {
  if (ds) localStorage.setItem(key, JSON.stringify(ds));
  else localStorage.removeItem(key);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [salesDataset, setSalesState] = useState<DatasetMeta<SalesRawRow> | null>(() => loadFromStorage<SalesRawRow>(SALES_KEY));
  const [weatherDataset, setWeatherState] = useState<DatasetMeta<WeatherRawRow> | null>(() => loadFromStorage<WeatherRawRow>(WEATHER_KEY));
  const [eventsDataset, setEventsState] = useState<DatasetMeta<EventRawRow> | null>(() => loadFromStorage<EventRawRow>(EVENTS_KEY));

  const setSalesDataset = (ds: DatasetMeta<SalesRawRow> | null) => { setSalesState(ds); saveToStorage(SALES_KEY, ds); };
  const setWeatherDataset = (ds: DatasetMeta<WeatherRawRow> | null) => { setWeatherState(ds); saveToStorage(WEATHER_KEY, ds); };
  const setEventsDataset = (ds: DatasetMeta<EventRawRow> | null) => { setEventsState(ds); saveToStorage(EVENTS_KEY, ds); };

  const clearSales = () => setSalesDataset(null);
  const clearWeather = () => setWeatherDataset(null);
  const clearEvents = () => setEventsDataset(null);
  const clearData = () => { clearSales(); clearWeather(); clearEvents(); };

  const salesReady = salesDataset?.status === 'ready' && (salesDataset.rows.length > 0);
  const weatherReady = weatherDataset?.status === 'ready' && (weatherDataset.rows.length > 0);

  // Merge: sales + weather + events by date
  const mergedRows = useMemo<SalesDataRow[]>(() => {
    if (!salesReady) return [];

    const weatherMap = new Map<string, WeatherRawRow>();
    if (weatherReady) {
      weatherDataset!.rows.forEach(w => weatherMap.set(w.date, w));
    }

    const eventsMap = new Map<string, string>();
    if (eventsDataset?.status === 'ready') {
      eventsDataset.rows.forEach(e => eventsMap.set(e.date, e.eventType));
    }

    return salesDataset!.rows.map(s => {
      const w = weatherMap.get(s.date);
      return {
        date: s.date,
        itemName: s.itemName,
        quantitySold: s.quantitySold,
        wasteQuantity: s.wasteQuantity,
        temperature: w?.temperature ?? 0,
        rainfall: w?.rainfall ?? 0,
        eventType: eventsMap.get(s.date) || 'Normal',
      };
    });
  }, [salesDataset, weatherDataset, eventsDataset, salesReady, weatherReady]);

  // Data is ready when at least sales + weather are uploaded
  const isDataReady = salesReady && weatherReady && mergedRows.length > 0;

  const dataset = useMemo(() => {
    if (!isDataReady) return null;
    return {
      rows: mergedRows,
      uploadedAt: salesDataset!.uploadedAt,
      fileName: salesDataset!.fileName,
      status: 'ready' as const,
    };
  }, [isDataReady, mergedRows, salesDataset]);

  return (
    <DataContext.Provider value={{
      salesDataset, weatherDataset, eventsDataset,
      setSalesDataset, setWeatherDataset, setEventsDataset,
      clearSales, clearWeather, clearEvents, clearData,
      mergedRows, isDataReady, dataset,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
