import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { type WeatherRecord, type ForecastData, METRIC_CONFIGS } from '../types'
import { StressBadge } from './StressBadge'
import { computeHeatIndex, computeRunnerStressScore, computeHumidityFromDewPoint, getForecastRank, getOrdinal } from '../utils/calculations'

interface Props {
  data: WeatherRecord[]
  forecast: ForecastData | null
  showForecast: boolean
  onForecastChange: (f: ForecastData | null) => void
  onToggleShowForecast: () => void
}

export function ForecastPanel({ data, forecast, showForecast, onForecastChange, onToggleShowForecast }: Props) {
  const [tempInput, setTempInput] = useState('')
  const [dewInput, setDewInput] = useState('')

  // Recompute whenever inputs change
  useEffect(() => {
    const temp = parseFloat(tempInput)
    const dew = parseFloat(dewInput)
    if (isNaN(temp) || isNaN(dew)) {
      onForecastChange(null)
      return
    }
    const humidity = computeHumidityFromDewPoint(temp, dew)
    const heatIndex = computeHeatIndex(temp, humidity)
    const stress = computeRunnerStressScore(heatIndex, dew)
    onForecastChange({ tempF: temp, dewPointF: dew, humidityPct: humidity, heatIndexF: heatIndex, runnerStressScore: stress })
  }, [tempInput, dewInput, onForecastChange])

  const rankInfo = forecast
    ? METRIC_CONFIGS.map(m => ({
        ...m,
        rank: getForecastRank(data, forecast[m.key as keyof ForecastData] as number, m.key),
        value: forecast[m.key as keyof ForecastData] as number,
      }))
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-slate-200 bg-white dark:border-navy-800 dark:bg-navy-900 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            📍 Peachtree <strong>What If</strong> Simulator — Plug In Your Own Forecast!
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Enter hypothetical conditions to see how they'd rank historically
          </p>
        </div>
        {forecast && (
          <button
            onClick={onToggleShowForecast}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              showForecast
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-400'
            }`}
          >
            {showForecast ? '👁 Shown on charts' : 'Show on charts'}
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Temperature (°F)
            </label>
            <input
              type="number"
              value={tempInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempInput(e.target.value)}
              placeholder="e.g. 75"
              min={50}
              max={110}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-300 focus:border-peachtree-400 focus:outline-none focus:ring-2 focus:ring-peachtree-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-peachtree-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Dew Point (°F)
            </label>
            <input
              type="number"
              value={dewInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDewInput(e.target.value)}
              placeholder="e.g. 72"
              min={30}
              max={90}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-300 focus:border-peachtree-400 focus:outline-none focus:ring-2 focus:ring-peachtree-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-peachtree-500"
            />
          </div>
        </div>

        {!forecast ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-navy-700 py-8 text-center text-slate-400 dark:text-slate-600">
            <p className="text-2xl mb-2">🌡️</p>
            <p className="text-sm">Enter temperature and dew point to see your forecast</p>
          </div>
        ) : (
          <>
            {/* Computed outputs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 dark:bg-navy-800/50 p-3 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Humidity</p>
                <p className="text-xl font-bold text-cyan-500">{forecast.humidityPct}%</p>
                <p className="text-xs text-slate-400 mt-0.5">auto-computed</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-navy-800/50 p-3 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Heat Index</p>
                <p className="text-xl font-bold text-red-500">{forecast.heatIndexF.toFixed(1)}°F</p>
                <p className="text-xs text-slate-400 mt-0.5">auto-computed</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 dark:bg-navy-800/50 p-3 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Stress Score</p>
                <p className="text-2xl font-bold text-purple-500">{forecast.runnerStressScore.toFixed(1)}</p>
                <div className="flex justify-center mt-1">
                  <StressBadge score={forecast.runnerStressScore} size="md" />
                </div>
              </div>
            </div>

            {/* Rankings */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                This forecast would rank…
              </p>
              <div className="space-y-2">
                {rankInfo.map(r => (
                  <div key={r.key} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-amber-50/60 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ background: r.color }}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{r.label}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {r.value.toFixed(r.decimals)}{r.unit}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white min-w-[52px] text-center"
                      style={{ background: r.rank === 1 ? '#f59e0b' : r.rank <= 3 ? '#cb333b' : '#94a3b8' }}
                    >
                      {getOrdinal(r.rank)}
                      {r.rank === 1 ? ' 🔥' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setTempInput('')
                setDewInput('')
                onForecastChange(null)
              }}
              className="w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 dark:border-navy-700 dark:text-slate-500 dark:hover:border-navy-600 dark:hover:text-slate-400 transition-colors"
            >
              Clear forecast
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}





