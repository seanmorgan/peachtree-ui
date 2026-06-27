import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  type TooltipProps,
} from 'recharts'
import { motion } from 'framer-motion'
import { type WeatherRecord, type ForecastData } from '../types'
import { getStressCategory, getConditionEmoji } from '../utils/categories'

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ScatterTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as WeatherRecord & { isForecast?: boolean }
  const cat = getStressCategory(d.runnerStressScore ?? 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 min-w-[160px]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {d.isForecast ? '📍 Forecast' : `${d.year}`}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
          style={{ background: cat.color }}
        >
          {cat.emoji} {cat.label}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Temp</span>
          <span className="font-semibold text-slate-900 dark:text-white">{d.tempF}°F</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Dew Point</span>
          <span className="font-semibold text-slate-900 dark:text-white">{d.dewPointF}°F</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Humidity</span>
          <span className="font-semibold text-slate-900 dark:text-white">{d.humidityPct}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Heat Index</span>
          <span className="font-semibold text-slate-900 dark:text-white">{d.heatIndexF}°F</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Stress</span>
          <span className="font-semibold text-slate-900 dark:text-white">{d.runnerStressScore?.toFixed(1)}</span>
        </div>
        {d.condition && (
          <div className="mt-1 border-t border-slate-100 pt-1 text-slate-400 dark:border-slate-700 dark:text-slate-500">
            {getConditionEmoji(d.condition)} {d.condition}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Custom Dot ───────────────────────────────────────────────────────────────
interface DotProps {
  cx?: number
  cy?: number
  payload?: WeatherRecord & { isForecast?: boolean }
  selectedYear: number | null
  onSelectYear: (y: number) => void
}

function CustomDot({ cx = 0, cy = 0, payload, selectedYear, onSelectYear }: DotProps) {
  if (!payload) return null
  const cat = getStressCategory(payload.runnerStressScore ?? 0)
  const isSelected = payload.year === selectedYear

  if (payload.isForecast) {
    // Diamond shape for forecast
    const size = 9
    return (
      <g
        transform={`translate(${cx},${cy}) rotate(45)`}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          fill="#f59e0b"
          stroke="#fff"
          strokeWidth={2}
        />
      </g>
    )
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 7 : 5}
      fill={cat.color}
      stroke={isSelected ? '#fff' : 'transparent'}
      strokeWidth={2.5}
      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
      onClick={() => onSelectYear(payload.year)}
      opacity={0.85}
    />
  )
}

// ─── Scatter Plot ─────────────────────────────────────────────────────────────
interface Props {
  data: WeatherRecord[]
  selectedYear: number | null
  onSelectYear: (year: number) => void
  forecast: ForecastData | null
  showForecast: boolean
}

export function ScatterPlot({ data, selectedYear, onSelectYear, forecast, showForecast }: Props) {
  const scatterData = useMemo(
    () => data.map(r => ({ ...r })),
    [data],
  )

  const forecastPoint = useMemo(() => {
    if (!forecast || !showForecast) return []
    return [{ ...forecast, year: 0, isForecast: true, condition: '', wind: '', windSpeedMph: 0, windGustMph: 0, pressureIn: 0, precipIn: 0, date: '', time: '', targetTime: '', minutesFromTarget: 0, sourceUrl: '' }]
  }, [forecast, showForecast])

  // Quadrant averages for reference lines
  const avgTemp = data.reduce((s, r) => s + r.tempF, 0) / data.length
  const avgDew = data.reduce((s, r) => s + r.dewPointF, 0) / data.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Temperature vs. Dew Point
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Upper-right = most brutal · Color = runner stress · Click any point to explore
        </p>
      </div>

      <div className="px-2 pb-4 pt-4">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
            />
            <XAxis
              dataKey="tempF"
              type="number"
              name="Temperature"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-400 dark:text-slate-500"
              tickLine={false}
              axisLine={false}
              label={{ value: 'Temperature (°F)', position: 'insideBottom', offset: -4, fontSize: 11, fill: 'currentColor', className: 'text-slate-400 dark:text-slate-500' }}
            />
            <YAxis
              dataKey="dewPointF"
              type="number"
              name="Dew Point"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-400 dark:text-slate-500"
              tickLine={false}
              axisLine={false}
              width={38}
              label={{ value: 'Dew Point (°F)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'currentColor' }}
            />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Average reference lines */}
            <ReferenceLine
              x={avgTemp}
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth={1}
              className="text-slate-200 dark:text-slate-700"
            />
            <ReferenceLine
              y={avgDew}
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth={1}
              className="text-slate-200 dark:text-slate-700"
            />

            {/* Historical data */}
            <Scatter
              data={scatterData}
              onClick={(d: unknown) => onSelectYear((d as WeatherRecord).year)}
              shape={(props: unknown) => {
                const p = props as { cx?: number; cy?: number; payload?: WeatherRecord }
                return (
                  <CustomDot
                    cx={p.cx}
                    cy={p.cy}
                    payload={p.payload}
                    selectedYear={selectedYear}
                    onSelectYear={onSelectYear}
                  />
                )
              }}
              isAnimationActive
              animationDuration={800}
            />

            {/* Forecast point */}
            {forecastPoint.length > 0 && (
              <Scatter
                data={forecastPoint}
                shape={(props: unknown) => {
                  const p = props as { cx?: number; cy?: number; payload?: WeatherRecord & { isForecast?: boolean } }
                  return (
                    <CustomDot
                      cx={p.cx}
                      cy={p.cy}
                      payload={p.payload}
                      selectedYear={null}
                      onSelectYear={() => {}}
                    />
                  )
                }}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {['Comfortable', 'Warm', 'Hot', 'Brutal', 'Historic'].map((label, i) => {
          const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7']
          const emojis = ['🟢', '🟡', '🟠', '🔴', '🟣']
          return (
            <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />
              {emojis[i]} {label}
            </span>
          )
        })}
        {showForecast && forecast && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-2">
            <span className="h-2.5 w-2.5 rotate-45 inline-block" style={{ background: '#f59e0b' }} />
            📍 Forecast
          </span>
        )}
      </div>
    </motion.div>
  )
}


