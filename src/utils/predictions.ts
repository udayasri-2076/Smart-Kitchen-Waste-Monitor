import {
  SalesDataRow,
  PredictionResult,
  KPIData,
  WeatherSummary,
  HOT_THRESHOLD,
  WINTER_THRESHOLD,
  WASTE_COST_PER_KG,
} from '@/types/data';

export function computeKPIs(rows: SalesDataRow[]): KPIData {
  const totalSales = rows.reduce((s, r) => s + r.quantitySold, 0);
  const totalWaste = rows.reduce((s, r) => s + r.wasteQuantity, 0);
  const uniqueDays = new Set(rows.map((r) => r.date)).size;
  const dailySales = uniqueDays > 0 ? totalSales / uniqueDays : 0;
  const dailyWaste = uniqueDays > 0 ? totalWaste / uniqueDays : 0;

  const wasteRatio = totalSales > 0 ? totalWaste / totalSales : 0;
  const optimizedWasteRatio = wasteRatio * 0.72;
  const reductionPct = wasteRatio > 0 ? ((wasteRatio - optimizedWasteRatio) / wasteRatio) * 100 : 0;

  return {
    totalDailySales: Math.round(dailySales),
    predictedWaste: Math.round(dailyWaste * 10) / 10,
    recommendedOrderQty: Math.round(dailySales * (1 - optimizedWasteRatio)),
    wasteReductionPct: Math.round(reductionPct * 10) / 10,
    projectedSavings: Math.round(dailyWaste * reductionPct / 100 * WASTE_COST_PER_KG * 30),
  };
}

export function runPredictions(rows: SalesDataRow[]): PredictionResult[] {
  const itemMap = new Map<string, SalesDataRow[]>();
  rows.forEach((r) => {
    const arr = itemMap.get(r.itemName) || [];
    arr.push(r);
    itemMap.set(r.itemName, arr);
  });

  const results: PredictionResult[] = [];

  itemMap.forEach((itemRows, itemName) => {
    const avgSales = itemRows.reduce((s, r) => s + r.quantitySold, 0) / itemRows.length;
    const avgWaste = itemRows.reduce((s, r) => s + r.wasteQuantity, 0) / itemRows.length;
    const avgTemp = itemRows.reduce((s, r) => s + r.temperature, 0) / itemRows.length;
    const avgRainfall = itemRows.reduce((s, r) => s + r.rainfall, 0) / itemRows.length;

    const wasteRatio = avgSales > 0 ? avgWaste / avgSales : 0;

    // Simple prediction: reduce waste by adjusting order
    const tempFactor = avgTemp > HOT_THRESHOLD ? 1.12 : avgTemp < WINTER_THRESHOLD ? 0.9 : 1;
    const rainFactor = avgRainfall > 5 ? 0.88 : avgRainfall > 0 ? 0.95 : 1;

    const predictedWaste = avgWaste * tempFactor * rainFactor;
    const optimalOrder = Math.round(avgSales * (1 - wasteRatio * 0.5) * tempFactor * rainFactor);

    const factors: string[] = [];
    if (avgTemp > HOT_THRESHOLD) factors.push('High temperature increases spoilage');
    if (avgRainfall > 5) factors.push('Heavy rainfall reduces footfall');
    if (avgRainfall > 0 && avgRainfall <= 5) factors.push('Light rainfall slightly affects demand');
    if (wasteRatio > 0.2) factors.push('High historical waste ratio');

    let recommendation: 'Increase' | 'Decrease' | 'Maintain' = 'Maintain';
    if (optimalOrder < avgSales * 0.9) recommendation = 'Decrease';
    else if (optimalOrder > avgSales * 1.1) recommendation = 'Increase';

    const confidence = Math.min(95, 60 + itemRows.length * 2);
    const profitImpact = (avgWaste - predictedWaste * 0.72) * WASTE_COST_PER_KG * 30;

    results.push({
      itemName,
      predictedWaste: Math.round(predictedWaste * 10) / 10,
      confidenceScore: Math.round(confidence),
      avgSales: Math.round(avgSales * 10) / 10,
      recommendedOrderQty: optimalOrder,
      recommendation,
      profitImpact: Math.round(profitImpact),
      factors,
    });
  });

  return results.sort((a, b) => b.predictedWaste - a.predictedWaste);
}

export function computeWeatherSummary(rows: SalesDataRow[]): WeatherSummary {
  const hotDays = new Set(rows.filter((r) => r.temperature > HOT_THRESHOLD).map((r) => r.date)).size;
  const rainyDays = new Set(rows.filter((r) => r.rainfall > 0).map((r) => r.date)).size;
  const winterDays = new Set(rows.filter((r) => r.temperature < WINTER_THRESHOLD).map((r) => r.date)).size;
  const avgTemp = rows.reduce((s, r) => s + r.temperature, 0) / (rows.length || 1);
  const totalRainfall = rows.reduce((s, r) => s + r.rainfall, 0);

  const classify = (r: SalesDataRow) => {
    if (r.rainfall > 0) return 'Rainy';
    if (r.temperature > HOT_THRESHOLD) return 'Hot';
    if (r.temperature < WINTER_THRESHOLD) return 'Winter';
    return 'Moderate';
  };

  const weatherGroups = new Map<string, { totalWaste: number; totalSales: number; count: number }>();
  rows.forEach((r) => {
    const type = classify(r);
    const g = weatherGroups.get(type) || { totalWaste: 0, totalSales: 0, count: 0 };
    g.totalWaste += r.wasteQuantity;
    g.totalSales += r.quantitySold;
    g.count++;
    weatherGroups.set(type, g);
  });

  const wasteByWeather = Array.from(weatherGroups.entries()).map(([type, g]) => ({
    type,
    avgWaste: Math.round((g.totalWaste / g.count) * 10) / 10,
    avgSales: Math.round((g.totalSales / g.count) * 10) / 10,
  }));

  return { hotDays, rainyDays, winterDays, avgTemp: Math.round(avgTemp * 10) / 10, totalRainfall: Math.round(totalRainfall), wasteByWeather };
}

export function getWeeklyWasteTrend(rows: SalesDataRow[]) {
  const dayMap = new Map<string, number>();
  rows.forEach((r) => {
    dayMap.set(r.date, (dayMap.get(r.date) || 0) + r.wasteQuantity);
  });
  const sorted = Array.from(dayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.slice(-14).map(([date, waste]) => ({ date, waste: Math.round(waste * 10) / 10 }));
}

export function getItemWasteBreakdown(rows: SalesDataRow[]) {
  const itemMap = new Map<string, number>();
  rows.forEach((r) => {
    itemMap.set(r.itemName, (itemMap.get(r.itemName) || 0) + r.wasteQuantity);
  });
  return Array.from(itemMap.entries())
    .map(([item, waste]) => ({ item, waste: Math.round(waste * 10) / 10 }))
    .sort((a, b) => b.waste - a.waste)
    .slice(0, 10);
}

export function generateAIInsight(rows: SalesDataRow[]): string {
  if (rows.length === 0) return '';
  const avgRainfall = rows.reduce((s, r) => s + r.rainfall, 0) / rows.length;
  const avgTemp = rows.reduce((s, r) => s + r.temperature, 0) / rows.length;
  const wasteRatio = rows.reduce((s, r) => s + r.wasteQuantity, 0) / (rows.reduce((s, r) => s + r.quantitySold, 0) || 1);

  const insights: string[] = [];
  if (avgRainfall > 5) insights.push(`Heavy rainfall is causing ~${Math.round(avgRainfall * 2)}% drop in footfall.`);
  if (avgTemp > HOT_THRESHOLD) insights.push(`High temperatures are increasing perishable waste by ~${Math.round((avgTemp - HOT_THRESHOLD) * 1.5)}%.`);
  if (wasteRatio > 0.15) insights.push(`Waste ratio is ${Math.round(wasteRatio * 100)}% — consider reducing orders for low-demand items.`);
  if (insights.length === 0) insights.push('Operations are running within optimal parameters.');

  return insights.join(' ');
}

export function getDailyTempTrend(rows: SalesDataRow[]) {
  const dayMap = new Map<string, { totalTemp: number; count: number }>();
  rows.forEach((r) => {
    const g = dayMap.get(r.date) || { totalTemp: 0, count: 0 };
    g.totalTemp += r.temperature;
    g.count++;
    dayMap.set(r.date, g);
  });
  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, g]) => ({ date, temp: Math.round(g.totalTemp / g.count * 10) / 10 }));
}

export function getDailyRainfallTrend(rows: SalesDataRow[]) {
  const dayMap = new Map<string, number>();
  rows.forEach((r) => {
    dayMap.set(r.date, Math.max(dayMap.get(r.date) || 0, r.rainfall));
  });
  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, rainfall]) => ({ date, rainfall }));
}
