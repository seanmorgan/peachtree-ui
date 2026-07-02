// ─── Core Data Record ───────────────────────────────────────────────────────

export interface WeatherRecord {
  year: number
  subYear: string        // empty string for normal years; "2021a"/"2021b" for multi-day races
  date: string
  time: string
  targetTime: string
  minutesFromTarget: number
  tempF: number
  dewPointF: number
  humidityPct: number
  heatIndexF: number
  runnerStressScore: number
  wind: string
  windSpeedMph: number
  windGustMph: number
  pressureIn: number
  precipIn: number
  condition: string
  sourceUrl: string
}

// ─── Forecast ───────────────────────────────────────────────────────────────

export interface ForecastData {
  tempF: number
  dewPointF: number
  humidityPct: number
  heatIndexF: number
  windSpeedMph: number
  runnerStressScore: number
}

// ─── Metrics ────────────────────────────────────────────────────────────────

export type MetricKey = 'tempF' | 'dewPointF' | 'runnerStressScore' | 'humidityPct'

export interface MetricConfig {
  key: MetricKey
  label: string
  shortLabel: string
  unit: string
  color: string
  decimals: number
}

export const METRIC_CONFIGS: MetricConfig[] = [
  { key: 'tempF',             label: 'Temperature',  shortLabel: 'Temp',    unit: '°F', color: '#f97316', decimals: 1 },
  { key: 'dewPointF',         label: 'Dew Point',    shortLabel: 'Dew',     unit: '°F', color: '#3b82f6', decimals: 1 },
  { key: 'humidityPct',       label: 'Humidity',     shortLabel: 'Humidity',unit: '%',  color: '#06b6d4', decimals: 0 },
  { key: 'runnerStressScore', label: 'Stress Score', shortLabel: 'Stress',  unit: '',   color: '#a855f7', decimals: 1 },
]

export const METRIC_MAP: Record<MetricKey, MetricConfig> = Object.fromEntries(
  METRIC_CONFIGS.map(c => [c.key, c])
) as Record<MetricKey, MetricConfig>

// ─── Stress Categories ───────────────────────────────────────────────────────

export interface StressCategory {
  label: string
  emoji: string
  color: string
  bg: string
  text: string
  border: string
  min: number
  max: number
}

// ─── Sort ────────────────────────────────────────────────────────────────────

export type SortField =
  | 'rank'
  | 'year'
  | 'tempF'
  | 'dewPointF'
  | 'humidityPct'
  | 'runnerStressScore'
  | 'windSpeedMph'
  | 'condition'

export type SortDir = 'asc' | 'desc'

