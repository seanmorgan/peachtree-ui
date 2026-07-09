import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { type MetricKey, type ForecastData } from './types'
import { SHIRT_COLORS } from './utils/shirtColors'
import { useWeatherData } from './hooks/useWeatherData'
import { useActiveSection } from './hooks/useActiveSection'
import { SummaryCards } from './components/SummaryCards'
import { MainChart } from './components/MainChart'
import { RankingsTable } from './components/RankingsTable'
import { ScatterPlot } from './components/ScatterPlot'
import { YearDetails } from './components/YearDetails'
import { ForecastPanel } from './components/ForecastPanel'
import { ShirtColorPieChart } from './components/ShirtColorPieChart'
import { InfoModal } from './components/InfoModal'
import {getUniqueYearCount} from "./utils/calculations.ts";

const NAV_ITEMS = [
  { id: 'section-explorer', label: 'Highlights',          shortLabel: 'Highlights'  },
  { id: 'section-history',  label: 'Historical Trends',   shortLabel: 'Trends'      },
  { id: 'section-rankings', label: 'Historical Rankings', shortLabel: 'Rankings'    },
  { id: 'section-whatif',   label: 'What-If Simulator',   shortLabel: 'What-If'     },
  { id: 'section-shirts',   label: 'Shirt Color Archive', shortLabel: 'Shirts'      },
] as const

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Returns true when hex color has enough luminance for dark text to be readable on top. */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 140
}

const DEFAULT_BG = '#f8fafc' // Tailwind slate-50
const SECTION_IDS = NAV_ITEMS.map(n => n.id)

export default function App() {
  const { data, loading, error } = useWeatherData('/peachtree-start-conditions.csv')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['tempF', 'dewPointF'])
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [showForecast, setShowForecast] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  const activeSection = useActiveSection(SECTION_IDS)

  const toggleMetric = useCallback((key: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    )
  }, [])

  const handleSelectId = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id))
    // Clear any active forecast when a year is selected so lines don't overlap
    setForecast(null)
  }, [])

  const handleForecastChange = useCallback((f: ForecastData | null) => {
    setForecast(f)
    // Deselect any chosen year so only the forecast lines appear on the chart
    if (f !== null) setSelectedId(null)
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

      {/* ── Header / Nav ── */}
      <header className="header-gradient border-b border-peachtree-700/40 sticky top-0 z-40 shadow-lg shadow-peachtree-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between gap-2">

            {/* Left: nav links */}
            <nav className="flex items-center gap-0.5 sm:gap-1 min-w-0 overflow-x-auto" aria-label="Page sections">
              {NAV_ITEMS.map(({ id, label, shortLabel }) => {
                const isActive = activeSection === id
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={[
                      'relative flex-shrink-0 px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-medium rounded transition-colors duration-150 whitespace-nowrap',
                      isActive
                        ? 'text-white'
                        : 'text-peachtree-200 hover:text-white',
                    ].join(' ')}
                  >
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className="hidden sm:inline">{label}</span>
                    {/* active underline indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 sm:left-2.5 sm:right-2.5 h-0.5 rounded-full bg-white" />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Right: attribution + info */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="hidden lg:inline text-xs text-peachtree-300">
                Created by Sean Morgan
              </span>
              <a
                href="https://github.com/seanmorgan/peachtree-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline text-xs text-peachtree-200 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="mailto:websean.com@gmail.com"
                className="hidden sm:inline text-xs text-peachtree-200 hover:text-white transition-colors"
              >
                Feedback
              </a>
              <button
                onClick={() => setShowInfo(true)}
                className="text-xs text-peachtree-200 hover:text-white transition-colors"
                aria-label="About this dashboard"
              >
                Info
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
            {/* ── Section: Explorer (Summary Cards + title) ── */}
            <section id="section-explorer" className="scroll-mt-14">
              <div className="mb-6">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: TITLE_COLOR, transition: 'color 800ms ease-in-out' }}
                >
                  Peachtree Road Race Weather Archive
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: SUBTITLE_COLOR, transition: 'color 800ms ease-in-out' }}
                >
                  {getUniqueYearCount(data)} years of race-start weather. Every finisher shirt color. Historical rankings, interactive tools, and race-day insights—all in one place.
                </p>
              </div>
              <SummaryCards data={data} selectedId={selectedId} onSelectId={handleSelectId} />
            </section>

            {/* ── Section: History (Main Chart + Scatter + Year Details) ── */}
            <section id="section-history" className="scroll-mt-14 space-y-6">
              <MainChart
                data={data}
                activeMetrics={activeMetrics}
                onToggleMetric={toggleMetric}
                selectedId={selectedId}
                onSelectId={handleSelectId}
                forecast={forecast}
                showForecast={showForecast}
              />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:h-[580px]">
                <ScatterPlot
                  data={data}
                  selectedId={selectedId}
                  onSelectId={handleSelectId}
                  forecast={forecast}
                  showForecast={showForecast}
                />
                <YearDetails data={data} selectedId={selectedId} onSelectId={handleSelectId} />
              </div>
            </section>

            {/* ── Section: Rankings ── */}
            <section id="section-rankings" className="scroll-mt-14">
              <RankingsTable
                data={data}
                selectedId={selectedId}
                onSelectId={handleSelectId}
                forecast={forecast}
                showForecast={showForecast}
              />
            </section>

            {/* ── Section: What-If Simulator ── */}
            <section id="section-whatif" className="scroll-mt-14">
              <ForecastPanel
                data={data}
                forecast={forecast}
                showForecast={showForecast}
                onForecastChange={handleForecastChange}
                onToggleShowForecast={() => setShowForecast(p => !p)}
              />
            </section>

            {/* ── Section: Shirts ── */}
            <section id="section-shirts" className="scroll-mt-14">
              <ShirtColorPieChart />
            </section>


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

