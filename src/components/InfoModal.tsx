import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ClockIcon, CalendarDaysIcon, CalculatorIcon } from '@heroicons/react/24/outline'

interface Props {
  open: boolean
  onClose: () => void
  yearRange?: { min: number; max: number }
}

export function InfoModal({ open, onClose, yearRange }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Outer positioner:
              mobile  → align to bottom edge (bottom-sheet)
              sm+     → center in viewport */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none
                       sm:inset-0 sm:items-center sm:p-4"
          >
            {/* Panel: bottom-sheet on mobile, floating card on sm+ */}
            <div className="
              pointer-events-auto w-full flex flex-col
              max-h-[88dvh] sm:max-h-[min(90vh,680px)] sm:max-w-lg
              rounded-t-2xl sm:rounded-2xl
              border border-slate-200 bg-white shadow-2xl
              dark:border-navy-700 dark:bg-navy-900
            ">
              {/* Drag handle (mobile only) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
                <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-navy-600" />
              </div>

              {/* Header — fixed */}
              <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-navy-800 px-5 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">About</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-navy-800 dark:hover:text-slate-300 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-navy-800 px-5 sm:px-6">

                {/* Section 1 – Race start time */}
                <div className="py-4 sm:py-5 flex gap-3 sm:gap-4">
                  <div className="mt-0.5 flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-peachtree-50 dark:bg-peachtree-500/10 text-peachtree-600 dark:text-peachtree-400">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Why 7:00 AM?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      The Peachtree Road Race has started at different times throughout its history — as late as{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">10:00 AM in 1970</span>.
                      Over the years, the start time was moved progressively earlier to beat the heat.
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      To enable fair year-over-year comparison, this dashboard uses the weather observation{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">closest to 7:00 AM</span>{' '}
                      for every year, regardless of the actual start time that year.
                    </p>
                  </div>
                </div>

                {/* Section 2 – Data coverage */}
                <div className="py-4 sm:py-5 flex gap-3 sm:gap-4">
                  <div className="mt-0.5 flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-700/40 text-navy-600 dark:text-navy-300">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Data starts in {yearRange?.min ?? 1982}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      The Peachtree Road Race began on{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">July 4, 1970</span>,
                      but granular hourly weather observations at Fulton County Airport (KFTY) are not
                      reliably available before {yearRange?.min ?? 1982}. This dashboard therefore covers{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {yearRange ? `${yearRange.min}–${yearRange.max}` : '1982–2025'}.
                      </span>{' '}
                    </p>
                  </div>
                </div>

                {/* Section 3 – Stress Score */}
                <div className="py-4 sm:py-5 flex gap-3 sm:gap-4">
                  <div className="mt-0.5 flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <CalculatorIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      What is the Runner Stress Score?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      A composite metric designed to capture overall heat stress for runners:
                    </p>
                    <div className="mt-2 mb-2 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-navy-800 px-4 py-2.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      Score = Heat Index + (Dew Point × 1.5)
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Dew point is weighted more heavily because high atmospheric moisture impairs
                      the body's ability to cool itself through sweating — the primary driver of
                      heat-related stress for endurance athletes. A higher score means harder conditions.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                      {[
                        { emoji: '🟢', label: 'Comfortable', range: '< 160' },
                        { emoji: '🟡', label: 'Warm', range: '160–170' },
                        { emoji: '🟠', label: 'Hot', range: '170–177' },
                        { emoji: '🔴', label: 'Brutal', range: '177–183' },
                        { emoji: '🟣', label: 'Historic', range: '≥ 183' },
                      ].map(c => (
                        <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-navy-800 px-2 py-1 font-medium text-slate-600 dark:text-slate-400">
                          {c.emoji} {c.label} <span className="text-slate-400 dark:text-slate-500 font-normal">({c.range})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer — fixed */}
              <div className="flex-shrink-0 border-t border-slate-100 dark:border-navy-800 px-5 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  The website, source code, compiled dataset, and derived metrics were created and are maintained by Sean Morgan. The source code is licensed under the MIT License. Historical weather observations were obtained from publicly available Weather Underground historical records and processed into a race-start dataset.
                </p>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 dark:border-navy-700 px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
