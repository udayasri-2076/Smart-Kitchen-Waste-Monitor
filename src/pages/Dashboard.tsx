import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Package,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  CloudRain,
  Thermometer,
  CalendarDays,
  BrainCircuit,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { KPICard, NoDataMessage, PageHeader } from '@/components/dashboard/KPICard';
import {
  computeKPIs,
  getWeeklyWasteTrend,
  getItemWasteBreakdown,
  generateAIInsight,
} from '@/utils/predictions';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

export default function Dashboard() {
  const { dataset, isDataReady } = useData();

  const kpis = useMemo(() => (isDataReady ? computeKPIs(dataset!.rows) : null), [dataset, isDataReady]);
  const wasteTrend = useMemo(() => (isDataReady ? getWeeklyWasteTrend(dataset!.rows) : []), [dataset, isDataReady]);
  const itemWaste = useMemo(() => (isDataReady ? getItemWasteBreakdown(dataset!.rows) : []), [dataset, isDataReady]);
  const aiInsight = useMemo(() => (isDataReady ? generateAIInsight(dataset!.rows) : ''), [dataset, isDataReady]);

  const weatherInfo = useMemo(() => {
    if (!isDataReady) return null;
    const rows = dataset!.rows;
    const avgTemp = rows.reduce((s, r) => s + r.temperature, 0) / rows.length;
    const avgRainfall = rows.reduce((s, r) => s + r.rainfall, 0) / rows.length;
    const events = rows.map(r => r.eventType).filter(Boolean);
    const eventCounts = new Map<string, number>();
    events.forEach(e => eventCounts.set(e!, (eventCounts.get(e!) || 0) + 1));
    const topEvent = Array.from(eventCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    return {
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgRainfall: Math.round(avgRainfall * 10) / 10,
      weatherType: avgRainfall > 5 ? 'Rainy' : avgTemp > 30 ? 'Hot' : avgTemp < 15 ? 'Cold' : 'Moderate',
      topEvent: topEvent ? topEvent[0] : 'Normal',
    };
  }, [dataset, isDataReady]);

  if (!isDataReady) return <NoDataMessage />;

  const wasteThresholdExceeded = kpis && kpis.predictedWaste > 50;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Real-time kitchen waste analytics powered by your data" />

      {wasteThresholdExceeded && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card alert-glow p-4 border-warning/30 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-warning">Alert:</span> Predicted waste ({kpis!.predictedWaste} kg) exceeds the 50 kg threshold. Consider adjusting orders.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Daily Sales" value={kpis!.totalDailySales} subtitle="units/day" icon={ShoppingCart} />
        <KPICard title="Predicted Waste" value={`${kpis!.predictedWaste} kg`} subtitle="daily avg" icon={Trash2} variant="warning" />
        <KPICard title="Recommended Order" value={kpis!.recommendedOrderQty} subtitle="optimal qty" icon={Package} variant="info" />
        <KPICard title="Waste Reduction" value={`${kpis!.wasteReductionPct}%`} subtitle="with AI optimization" icon={TrendingDown} variant="success" />
        <KPICard title="Projected Savings" value={`₹${kpis!.projectedSavings.toLocaleString()}`} subtitle="per month" icon={IndianRupee} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Waste Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-sm mb-4">Weekly Waste Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={wasteTrend}>
              <defs>
                <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              <Area type="monotone" dataKey="waste" stroke="hsl(142 76% 36%)" fill="url(#wasteGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weather + Event Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-sm">Weather & Events</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Thermometer className="w-5 h-5 text-warning" />
              <div>
                <p className="text-lg font-bold">{weatherInfo!.avgTemp}°C</p>
                <p className="text-[10px] text-muted-foreground">Avg Temperature</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CloudRain className="w-5 h-5 text-info" />
              <div>
                <p className="text-lg font-bold">{weatherInfo!.avgRainfall} mm</p>
                <p className="text-[10px] text-muted-foreground">Avg Rainfall</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold">{weatherInfo!.topEvent}</p>
                <p className="text-[10px] text-muted-foreground">Event Impact</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-center py-1 px-2 rounded-full bg-secondary font-medium">
            {weatherInfo!.weatherType} conditions
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Item-wise Waste */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-sm mb-4">Item-wise Waste Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={itemWaste}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="item" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="waste" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insight */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">AI Insight</h3>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm leading-relaxed">{aiInsight}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
