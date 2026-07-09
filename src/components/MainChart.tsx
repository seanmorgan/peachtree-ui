import { useRef, useCallback, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  type TooltipProps,
} from 'recharts'
import html2canvas from 'html2canvas'
import { motion } from 'framer-motion'
import { type WeatherRecord, type MetricKey, type ForecastData, METRIC_MAP } from '../types'
import { ChartControls } from './ChartControls'
import { getStressCategory, getConditionEmoji } from '../utils/categories'
import { getRecordId, getRecordLabel } from '../utils/calculations'

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as WeatherRecord & { isForecast?: boolean }
  const cat = getStressCategory(d.runnerStressScore ?? 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur min-w-[180px]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-900">
          {d.isForecast ? '📍 Forecast' : `${label}`}
        </span>
        {d.runnerStressScore && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ background: cat.color }}
          >
            {cat.emoji} {cat.label}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {payload.map(p => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {METRIC_MAP[p.dataKey as MetricKey]?.label ?? p.dataKey}
            </span>
            <span className="font-semibold text-slate-900">
              {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
              {METRIC_MAP[p.dataKey as MetricKey]?.unit}
            </span>
          </div>
        ))}
        {d.condition && (
          <div className="mt-1.5 border-t border-slate-100 pt-1.5 text-xs text-slate-400">
            {getConditionEmoji(d.condition)} {d.condition}
            {d.wind && d.wind !== 'CALM' && ` · ${d.wind} ${d.windSpeedMph} mph`}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Chart ───────────────────────────────────────────────────────────────
interface Props {
  data: WeatherRecord[]
  activeMetrics: MetricKey[]
  onToggleMetric: (key: MetricKey) => void
  selectedId: string | null
  onSelectId: (id: string) => void
  forecast: ForecastData | null
  showForecast: boolean
}

export function MainChart({
  data,
  activeMetrics,
  onToggleMetric,
  selectedId,
  onSelectId,
  forecast,
  showForecast,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  // Augment each record with a unique displayId for the X-axis
  const chartData = data.map(r => ({ ...r, displayId: getRecordId(r) }))
  const yearRange = useMemo(() => (
    data.length ? { min: data[0].year, max: data[data.length - 1].year } : null
  ), [data])

  const handleDownload = useCallback(async () => {
    if (!chartRef.current) return
    const canvas = await html2canvas(chartRef.current, { backgroundColor: null })
    const link = document.createElement('a')
    link.download = `peachtree-weather-${activeMetrics.join('-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [activeMetrics])

  // ─── Y-axis domain ──────────────────────────────────────────────────────────
  const allValues = data.flatMap(r => activeMetrics.map(k => r[k] as number))
  if (forecast && showForecast) {
    activeMetrics.forEach(k => {
      const v = forecast[k as keyof ForecastData]
      if (typeof v === 'number') allValues.push(v)
    })
  }
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const pad = (maxVal - minVal) * 0.12
  const domain: [number, number] = [Math.floor(minVal - pad), Math.ceil(maxVal + pad)]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Historical Trends
          </h2>
          <p className="text-xs text-slate-400">
            7:00 AM race start{yearRange ? ` · ${yearRange.min}–${yearRange.max}` : ''}
          </p>
        </div>
        <ChartControls
          activeMetrics={activeMetrics}
          onToggleMetric={onToggleMetric}
          onDownload={handleDownload}
        />
      </div>

      {/* Chart */}
      <div ref={chartRef} className="px-2 pb-4 pt-4">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData} onClick={e => e?.activePayload?.[0] && onSelectId(getRecordId(e.activePayload[0].payload as WeatherRecord))}>
            <defs>
              {activeMetrics.map(k => (
                <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={METRIC_MAP[k].color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={METRIC_MAP[k].color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-100"
              vertical={false}
            />

            <XAxis
              dataKey="displayId"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-400"
              tickLine={false}
              axisLine={false}
              interval={4}
              tickFormatter={(v: string) => v.replace(/[a-z]$/, '')}
            />

            {/* Primary left axis — temp / dew / humidity / stress */}
            <YAxis
              domain={domain}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-400"
              tickLine={false}
              axisLine={false}
              width={38}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cb333b', strokeWidth: 1, strokeDasharray: '4 4' }} />

            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
              formatter={(value) => METRIC_MAP[value as MetricKey]?.label ?? value}
            />

            {activeMetrics.map((k, idx) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={METRIC_MAP[k].color}
                strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: WeatherRecord }
                  const isSelected = getRecordId(payload) === selectedId
                  if (!isSelected && idx !== 0) return <g key={getRecordId(payload)} />
                  return (
                    <circle
                      key={getRecordId(payload)}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5 : 3}
                      fill={METRIC_MAP[k].color}
                      stroke={isSelected ? '#fff' : 'transparent'}
                      strokeWidth={2}
                    />
                  )
                }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={800}
                animationEasing="ease-out"
                isAnimationActive
              />
            ))}

            {/* Selected record reference line */}
            {selectedId && (
              <ReferenceLine
                x={selectedId}
                stroke="#cb333b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: getRecordLabel(data.find(r => getRecordId(r) === selectedId)!), position: 'top', fontSize: 11, fill: '#cb333b' }}
              />
            )}

            {/* Forecast reference lines — one per active metric, coloured to match */}
            {forecast && showForecast &&
              activeMetrics.map(k => {
                const val = forecast[k as keyof ForecastData]
                if (typeof val !== 'number') return null
                return (
                  <ReferenceLine
                    key={`forecast-${k}`}
                    y={val}
                    stroke={METRIC_MAP[k].color}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    label={{
                      value: `📍 ${val.toFixed(1)}${METRIC_MAP[k].unit}`,
                      position: 'right',
                      fontSize: 10,
                      fill: METRIC_MAP[k].color,
                    }}
                  />
                )
              })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
