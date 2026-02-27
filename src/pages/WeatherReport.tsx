import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { NoDataMessage, PageHeader, KPICard } from '@/components/dashboard/KPICard';
import { computeWeatherSummary, getDailyTempTrend, getDailyRainfallTrend } from '@/utils/predictions';
import { Thermometer, CloudRain, Snowflake, Sun, BrainCircuit } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

export default function WeatherReport() {
  const { dataset, isDataReady } = useData();

  const summary = useMemo(() => (isDataReady ? computeWeatherSummary(dataset!.rows) : null), [dataset, isDataReady]);
  const tempTrend = useMemo(() => (isDataReady ? getDailyTempTrend(dataset!.rows) : []), [dataset, isDataReady]);
  const rainfallTrend = useMemo(() => (isDataReady ? getDailyRainfallTrend(dataset!.rows) : []), [dataset, isDataReady]);

  const weatherImpactData = useMemo(() => {
    if (!summary) return [];
    return summary.wasteByWeather.map((w) => ({
      type: w.type,
      'Avg Waste (kg)': w.avgWaste,
      'Avg Sales': w.avgSales,
    }));
  }, [summary]);

  const insight = useMemo(() => {
    if (!summary) return '';
    const rainy = summary.wasteByWeather.find(w => w.type === 'Rainy');
    const moderate = summary.wasteByWeather.find(w => w.type === 'Moderate');
    if (rainy && moderate && moderate.avgWaste > 0) {
      const pct = Math.round(((rainy.avgWaste - moderate.avgWaste) / moderate.avgWaste) * 100);
      if (pct > 0) return `Rainy days increase food waste by ${pct}% compared to moderate weather.`;
    }
    const hot = summary.wasteByWeather.find(w => w.type === 'Hot');
    if (hot && moderate && moderate.avgWaste > 0) {
      const pct = Math.round(((hot.avgWaste - moderate.avgWaste) / moderate.avgWaste) * 100);
      if (pct > 0) return `Hot weather increases spoilage by ${pct}% — prioritize cold storage.`;
    }
    return 'Weather conditions are within normal parameters for waste levels.';
  }, [summary]);

  if (!isDataReady) return <NoDataMessage />;

  return (
    <div className="space-y-6">
      <PageHeader title="Weather Analytics" description="Impact of weather patterns on kitchen waste and sales" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Hot Days" value={summary!.hotDays} subtitle={`>30°C threshold`} icon={Sun} variant="warning" />
        <KPICard title="Rainy Days" value={summary!.rainyDays} subtitle="Rainfall > 0mm" icon={CloudRain} variant="info" />
        <KPICard title="Winter Days" value={summary!.winterDays} subtitle="<15°C threshold" icon={Snowflake} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Daily Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tempTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              <Line type="monotone" dataKey="temp" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Rainfall Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rainfallTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="rainfall" fill="hsl(200 80% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
        <h3 className="font-display font-semibold text-sm mb-4">Weather Impact on Sales & Waste</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weatherImpactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
            <Legend />
            <Bar dataKey="Avg Sales" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg Waste (kg)" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Seasonal Impact Insight</h3>
        </div>
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm leading-relaxed">{insight}</p>
        </div>
      </motion.div>
    </div>
  );
}
