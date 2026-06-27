import { useMemo } from 'react'
import {
  FireIcon,
  SparklesIcon,
  BeakerIcon,
  BoltIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { type WeatherRecord } from '../types'
import { MetricCard } from './MetricCard'

interface Props {
  data: WeatherRecord[]
  selectedYear: number | null
  onSelectYear: (year: number) => void
}

export function SummaryCards({ data, selectedYear, onSelectYear }: Props) {
  const cards = useMemo(() => {
    if (!data.length) return []
    const maxBy = <K extends keyof WeatherRecord>(field: K) =>
      data.reduce((best, r) => ((r[field] as number) > (best[field] as number) ? r : best))
    const minBy = <K extends keyof WeatherRecord>(field: K) =>
      data.reduce((best, r) => ((r[field] as number) < (best[field] as number) ? r : best))

    const hottest = maxBy('tempF')
    const coolest = minBy('tempF')
    const dewiest = maxBy('dewPointF')
    const highestHI = maxBy('heatIndexF')
    const highestStress = maxBy('runnerStressScore')

    return [
      {
        title: 'Hottest Start',
        year: hottest.year,
        value: `${hottest.tempF}°F`,
        subtitle: hottest.condition,
        icon: <FireIcon className="h-5 w-5" />,
        accentColor: '#f97316',
        stressScore: hottest.runnerStressScore,
        record: hottest,
      },
      {
        title: 'Coolest Start',
        year: coolest.year,
        value: `${coolest.tempF}°F`,
        subtitle: coolest.condition,
        icon: <SparklesIcon className="h-5 w-5" />,
        accentColor: '#06b6d4',
        stressScore: coolest.runnerStressScore,
        record: coolest,
      },
      {
        title: 'Highest Dew Point',
        year: dewiest.year,
        value: `${dewiest.dewPointF}°F`,
        subtitle: `Feels-like ${dewiest.heatIndexF}°F`,
        icon: <BeakerIcon className="h-5 w-5" />,
        accentColor: '#3b82f6',
        stressScore: dewiest.runnerStressScore,
        record: dewiest,
      },
      {
        title: 'Highest Heat Index',
        year: highestHI.year,
        value: `${highestHI.heatIndexF}°F`,
        subtitle: `${highestHI.humidityPct}% humidity`,
        icon: <BoltIcon className="h-5 w-5" />,
        accentColor: '#ef4444',
        stressScore: highestHI.runnerStressScore,
        record: highestHI,
      },
      {
        title: 'Highest Stress Score',
        year: highestStress.year,
        value: highestStress.runnerStressScore.toFixed(1),
        subtitle: `${highestStress.tempF}°F • Dew ${highestStress.dewPointF}°F`,
        icon: <TrophyIcon className="h-5 w-5" />,
        accentColor: '#a855f7',
        stressScore: highestStress.runnerStressScore,
        record: highestStress,
      },
    ]
  }, [data])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, i) => (
        <MetricCard
          key={card.title}
          title={card.title}
          year={card.year}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          accentColor={card.accentColor}
          stressScore={card.stressScore}
          selected={selectedYear === card.year}
          onClick={() => onSelectYear(card.year)}
          delay={i * 0.07}
        />
      ))}
    </div>
  )
}

