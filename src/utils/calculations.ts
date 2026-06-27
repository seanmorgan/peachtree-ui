import { type WeatherRecord, type MetricKey } from '../types'

// ─── Heat Index (NWS Rothfusz regression) ────────────────────────────────────
// Valid for T >= 80°F; below that, HI = T
export function computeHeatIndex(tempF: number, humidityPct: number): number {
  if (tempF < 80) return Math.round(tempF * 10) / 10

  const T = tempF
  const R = humidityPct

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R

  // Adjustment for low humidity
  if (R < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
  }
  // Adjustment for high humidity at lower temps
  if (R > 85 && T >= 80 && T <= 87) {
    HI += ((R - 85) / 10) * ((87 - T) / 5)
  }

  return Math.round(HI * 10) / 10
}

// ─── Runner Stress Score ──────────────────────────────────────────────────────
// Derived from historical data: heatIndex + dewPoint * 1.5
export function computeRunnerStressScore(heatIndexF: number, dewPointF: number): number {
  return Math.round((heatIndexF + dewPointF * 1.5) * 10) / 10
}

// ─── Relative Humidity from Dew Point ────────────────────────────────────────
// Magnus formula
export function computeHumidityFromDewPoint(tempF: number, dewPointF: number): number {
  const tempC = (tempF - 32) * (5 / 9)
  const dewC = (dewPointF - 32) * (5 / 9)
  const a = 17.625
  const b = 243.04
  const rh = (100 * Math.exp((a * dewC) / (b + dewC))) / Math.exp((a * tempC) / (b + tempC))
  return Math.round(Math.min(100, Math.max(0, rh)))
}

// ─── Rankings ─────────────────────────────────────────────────────────────────
export function getRankedData(data: WeatherRecord[]): Array<WeatherRecord & { rank: number }> {
  return [...data]
    .sort((a, b) => b.runnerStressScore - a.runnerStressScore)
    .map((r, i) => ({ ...r, rank: i + 1 }))
}

export function getRankForYear(data: WeatherRecord[], year: number, field: MetricKey): number {
  const sorted = [...data].sort((a, b) => b[field] - a[field])
  return sorted.findIndex(r => r.year === year) + 1
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ─── Forecast Rankings ────────────────────────────────────────────────────────
export function getForecastRank(
  data: WeatherRecord[],
  value: number,
  field: MetricKey,
): number {
  const higher = data.filter(r => r[field] > value)
  return higher.length + 1
}

