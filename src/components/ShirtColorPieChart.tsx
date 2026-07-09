import { useState, useMemo, useRef, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { motion } from 'framer-motion'
import { SHIRT_COLORS } from '../utils/shirtColors'

// Representative vivid hex for each color family (used as the slice fill)
const FAMILY_REPRESENTATIVE: Record<string, string> = {
  White:  '#FAFAFA',
  Gray:   '#AEB4B9',
  Yellow: '#F2C94C',
  Peach:  '#F6A67A',
  Orange: '#F2994A',
  Red:    '#D64545',
  Green:  '#BFD95A',
  Teal:   '#2D9C9C',
  Blue:   '#5C8EF5',
  Purple: '#AEB8F4',
  Black:  '#3A3A3A',
}

// Display order for the legend / slices (rough hue wheel, neutrals last)
const FAMILY_ORDER: Record<string, number> = {
  Red:    1,
  Orange: 2,
  Peach:  3,
  Yellow: 4,
  Green:  5,
  Teal:   6,
  Blue:   7,
  Purple: 8,
  White:  9,
  Gray:   10,
  Black:  11,
}

// ─── Year range formatter ──────────────────────────────────────────────────────
/** Collapses consecutive runs of >3 years into "start–end"; shorter runs stay as individual years. */
function formatYearRanges(years: number[]): string {
  if (!years.length) return ''
  const sorted = [...years].sort((a, b) => a - b)
  const parts: string[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++
    const runLen = j - i + 1
    if (runLen > 3) {
      parts.push(`${sorted[i]}–${sorted[j]}`)
    } else {
      for (let k = i; k <= j; k++) parts.push(String(sorted[k]))
    }
    i = j + 1
  }
  return parts.join(', ')
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const { name, value, years } = payload[0].payload as PieEntry
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur px-4 py-3 min-w-[160px]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block h-3 w-3 rounded-full flex-shrink-0 border border-black/10"
          style={{ background: FAMILY_REPRESENTATIVE[name] ?? '#ccc' }}
        />
        <span className="text-sm font-bold text-slate-900">{name}</span>
      </div>
      <p className="text-xs text-slate-500">
        <span className="font-semibold text-slate-800">{value}</span> race{value !== 1 ? 's' : ''}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{formatYearRanges(years)}</p>
    </div>
  )
}

// ─── Custom Legend ─────────────────────────────────────────────────────────────
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string; payload: PieEntry }> }) {
  if (!payload?.length) return null
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {payload.map(entry => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 border border-black/10"
            style={{ background: entry.color }}
          />
          <span className="font-medium">{entry.value}</span>
          <span className="text-slate-400">({entry.payload.value})</span>
        </li>
      ))}
    </ul>
  )
}

interface PieEntry {
  name: string
  value: number
  years: number[]
}

export function ShirtColorPieChart() {
  const [hoveredFamily, setHoveredFamily] = useState<string | null>(null)
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // Clear click-locked selection when the user clicks outside this card
  useEffect(() => {
    if (!selectedFamily) return
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedFamily(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [selectedFamily])

  // Hover takes precedence over click-selection for the swatch filter
  const activeFamily = hoveredFamily ?? selectedFamily

  const pieData: PieEntry[] = useMemo(() => {
    const familyMap = new Map<string, { count: number; years: number[] }>()

    for (const [yearStr, info] of Object.entries(SHIRT_COLORS)) {
      const year = Number(yearStr)
      const existing = familyMap.get(info.colorFamily)
      if (existing) {
        existing.count++
        existing.years.push(year)
      } else {
        familyMap.set(info.colorFamily, { count: 1, years: [year] })
      }
    }

    return Array.from(familyMap.entries())
      .map(([name, { count, years }]) => ({ name, value: count, years: years.sort() }))
      .sort((a, b) => (FAMILY_ORDER[a.name] ?? 99) - (FAMILY_ORDER[b.name] ?? 99))
  }, [])

  const totalYears = useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData])

  const allSwatches = useMemo(
    () => Object.entries(SHIRT_COLORS).sort(([a], [b]) => Number(a) - Number(b)),
    [],
  )

  // Count of years in the active family (for the label only — all swatches stay in the DOM)
  const activeCount = useMemo(
    () => activeFamily ? pieData.find(d => d.name === activeFamily)?.value ?? 0 : totalYears,
    [activeFamily, pieData, totalYears],
  )

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          👕 Shirt Color Archive
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Color-family breakdown across all 56 race years (there was no finisher shirt in 1970!).
          Early ringer shirts are shown with colored outlines.
        </p>
      </div>

      <div className="px-5 py-5">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="45%"
              innerRadius="38%"
              outerRadius="65%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              animationBegin={100}
              animationDuration={900}
              animationEasing="ease-out"
              labelLine={false}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(data: PieEntry) => setHoveredFamily(data.name)}
              onMouseLeave={() => setHoveredFamily(null)}
              onClick={(data: PieEntry) =>
                setSelectedFamily(prev => (prev === data.name ? null : data.name))
              }
            >
              {pieData.map(entry => {
                const isActive = activeFamily === entry.name
                const isDimmed = activeFamily !== null && !isActive
                return (
                  <Cell
                    key={entry.name}
                    fill={FAMILY_REPRESENTATIVE[entry.name] ?? '#cbd5e1'}
                    stroke={isActive ? '#475569' : entry.name === 'White' ? '#e2e8f0' : 'transparent'}
                    strokeWidth={isActive ? 2 : entry.name === 'White' ? 1 : 0}
                    opacity={isDimmed ? 0.25 : 1}
                  />
                )
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Colour swatches */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {activeFamily
                ? `${activeFamily} · ${activeCount} year${activeCount !== 1 ? 's' : ''}`
                : 'All shirt colors by year'}
            </p>
            {selectedFamily && !hoveredFamily && (
              <button
                onClick={() => setSelectedFamily(null)}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* All swatches stay in the DOM — only opacity animates, so the container never resizes */}
          <div className="flex flex-wrap gap-2">
            {allSwatches.map(([yearStr, info], i) => {
              const isVisible = !activeFamily || info.colorFamily === activeFamily
              return (
                <motion.div
                  key={yearStr}
                  animate={{ opacity: isVisible ? 1 : 0.10 }}
                  transition={{
                    duration: isVisible ? 0.55 : 0.3,
                    ease: 'easeInOut',
                    delay: isVisible ? i * 0.012 : 0,
                  }}
                  title={`${yearStr} · ${info.name}`}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span
                      className="h-6 w-6 rounded-full border shadow-sm"
                      style={{
                        backgroundColor: info.hex,
                        borderColor: info.ringerHex ?? 'rgb(0 0 0 / 0.10)',
                        borderWidth: info.ringerHex ? '3px' : '1px',
                      }}
                  />

                  <span className="text-[10px] text-slate-400 leading-none">{yearStr}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
