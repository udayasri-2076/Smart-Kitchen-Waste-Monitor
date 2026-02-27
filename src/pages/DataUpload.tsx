import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileCheck, AlertCircle, Loader2, Trash2, FileSpreadsheet } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { parseSalesCSV, parseWeatherCSV, parseEventsCSV } from '@/utils/csvParser';
import { PageHeader } from '@/components/dashboard/KPICard';
import { SALES_REQUIRED_COLUMNS, WEATHER_REQUIRED_COLUMNS, EVENTS_REQUIRED_COLUMNS, DatasetMeta } from '@/types/data';

interface UploadModuleProps<T> {
  title: string;
  description: string;
  requiredColumns: string[];
  dataset: DatasetMeta<T> | null;
  onParsed: (ds: DatasetMeta<T>) => void;
  onClear: () => void;
  parseFile: (file: File) => Promise<{ rows: T[]; error?: string }>;
  previewRender?: (rows: T[]) => React.ReactNode;
}

function UploadModule<T>({ title, description, requiredColumns, dataset, onParsed, onClear, parseFile, previewRender }: UploadModuleProps<T>) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = `csv-input-${title.replace(/\s/g, '-').toLowerCase()}`;

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    setProcessing(true);
    setError(null);
    onParsed({ rows: [] as T[], uploadedAt: new Date().toISOString(), fileName: file.name, status: 'processing' });
    await new Promise(r => setTimeout(r, 800));
    const result = await parseFile(file);
    if (result.error) {
      setError(result.error);
      onParsed({ rows: [] as T[], uploadedAt: new Date().toISOString(), fileName: file.name, status: 'error', error: result.error });
    } else {
      onParsed({ rows: result.rows, uploadedAt: new Date().toISOString(), fileName: file.name, status: 'ready' });
    }
    setProcessing(false);
  }, [parseFile, onParsed]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const statusColor = dataset?.status === 'ready' ? 'text-success' : dataset?.status === 'error' ? 'text-destructive' : dataset?.status === 'processing' ? 'text-warning' : 'text-muted-foreground';
  const statusText = dataset?.status === 'ready' ? 'Ready' : dataset?.status === 'error' ? 'Error' : dataset?.status === 'processing' ? 'Processing...' : 'Not Uploaded';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <span className={`text-xs font-medium ${statusColor} flex items-center gap-1`}>
          {dataset?.status === 'ready' && <FileCheck className="w-3 h-3" />}
          {statusText}
        </span>
      </div>

      {/* Required columns */}
      <div className="flex flex-wrap gap-1.5">
        {requiredColumns.map(col => (
          <span key={col} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{col}</span>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById(inputId)?.click()}
        className={`p-6 text-center cursor-pointer rounded-lg border-2 border-dashed transition-all duration-300 ${
          dragOver ? 'border-primary/60 bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/30'
        }`}
      >
        <input id={inputId} type="file" accept=".csv" className="hidden" onChange={onFileSelect} />
        {processing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-medium">Processing...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Drop CSV here or click to browse</p>
          </div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File info + preview */}
      {dataset && dataset.status === 'ready' && dataset.rows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-medium">{dataset.fileName}</p>
                <p className="text-[10px] text-muted-foreground">{dataset.rows.length} rows · {new Date(dataset.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClear(); setError(null); }} className="text-xs text-destructive hover:underline flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          {previewRender && previewRender(dataset.rows)}
        </div>
      )}
    </motion.div>
  );
}

export default function DataUpload() {
  const {
    salesDataset, weatherDataset, eventsDataset,
    setSalesDataset, setWeatherDataset, setEventsDataset,
    clearSales, clearWeather, clearEvents,
  } = useData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Data Upload" description="Upload your CSV datasets to power all analytics and predictions" />

      {/* Sales Data */}
      <UploadModule
        title="Sales Data Upload"
        description="Upload sales and waste data for items"
        requiredColumns={SALES_REQUIRED_COLUMNS}
        dataset={salesDataset}
        onParsed={setSalesDataset}
        onClear={clearSales}
        parseFile={parseSalesCSV}
        previewRender={(rows) => (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold">Date</th>
                  <th className="text-left py-1.5 px-2 font-semibold">Item</th>
                  <th className="text-right py-1.5 px-2 font-semibold">Qty Sold</th>
                  <th className="text-right py-1.5 px-2 font-semibold">Waste</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 3).map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 px-2">{r.date}</td>
                    <td className="py-1.5 px-2">{r.itemName}</td>
                    <td className="py-1.5 px-2 text-right">{r.quantitySold}</td>
                    <td className="py-1.5 px-2 text-right">{r.wasteQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* Weather Data */}
      <UploadModule
        title="Weather Data Upload"
        description="Upload temperature and rainfall data"
        requiredColumns={WEATHER_REQUIRED_COLUMNS}
        dataset={weatherDataset}
        onParsed={setWeatherDataset}
        onClear={clearWeather}
        parseFile={parseWeatherCSV}
        previewRender={(rows) => (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold">Date</th>
                  <th className="text-right py-1.5 px-2 font-semibold">Temp (°C)</th>
                  <th className="text-right py-1.5 px-2 font-semibold">Rainfall (mm)</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 3).map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 px-2">{r.date}</td>
                    <td className="py-1.5 px-2 text-right">{r.temperature}</td>
                    <td className="py-1.5 px-2 text-right">{r.rainfall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* Events Data */}
      <UploadModule
        title="Events Data Upload"
        description="Upload event/festival data (optional)"
        requiredColumns={EVENTS_REQUIRED_COLUMNS}
        dataset={eventsDataset}
        onParsed={setEventsDataset}
        onClear={clearEvents}
        parseFile={parseEventsCSV}
        previewRender={(rows) => (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold">Date</th>
                  <th className="text-left py-1.5 px-2 font-semibold">Event Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 3).map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 px-2">{r.date}</td>
                    <td className="py-1.5 px-2">{r.eventType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </div>
  );
}
