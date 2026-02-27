import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { NoDataMessage, PageHeader } from '@/components/dashboard/KPICard';
import { runPredictions } from '@/utils/predictions';
import { IndianRupee } from 'lucide-react';

export default function Optimization() {
  const { dataset, isDataReady } = useData();

  const predictions = useMemo(() => (isDataReady ? runPredictions(dataset!.rows) : []), [dataset, isDataReady]);
  const totalSavings = useMemo(() => predictions.reduce((s, p) => s + p.profitImpact, 0), [predictions]);

  if (!isDataReady) return <NoDataMessage />;

  return (
    <div className="space-y-6">
      <PageHeader title="Order Optimization" description="Optimized ordering recommendations to minimize waste">
        <div className="glass-card px-4 py-2 flex items-center gap-2 kpi-glow">
          <IndianRupee className="w-4 h-4 text-success" />
          <span className="text-sm font-bold">₹{totalSavings.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">projected monthly savings</span>
        </div>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Item</th>
                <th className="text-right py-3 px-4 font-semibold">Avg Sales</th>
                <th className="text-right py-3 px-4 font-semibold">Predicted Waste (kg)</th>
                <th className="text-right py-3 px-4 font-semibold">Recommended Order Qty</th>
                <th className="text-right py-3 px-4 font-semibold">Profit Impact (₹)</th>
                <th className="text-center py-3 px-4 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => {
                const highRisk = p.predictedWaste > p.avgSales * 0.2;
                return (
                  <motion.tr
                    key={p.itemName}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-border/50 transition-colors ${highRisk ? 'bg-destructive/5' : 'hover:bg-muted/20'}`}
                  >
                    <td className="py-3 px-4 font-medium">{p.itemName}</td>
                    <td className="py-3 px-4 text-right">{p.avgSales}</td>
                    <td className="py-3 px-4 text-right">{p.predictedWaste}</td>
                    <td className="py-3 px-4 text-right font-semibold">{p.recommendedOrderQty}</td>
                    <td className="py-3 px-4 text-right font-semibold text-success">+₹{p.profitImpact.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${highRisk ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                        {highRisk ? 'High' : 'Low'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
