import { useMemo } from 'react'
import {
  FireIcon,
  SparklesIcon,
  BeakerIcon,
  TrophyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { type WeatherRecord } from '../types'
import { MetricCard } from './MetricCard'
import { getRecordId } from '../utils/calculations'

interface Props {
  data: WeatherRecord[]
  selectedId: string | null
  onSelectId: (id: string) => void
}

export function SummaryCards({ data, selectedId, onSelectId }: Props) {
  const cards = useMemo(() => {
    if (!data.length) return { extremes: [], averages: [] }
    const maxBy = <K extends keyof WeatherRecord>(field: K) =>
      data.reduce((best, r) => ((r[field] as number) > (best[field] as number) ? r : best))
    const minBy = <K extends keyof WeatherRecord>(field: K) =>
      data.reduce((best, r) => ((r[field] as number) < (best[field] as number) ? r : best))
    const avg = (field: keyof WeatherRecord) =>
      data.reduce((s, r) => s + (r[field] as number), 0) / data.length

    const hottest = maxBy('tempF')
    const coolest = minBy('tempF')
    const dewiest = maxBy('dewPointF')
    const highestStress = maxBy('runnerStressScore')

    const avgTemp = avg('tempF')
    const avgDew = avg('dewPointF')

    // Year closest to each average
    const closestTo = (field: keyof WeatherRecord, target: number) =>
      data.reduce((best, r) =>
        Math.abs((r[field] as number) - target) < Math.abs((best[field] as number) - target) ? r : best
      )

    const extremes = [
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
        subtitle: `Humidity ${dewiest.humidityPct}%`,
        icon: <BeakerIcon className="h-5 w-5" />,
        accentColor: '#3b82f6',
        stressScore: dewiest.runnerStressScore,
        record: dewiest,
      },
      {
        title: 'Highest Stress Score',
        year: highestStress.year,
        value: highestStress.runnerStressScore.toFixed(1),
        subtitle: `${highestStress.tempF}°F · Dew ${highestStress.dewPointF}°F`,
        icon: <TrophyIcon className="h-5 w-5" />,
        accentColor: '#a855f7',
        stressScore: highestStress.runnerStressScore,
        record: highestStress,
      },
    ]

    const averages = [
      {
        title: 'Avg Temperature',
        year: closestTo('tempF', avgTemp).year,
        value: `${avgTemp.toFixed(1)}°F`,
        subtitle: `Typical race-morning temp`,
        icon: <ChartBarIcon className="h-5 w-5" />,
        accentColor: '#f97316',
        stressScore: undefined,
        record: closestTo('tempF', avgTemp),
      },
      {
        title: 'Avg Dew Point',
        year: closestTo('dewPointF', avgDew).year,
        value: `${avgDew.toFixed(1)}°F`,
        subtitle: `Typical humidity feel`,
        icon: <ChartBarIcon className="h-5 w-5" />,
        accentColor: '#3b82f6',
        stressScore: undefined,
        record: closestTo('dewPointF', avgDew),
      },
    ]

    return { extremes, averages }
  }, [data])

  return (
    <div className="space-y-4">
      {/* Extremes row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.extremes.map((card, i) => (
          <MetricCard
            key={card.title}
            title={card.title}
            year={card.year}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accentColor={card.accentColor}
            stressScore={card.stressScore}
            selected={selectedId === getRecordId(card.record)}
            onClick={() => onSelectId(getRecordId(card.record))}
            delay={i * 0.07}
          />
        ))}
      </div>

      {/* Averages row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.averages.map((card, i) => (
          <MetricCard
            key={card.title}
            title={card.title}
            year={card.year}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accentColor={card.accentColor}
            selected={selectedId === getRecordId(card.record)}
            onClick={() => onSelectId(getRecordId(card.record))}
            delay={0.35 + i * 0.07}
          />
        ))}
      </div>
    </div>
  )
}

