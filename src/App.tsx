import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoonIcon, SunIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { type MetricKey, type ForecastData } from './types'
import { useWeatherData } from './hooks/useWeatherData'
import { useDarkMode } from './hooks/useDarkMode'
import { SummaryCards } from './components/SummaryCards'
import { MainChart } from './components/MainChart'
import { RankingsTable } from './components/RankingsTable'
import { ScatterPlot } from './components/ScatterPlot'
import { YearDetails } from './components/YearDetails'
import { ForecastPanel } from './components/ForecastPanel'
import { STRESS_CATEGORIES } from './utils/categories'

export default function App() {
  const { data, loading, error, loadFile } = useWeatherData('/peachtree-start-conditions.csv')
  const [isDark, toggleDark] = useDarkMode()

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['tempF', 'dewPointF'])
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [showForecast, setShowForecast] = useState(true)

  // Drag-and-drop
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current++
    if (e.dataTransfer.items[0]?.type === 'text/csv' || e.dataTransfer.items[0]?.kind === 'file') {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      loadFile(file)
      setSelectedYear(null)
      setForecast(null)
    }
  }, [loadFile])

  const toggleMetric = useCallback((key: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    )
  }, [])

  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(prev => (prev === year ? null : year))
  }, [])

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-navy-950"
      onDragEnter={handleDragEnter}
      onDragOver={e => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Drag Overlay ── */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-peachtree-500/10 backdrop-blur-sm"
            style={{ border: '3px dashed #cb333b' }}
          >
            <CloudArrowUpIcon className="h-16 w-16 text-peachtree-500 mb-3" />
            <p className="text-xl font-bold text-peachtree-600 dark:text-peachtree-400">Drop CSV to reload</p>
            <p className="text-sm text-indigo-400 mt-1">Replaces current dataset</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="header-gradient border-b border-peachtree-700/40 sticky top-0 z-40 shadow-lg shadow-peachtree-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center gap-4">
              <span className="text-4xl leading-none select-none">🏃</span>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                  Peachtree Road Race
                </h1>
                <p className="text-sm font-semibold text-peachtree-200 mt-0.5">
                  Race-Start Weather History &nbsp;·&nbsp; Atlanta, GA &nbsp;·&nbsp; July 4th &nbsp;·&nbsp; 1982–2025
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Category legend – hidden on small screens */}
              <div className="hidden lg:flex items-center gap-3">
                {STRESS_CATEGORIES.map(c => (
                  <span key={c.label} className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    {c.label}
                  </span>
                ))}
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className="rounded-lg border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
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
            <p className="text-sm text-slate-400 dark:text-slate-500">Loading weather history…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20 p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">Failed to load data: {error}</p>
            <p className="text-xs text-red-400 mt-1">Drag-and-drop a CSV file to try again</p>
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Race Start Conditions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {data.length} years of race-morning weather data · Closest observation to 7:00 AM start
              </p>
            </div>

            {/* Summary Cards */}
            <SummaryCards
              data={data}
              selectedYear={selectedYear}
              onSelectYear={handleSelectYear}
            />

            {/* Main Chart */}
            <MainChart
              data={data}
              activeMetrics={activeMetrics}
              onToggleMetric={toggleMetric}
              selectedYear={selectedYear}
              onSelectYear={handleSelectYear}
              forecast={forecast}
              showForecast={showForecast}
            />

            {/* Rankings Table */}
            <RankingsTable
              data={data}
              selectedYear={selectedYear}
              onSelectYear={handleSelectYear}
              forecast={forecast}
              showForecast={showForecast}
            />

            {/* Bottom two-column section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ScatterPlot
                data={data}
                selectedYear={selectedYear}
                onSelectYear={handleSelectYear}
                forecast={forecast}
                showForecast={showForecast}
              />
              <YearDetails
                data={data}
                selectedYear={selectedYear}
                onSelectYear={handleSelectYear}
              />
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
            <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 text-center text-xs text-slate-400 dark:text-slate-600">
              <p>
                Data sourced from{' '}
                <a href="https://www.wunderground.com" target="_blank" rel="noopener noreferrer" className="text-peachtree-400 hover:text-peachtree-500 transition-colors">
                  Weather Underground
                </a>{' '}
                · Fulton County Airport (KFTY) · Drop a new CSV anywhere on the page to reload
              </p>
            </footer>
          </motion.div>
        )}
      </main>
    </div>
  )
}

