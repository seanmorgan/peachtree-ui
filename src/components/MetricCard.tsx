import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { StressBadge } from './StressBadge'

interface Props {
  title: string
  year: number
  value: string
  subtitle?: string
  icon: React.ReactNode
  accentColor: string
  stressScore?: number
  selected?: boolean
  onClick?: () => void
  delay?: number
}

export function MetricCard({
  title,
  year,
  value,
  subtitle,
  icon,
  accentColor,
  stressScore,
  selected,
  onClick,
  delay = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white dark:bg-navy-900 p-5',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]',
        selected
          ? 'ring-2 ring-peachtree-500 border-peachtree-300 dark:border-peachtree-700 shadow-lg shadow-peachtree-500/10'
          : 'border-slate-200 dark:border-navy-700 shadow-sm hover:shadow-md',
      )}
    >
      {/* Accent gradient blob */}
      <div
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-10 blur-2xl"
        style={{ background: accentColor }}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
          {stressScore !== undefined && (
            <StressBadge score={stressScore} size="sm" />
          )}
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </p>

        <div className="mt-1 flex items-end gap-2">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="mb-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            {year}
          </p>
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

