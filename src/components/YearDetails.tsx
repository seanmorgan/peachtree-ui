import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { type WeatherRecord, METRIC_CONFIGS } from '../types'
import { StressBadge } from './StressBadge'
import { getRankForRecord, getRecordId, getRecordLabel, getOrdinal } from '../utils/calculations'
import { getConditionEmoji } from '../utils/categories'
import {SHIRT_COLORS} from "../utils/shirtColors.ts";

interface Props {
  data: WeatherRecord[]
  selectedId: string | null
  onSelectId: (id: string) => void
}

const DISPLAY_METRICS = METRIC_CONFIGS.map(m => m.key)

export function YearDetails({ data, selectedId, onSelectId }: Props) {
  const record = useMemo(
    () => (selectedId ? data.find(r => getRecordId(r) === selectedId) ?? null : null),
    [data, selectedId],
  )

  const rankings = useMemo(() => {
    if (!record) return {}
    const id = getRecordId(record)
    return Object.fromEntries(
      DISPLAY_METRICS.map(k => [k, getRankForRecord(data, id, k)])
    )
  }, [record, data])

  // Build dropdown options sorted newest-first; sub-years appear as separate entries
  const dropdownOptions = useMemo(() =>
    [...data]
      .sort((a, b) => b.year !== a.year ? b.year - a.year : (b.subYear || '').localeCompare(a.subYear || ''))
      .map(r => ({ id: getRecordId(r), label: getRecordLabel(r) })),
  [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Year Details</h2>
          <p className="text-xs text-slate-400">
            Explore any year's conditions & historical rankings
          </p>
        </div>
        <select
          value={selectedId ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-peachtree-500"
        >
          <option value="" disabled>Select year…</option>
          {dropdownOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {!record ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <span className="text-4xl mb-3">🏃</span>
          <p className="text-sm font-medium">Select a year to see details</p>
          <p className="text-xs mt-1">Click any chart point, table row, or use the dropdown above</p>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Year badge + condition */}
          <div className="flex items-center gap-4 flex-wrap">
            {SHIRT_COLORS[record.year] ? (
            <span
                className="inline-block h-4 w-4 rounded-full"
                style={{
                  backgroundColor: SHIRT_COLORS[record.year].hex,
                  borderColor: SHIRT_COLORS[record.year].ringerHex ?? 'rgb(0 0 0 / 0.10)',
                  borderWidth: SHIRT_COLORS[record.year].ringerHex ? '3px' : '1px',
                }}
            />) : <></>}
            <span className="text-3xl font-bold text-slate-900">{getRecordLabel(record)}</span>
            <StressBadge score={record.runnerStressScore} size="lg" />
            <span className="text-sm text-slate-500">
              {getConditionEmoji(record.condition)} {record.condition}
            </span>
            {record.wind !== 'CALM' && record.windSpeedMph > 0 && (
              <span className="text-sm text-slate-500">
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
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <p className="text-xs text-slate-400 font-medium">{m.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {val.toFixed(m.decimals)}{m.unit}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: m.color }}>
                    {getOrdinal(rank)} of {total}{rank === 1 && ' 🔥'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Additional details */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              More Details
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-slate-700">{record.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Obs. Time</p>
                <p className="font-medium text-slate-700">{record.time}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Start Time</p>
                <p className="font-medium text-slate-700">{record.targetTime || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Precip</p>
                <p className="font-medium text-slate-700">
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
              className="inline-flex items-center gap-1 text-xs text-peachtree-500 hover:text-peachtree-600 transition-colors"
            >
              View source data ↗
            </a>
          )}
        </div>
      )}
    </motion.div>
  )
}
