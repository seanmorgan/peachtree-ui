import { type StressCategory } from '../types'

export const STRESS_CATEGORIES: StressCategory[] = [
	{
		label: 'Comfortable',
		emoji: '🟢',
		color: '#22c55e',
		bg: 'bg-green-500/15',
		text: 'text-green-700',
		border: 'border-green-500/30',
		min: 0,
		max: 160,
	},
	{
		label: 'Warm',
		emoji: '🟡',
		color: '#eab308',
		bg: 'bg-yellow-500/15',
		text: 'text-yellow-700',
		border: 'border-yellow-500/30',
		min: 160,
		max: 170,
	},
	{
		label: 'Hot',
		emoji: '🟠',
		color: '#f97316',
		bg: 'bg-orange-500/15',
		text: 'text-orange-700',
		border: 'border-orange-500/30',
		min: 170,
		max: 177,
	},
	{
		label: 'Brutal',
		emoji: '🔴',
		color: '#ef4444',
		bg: 'bg-red-500/15',
		text: 'text-red-700',
		border: 'border-red-500/30',
		min: 177,
		max: 181,
	},
	{
		label: 'Historic',
		emoji: '🟣',
		color: '#a855f7',
		bg: 'bg-purple-500/15',
		text: 'text-purple-700',
		border: 'border-purple-500/30',
		min: 181,
		max: Infinity,
	},
]

export function getStressCategory(score: number): StressCategory {
	return (
		STRESS_CATEGORIES.find(c => score >= c.min && score < c.max) ??
		STRESS_CATEGORIES[0]
	)
}

export function getConditionEmoji(condition: string): string {
	const c = condition.toLowerCase()
	if (c.includes('thunder') || c.includes('storm')) return '⛈️'
	if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
		return '🌧️'
	if (c.includes('cloudy')) return '☁️'
	if (c.includes('mostly cloudy')) return '🌥️'
	if (c.includes('partly cloudy')) return '⛅'
	if (c.includes('fog') || c.includes('mist') || c.includes('haze'))
		return '🌫️'
	if (c.includes('fair') || c.includes('clear') || c.includes('sunny'))
		return '☀️'
	return '🌤️'
}
