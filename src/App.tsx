import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { type MetricKey, type ForecastData } from './types'
import { getUniqueYearCount } from './utils/calculations'
import { SHIRT_COLORS } from './utils/shirtColors'
import { useWeatherData } from './hooks/useWeatherData'
import { SummaryCards } from './components/SummaryCards'
import { MainChart } from './components/MainChart'
import { RankingsTable } from './components/RankingsTable'
import { ScatterPlot } from './components/ScatterPlot'
import { YearDetails } from './components/YearDetails'
import { ForecastPanel } from './components/ForecastPanel'
import { InfoModal } from './components/InfoModal'

/** Returns true when hex color has enough luminance for dark text to be readable on top. */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 140
}

const DEFAULT_BG = '#f8fafc' // Tailwind slate-50

export default function App() {
  const { data, loading, error } = useWeatherData('/peachtree-start-conditions.csv')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['tempF', 'dewPointF'])
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [showForecast, setShowForecast] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  const toggleMetric = useCallback((key: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    )
  }, [])

  const handleSelectId = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id))
  }, [])

  const yearRange = useMemo(() => (
    data.length ? { min: data[0].year, max: data[data.length - 1].year } : null
  ), [data])

  // Shirt color background: use exact shirt hex when a year is selected, default slate-50 otherwise
  const bgColor = useMemo(() => {
    if (selectedId) {
      const shirt = SHIRT_COLORS[parseInt(selectedId, 10)]
      if (shirt) return shirt.hex
    }
    return DEFAULT_BG
  }, [selectedId])

  // Whether the current background is light enough for dark text
  const isLightBg = useMemo(() => isLightColor(bgColor), [bgColor])

  const TITLE_COLOR    = isLightBg ? '#0f172a' : '#ffffff'            // slate-900 or white
  const SUBTITLE_COLOR = isLightBg ? '#64748b' : 'rgba(255,255,255,0.75)' // slate-500 or soft white

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: bgColor, transition: 'background-color 800ms ease-in-out' }}
    >
      <InfoModal open={showInfo} onClose={() => setShowInfo(false)} yearRange={yearRange ?? undefined} />

      {/* ── Header ── */}
      <header className="header-gradient border-b border-peachtree-700/40 sticky top-0 z-40 shadow-lg shadow-peachtree-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 sm:h-20 items-center justify-between gap-3 py-3 sm:py-0">
            {/* Branding */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <span className="text-2xl sm:text-4xl leading-none select-none flex-shrink-0">🏃</span>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  Peachtree Road Race Weather Archive
                </h1>
                {/* Full subtitle on sm+ */}
                <p className="hidden sm:block text-sm font-semibold text-peachtree-200 mt-0.5">
                  Race-Start Weather History &nbsp;·&nbsp; Atlanta, GA &nbsp;·&nbsp; July 4th{yearRange ? ` · ${yearRange.min}–${yearRange.max}` : ''}
                </p>
                {/* Condensed subtitle on mobile */}
                <p className="block sm:hidden text-[11px] font-medium text-peachtree-200 mt-0.5">
                  Atlanta, GA · July 4th{yearRange ? ` · ${yearRange.min}–${yearRange.max}` : ''}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Category legend – hidden on small screens */}
              <div className="hidden lg:flex items-center gap-3">
                <p className="text-sm font-semibold text-peachtree-200 mt-0.5">
                  Created by Sean Morgan • {' '}
                  <a href="https://github.com/seanmorgan/peachtree-ui" target="_blank" rel="noopener noreferrer" className="text-peachtree-400 hover:text-peachtree-500 transition-colors">
                    GitHub
                  </a>{' '} • {' '}
                  <a href="mailto:websean.com@gmail.com" target="_blank" rel="noopener noreferrer" className="text-peachtree-400 hover:text-peachtree-500 transition-colors">
                    Feedback
                  </a>{' '}
                </p>
              </div>

              {/* Info button */}
              <button
                onClick={() => setShowInfo(true)}
                className="rounded-lg border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                aria-label="About this dashboard"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="h-10 w-10 rounded-full border-4 border-peachtree-500 border-t-transparent"
            />
            <p className="text-sm text-slate-400">Loading weather history…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load data: {error}</p>
            <p className="text-xs text-red-400 mt-1">Please check the console for details.</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Page title */}
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: TITLE_COLOR, transition: 'color 800ms ease-in-out' }}
              >
                Race Start Conditions
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: SUBTITLE_COLOR, transition: 'color 800ms ease-in-out' }}
              >
                {getUniqueYearCount(data)} years of race-morning weather data{yearRange ? ` · ${yearRange.min}–${yearRange.max}` : ''} · Closest observation to 7:00 AM start
              </p>
            </div>

            {/* Summary Cards */}
            <SummaryCards data={data} selectedId={selectedId} onSelectId={handleSelectId} />

            {/* Main Chart */}
            <MainChart
              data={data}
              activeMetrics={activeMetrics}
              onToggleMetric={toggleMetric}
              selectedId={selectedId}
              onSelectId={handleSelectId}
              forecast={forecast}
              showForecast={showForecast}
            />

            {/* Rankings Table */}
            <RankingsTable
              data={data}
              selectedId={selectedId}
              onSelectId={handleSelectId}
              forecast={forecast}
              showForecast={showForecast}
            />

            {/* Bottom two-column section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ScatterPlot
                data={data}
                selectedId={selectedId}
                onSelectId={handleSelectId}
                forecast={forecast}
                showForecast={showForecast}
              />
              <YearDetails data={data} selectedId={selectedId} onSelectId={handleSelectId} />
            </div>

            {/* Forecast panel */}
            <ForecastPanel
              data={data}
              forecast={forecast}
              showForecast={showForecast}
              onForecastChange={setForecast}
              onToggleShowForecast={() => setShowForecast(p => !p)}
            />

            {/* Footer */}
            <footer
              className="border-t border-slate-200 pt-6 text-center text-xs"
              style={{ color: SUBTITLE_COLOR, transition: 'color 800ms ease-in-out' }}
            >
              <p>
                Created by Sean Morgan • {' '}
                <a href="https://github.com/seanmorgan/peachtree-ui" target="_blank" rel="noopener noreferrer" className="text-peachtree-400 hover:text-peachtree-500 transition-colors">GitHub</a>{' '} • {' '}
                <a href="mailto:websean.com@gmail.com" target="_blank" rel="noopener noreferrer" className="text-peachtree-400 hover:text-peachtree-500 transition-colors">Feedback</a>{' '}
              </p>
              <p>The website, source code, compiled dataset, and derived metrics were created and are maintained by Sean Morgan.</p>
              <p>Historical weather observations were obtained from publicly available Weather Underground historical records and processed into a race-start dataset.</p>
              <p>This website is an independent project and is not affiliated with or endorsed by the Atlanta Track Club, the Peachtree Road Race, or Weather Underground.</p>
            </footer>
          </motion.div>
        )}
      </main>
    </div>
  )
}

