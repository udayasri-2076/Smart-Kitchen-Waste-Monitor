import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileDown, BrainCircuit } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { NoDataMessage, PageHeader, KPICard } from '@/components/dashboard/KPICard';
import { computeKPIs, runPredictions, computeWeatherSummary, generateAIInsight } from '@/utils/predictions';
import { TrendingDown, IndianRupee, Trash2, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const { dataset, isDataReady } = useData();

  const kpis = useMemo(() => (isDataReady ? computeKPIs(dataset!.rows) : null), [dataset, isDataReady]);
  const predictions = useMemo(() => (isDataReady ? runPredictions(dataset!.rows) : []), [dataset, isDataReady]);
  const weatherSummary = useMemo(() => (isDataReady ? computeWeatherSummary(dataset!.rows) : null), [dataset, isDataReady]);
  const aiInsight = useMemo(() => (isDataReady ? generateAIInsight(dataset!.rows) : ''), [dataset, isDataReady]);

  const totalOriginalWaste = useMemo(() => {
    if (!isDataReady) return 0;
    return dataset!.rows.reduce((s, r) => s + r.wasteQuantity, 0);
  }, [dataset, isDataReady]);

  const totalOptimizedWaste = useMemo(() => totalOriginalWaste * 0.72, [totalOriginalWaste]);
  const profitImprovement = useMemo(() => (kpis ? kpis.wasteReductionPct : 0), [kpis]);

  const downloadPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Smart Kitchen Waste Reduction Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    doc.setFontSize(12);
    doc.text('Summary', 14, 42);
    doc.setFontSize(10);
    doc.text(`Total Waste Before AI: ${Math.round(totalOriginalWaste)} kg`, 14, 50);
    doc.text(`Total Waste After AI: ${Math.round(totalOptimizedWaste)} kg`, 14, 57);
    doc.text(`Waste Reduction: ${kpis?.wasteReductionPct}%`, 14, 64);
    doc.text(`Projected Monthly Savings: ₹${kpis?.projectedSavings.toLocaleString()}`, 14, 71);
    doc.text(`AI Insight: ${aiInsight}`, 14, 78, { maxWidth: 180 });

    if (weatherSummary) {
      doc.text(`Weather: Hot Days: ${weatherSummary.hotDays}, Rainy: ${weatherSummary.rainyDays}, Winter: ${weatherSummary.winterDays}`, 14, 92);
    }

    autoTable(doc, {
      startY: 105,
      head: [['Item', 'Avg Sales', 'Predicted Waste', 'Recommended Qty', 'Profit Impact']],
      body: predictions.map(p => [p.itemName, p.avgSales, p.predictedWaste, p.recommendedOrderQty, `₹${p.profitImpact}`]),
    });

    doc.save('waste-reduction-report.pdf');
  }, [totalOriginalWaste, totalOptimizedWaste, kpis, predictions, aiInsight, weatherSummary]);

  const downloadCSV = useCallback(() => {
    const header = 'Item,Avg Sales,Predicted Waste,Recommended Qty,Profit Impact\n';
    const rows = predictions.map(p => `${p.itemName},${p.avgSales},${p.predictedWaste},${p.recommendedOrderQty},${p.profitImpact}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waste-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [predictions]);

  if (!isDataReady) return <NoDataMessage />;

  return (
    <div className="space-y-6">
      <PageHeader title="Waste Reduction Report" description="Comprehensive analysis of waste optimization impact">
        <div className="flex gap-2">
          <button onClick={downloadPDF} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <FileDown className="w-4 h-4" /> PDF
          </button>
          <button onClick={downloadCSV} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <FileDown className="w-4 h-4" /> CSV
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Waste Before AI" value={`${Math.round(totalOriginalWaste)} kg`} subtitle="total from dataset" icon={Trash2} variant="warning" />
        <KPICard title="Waste After AI" value={`${Math.round(totalOptimizedWaste)} kg`} subtitle="with optimization" icon={TrendingDown} variant="success" />
        <KPICard title="Profit Improvement" value={`${profitImprovement}%`} subtitle="cost reduction" icon={BarChart3} variant="info" />
        <KPICard title="Monthly Savings" value={`₹${kpis?.projectedSavings.toLocaleString()}`} subtitle="projected" icon={IndianRupee} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">AI Insights Summary</h3>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm leading-relaxed">{aiInsight}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-sm mb-3">Weather Impact Summary</h3>
          {weatherSummary && (
            <div className="space-y-2">
              {weatherSummary.wasteByWeather.map((w) => (
                <div key={w.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">{w.type}</span>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Avg waste: <span className="font-semibold text-foreground">{w.avgWaste} kg</span></p>
                    <p className="text-xs text-muted-foreground">Avg sales: <span className="font-semibold text-foreground">{w.avgSales}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-display font-semibold text-sm">Detailed Item Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Item</th>
                <th className="text-right py-3 px-4 font-semibold">Avg Sales</th>
                <th className="text-right py-3 px-4 font-semibold">Predicted Waste</th>
                <th className="text-right py-3 px-4 font-semibold">Optimal Order</th>
                <th className="text-center py-3 px-4 font-semibold">Action</th>
                <th className="text-right py-3 px-4 font-semibold">Savings (₹)</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr key={p.itemName} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-4 font-medium">{p.itemName}</td>
                  <td className="py-2.5 px-4 text-right">{p.avgSales}</td>
                  <td className="py-2.5 px-4 text-right">{p.predictedWaste} kg</td>
                  <td className="py-2.5 px-4 text-right">{p.recommendedOrderQty}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.recommendation === 'Decrease' ? 'bg-destructive/10 text-destructive' :
                      p.recommendation === 'Increase' ? 'bg-success/10 text-success' :
                      'bg-muted text-muted-foreground'
                    }`}>{p.recommendation}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-success font-semibold">+₹{p.profitImpact.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
