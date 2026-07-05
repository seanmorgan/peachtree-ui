import { useState, useMemo } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { type WeatherRecord, type SortField, type SortDir, type ForecastData } from '../types'
import { StressBadge } from './StressBadge'
import { getRankedData, getRecordId, getRecordLabel } from '../utils/calculations'
import { getConditionEmoji } from '../utils/categories'
import { cn } from '../utils/cn'
import {SHIRT_COLORS} from '../utils/shirtColors'

interface Props {
  data: WeatherRecord[]
  selectedId: string | null
  onSelectId: (id: string) => void
  forecast: ForecastData | null
  showForecast: boolean
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronUpIcon className="h-3 w-3 opacity-20" />
  return sortDir === 'asc'
    ? <ChevronUpIcon className="h-3 w-3 text-peachtree-500" />
    : <ChevronDownIcon className="h-3 w-3 text-peachtree-500" />
}

const COLS: Array<{ field: SortField; label: string; align?: string }> = [
  { field: 'rank', label: '#' },
  { field: 'year', label: 'Year' },
  { field: 'shirt', label: 'Shirt', align: 'center' },
  { field: 'tempF', label: 'Temp' },
  { field: 'dewPointF', label: 'Dew Pt' },
  { field: 'humidityPct', label: 'Humidity' },
  { field: 'runnerStressScore', label: 'Stress' },
  { field: 'windSpeedMph', label: 'Wind' },
  { field: 'condition', label: 'Condition', align: 'left' },
]

export function RankingsTable({ data, selectedId, onSelectId, forecast, showForecast }: Props) {
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const rankedData = useMemo(() => getRankedData(data), [data])

  const sorted = useMemo(() => {
    const base = [...rankedData]
    base.sort((a, b) => {
      let cmp: number
      if (sortField === 'rank') {
        return sortDir === 'asc' ? a.rank - b.rank : b.rank - a.rank
      }
      if (sortField === 'shirt') {
        const aColor = SHIRT_COLORS[a.year]
        const bColor = SHIRT_COLORS[b.year]

        const aSort = aColor?.displayHueOrder ?? 9999
        const bSort = bColor?.displayHueOrder ?? 9999

        cmp =
            aSort - bSort ||
            a.year - b.year
      } else {
        const av = a[sortField as keyof typeof a] as number | string
        const bv = b[sortField as keyof typeof b] as number | string
        if (typeof av === 'string' && typeof bv === 'string') {
          cmp = av.localeCompare(bv)
        } else {
          cmp = (av as number) - (bv as number)
        }
      }
      // Tiebreaker: sub-years stay chronological within the same year
      if (cmp === 0) cmp = (a.subYear || '').localeCompare(b.subYear || '')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return base
  }, [rankedData, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir(field === 'condition' || field === 'year' || field === 'shirt' ? 'asc' : 'desc')
    }
  }

  // Forecast rank for stress score
  const forecastRank = useMemo(() => {
    if (!forecast || !showForecast) return null
    const higher = data.filter(r => r.runnerStressScore > forecast.runnerStressScore)
    return higher.length + 1
  }, [forecast, showForecast, data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Historical Rankings
        </h2>
        <p className="text-xs text-slate-400">
          Click a row to explore that year · Sorted by worst conditions first
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {COLS.map(col => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className={cn(
                    'cursor-pointer select-none whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400',
                    col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right',
                    'hover:text-slate-600 transition-colors',
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.align !== 'left' && <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />}
                    {col.label}
                    {col.align === 'left' && <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Forecast row */}
            {forecast && showForecast && (
              <tr className="bg-amber-50/70">
                <td className="px-4 py-2.5 text-right font-bold text-amber-600 text-xs">
                  #{forecastRank}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    📍
                  </span>
                </td>
                {/* No shirt color for forecast */}
                <td className="px-4 py-2.5 text-center text-slate-300 text-xs">—</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-700">{forecast.tempF}°</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-700">{forecast.dewPointF}°</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-700">{forecast.humidityPct}%</td>
                <td className="px-4 py-2.5 text-right">
                  <StressBadge score={forecast.runnerStressScore} />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-500 text-xs">
                  {forecast.windSpeedMph === 0 ? 'Calm' : `${forecast.windSpeedMph} mph`}
                </td>
                <td className="px-4 py-2.5 text-left text-slate-400">—</td>
              </tr>
            )}

            {sorted.map((row) => {
              const rowId = getRecordId(row)
              const isSelected = rowId === selectedId
              return (
                <tr
                  key={rowId}
                  onClick={() => onSelectId(rowId)}
                  className={cn(
                    'cursor-pointer transition-colors duration-100',
                    isSelected
                      ? 'bg-peachtree-50 ring-1 ring-inset ring-peachtree-200'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <td className={cn('px-4 py-2.5 text-right tabular-nums text-xs font-bold',
                    row.rank === 1 ? 'text-amber-500' : row.rank <= 3 ? 'text-slate-500' : 'text-slate-300'
                  )}>
                    {`#${row.rank}`}
                  </td>
                  <td className={cn('px-4 py-2.5 text-right tabular-nums font-semibold',
                    isSelected ? 'text-peachtree-600' : 'text-slate-700'
                  )}>
                    {getRecordLabel(row)}
                  </td>
                  {/* Shirt color swatch */}
                  <td className="px-4 py-2.5 text-center">
                    {SHIRT_COLORS[row.year] ? (
                      <span
                        title={`${row.year} shirt: ${SHIRT_COLORS[row.year].name}`}
                        className="inline-block h-4 w-4 rounded-full ring-1 ring-slate-300/60"
                        style={{ backgroundColor: SHIRT_COLORS[row.year].hex }}
                      />
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{row.tempF}°</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{row.dewPointF}°</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{row.humidityPct}%</td>
                  <td className="px-4 py-2.5 text-right">
                    <StressBadge score={row.runnerStressScore} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-500 text-xs">
                    {row.wind === 'CALM' || row.windSpeedMph === 0
                      ? 'Calm'
                      : `${row.wind} ${row.windSpeedMph}`}
                  </td>
                  <td className="px-4 py-2.5 text-left text-slate-500 text-xs">
                    {getConditionEmoji(row.condition)} {row.condition}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
