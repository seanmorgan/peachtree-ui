import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { type WeatherRecord, METRIC_CONFIGS } from '../types'
import { StressBadge } from './StressBadge'
import { getRankForYear, getOrdinal } from '../utils/calculations'
import { getConditionEmoji } from '../utils/categories'

interface Props {
  data: WeatherRecord[]
  selectedYear: number | null
  onSelectYear: (year: number) => void
}

const DISPLAY_METRICS = METRIC_CONFIGS.map(m => m.key)

export function YearDetails({ data, selectedYear, onSelectYear }: Props) {
  const record = useMemo(
    () => (selectedYear ? data.find(r => r.year === selectedYear) ?? null : null),
    [data, selectedYear],
  )

  const rankings = useMemo(() => {
    if (!record) return {}
    return Object.fromEntries(
      DISPLAY_METRICS.map(k => [k, getRankForYear(data, record.year, k)])
    )
  }, [record, data])

  const years = useMemo(() => data.map(r => r.year).sort((a, b) => b - a), [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-2xl border border-slate-200 bg-white dark:border-navy-800 dark:bg-navy-900 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Year Details</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Explore any year's conditions & historical rankings
          </p>
        </div>
        <select
          value={selectedYear ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectYear(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-peachtree-500 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-300 dark:hover:border-navy-600"
        >
          <option value="" disabled>Select year…</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {!record ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
          <span className="text-4xl mb-3">🏃</span>
          <p className="text-sm font-medium">Select a year to see details</p>
          <p className="text-xs mt-1">Click any chart point, table row, or use the dropdown above</p>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Year badge + condition */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{record.year}</span>
            <StressBadge score={record.runnerStressScore} size="lg" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {getConditionEmoji(record.condition)} {record.condition}
            </span>
            {record.wind !== 'CALM' && record.windSpeedMph > 0 && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                💨 {record.wind} {record.windSpeedMph} mph
              </span>
            )}
          </div>

          {/* Main metrics grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {METRIC_CONFIGS.map(m => {
              const val = record[m.key] as number
              const rank = rankings[m.key]
              const total = data.length
              return (
                <div
                  key={m.key}
                  className="rounded-xl border border-slate-100 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/50 p-3"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: m.color }}
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{m.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {val.toFixed(m.decimals)}{m.unit}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: m.color }}>
                    {getOrdinal(rank)} of {total}
                    {rank === 1 && ' 🔥'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Additional details */}
          <div className="rounded-xl border border-slate-100 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              More Details
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{record.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Obs. Time</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{record.time}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Pressure</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{record.pressureIn} in</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Precip</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {record.precipIn === 0 ? 'None' : `${record.precipIn} in`}
                </p>
              </div>
            </div>
          </div>

          {/* Source link */}
          {record.sourceUrl && (
            <a
              href={record.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-peachtree-500 hover:text-peachtree-600 dark:text-peachtree-400 dark:hover:text-peachtree-300 transition-colors"
            >
              View source data ↗
            </a>
          )}
        </div>
      )}
    </motion.div>
  )
}


