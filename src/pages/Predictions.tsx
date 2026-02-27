import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { NoDataMessage, PageHeader } from '@/components/dashboard/KPICard';
import { runPredictions } from '@/utils/predictions';

export default function Predictions() {
  const { dataset, isDataReady } = useData();
  const [predictions, setPredictions] = useState<ReturnType<typeof runPredictions> | null>(null);
  const [running, setRunning] = useState(false);

  if (!isDataReady) return <NoDataMessage />;

  const handleRun = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1200));
    const results = runPredictions(dataset!.rows);
    setPredictions(results);
    setRunning(false);
  };

  const recIcon = (rec: string) => {
    if (rec === 'Increase') return <TrendingUp className="w-3.5 h-3.5 text-success" />;
    if (rec === 'Decrease') return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Waste Predictions" description="AI-powered predictions based on your uploaded dataset">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-5 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          {running ? 'Training Model...' : 'Run Waste Prediction'}
        </button>
      </PageHeader>

      {!predictions && !running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
          <BrainCircuit className="w-12 h-12 text-primary/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Click "Run Waste Prediction" to train the model on your dataset.</p>
        </motion.div>
      )}

      {predictions && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold">Item</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Sales</th>
                  <th className="text-right py-3 px-4 font-semibold">Predicted Waste (kg)</th>
                  <th className="text-right py-3 px-4 font-semibold">Confidence</th>
                  <th className="text-right py-3 px-4 font-semibold">Recommended Qty</th>
                  <th className="text-center py-3 px-4 font-semibold">Action</th>
                  <th className="text-left py-3 px-4 font-semibold">Factors</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <motion.tr
                    key={p.itemName}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{p.itemName}</td>
                    <td className="py-3 px-4 text-right">{p.avgSales}</td>
                    <td className="py-3 px-4 text-right font-semibold">{p.predictedWaste}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{p.confidenceScore}%</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{p.recommendedOrderQty}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium">
                        {recIcon(p.recommendation)} {p.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.factors.slice(0, 2).map((f, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
