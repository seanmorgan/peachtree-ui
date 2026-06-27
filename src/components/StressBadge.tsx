import { cn } from '../utils/cn'
import { getStressCategory } from '../utils/categories'

interface Props {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StressBadge({ score, showLabel = true, size = 'md' }: Props) {
  const cat = getStressCategory(score)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        cat.bg,
        cat.text,
        cat.border,
        size === 'sm' && 'px-1.5 py-0.5 text-xs',
        size === 'md' && 'px-2 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
      )}
    >
      <span>{cat.emoji}</span>
      {showLabel && <span>{cat.label}</span>}
    </span>
  )
}

