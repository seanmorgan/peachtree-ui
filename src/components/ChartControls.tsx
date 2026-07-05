import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { type MetricKey, METRIC_CONFIGS } from '../types'
import { cn } from '../utils/cn'

interface Props {
  activeMetrics: MetricKey[]
  onToggleMetric: (key: MetricKey) => void
  onDownload?: () => void
}

export function ChartControls({ activeMetrics, onToggleMetric, onDownload }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
        Show:
      </span>
      {METRIC_CONFIGS.map(m => {
        const active = activeMetrics.includes(m.key)
        return (
          <button
            key={m.key}
            onClick={() => onToggleMetric(m.key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
              'transition-all duration-150 hover:scale-[1.03] active:scale-95',
              active
                ? 'border-transparent text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
            )}
            style={active ? { background: m.color } : undefined}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: active ? 'rgba(255,255,255,0.7)' : m.color }}
            />
            {m.shortLabel}
          </button>
        )
      })}

      {onDownload && (
        <button
          onClick={onDownload}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition-all hover:border-slate-300 hover:text-slate-700"
        >
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
          PNG
        </button>
      )}
    </div>
  )
}
