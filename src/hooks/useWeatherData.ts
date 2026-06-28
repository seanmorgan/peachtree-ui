import { useState, useEffect, useCallback } from 'react'
import Papa from 'papaparse'
import { type WeatherRecord } from '../types'

export function useWeatherData(csvPath: string) {
  const [data, setData] = useState<WeatherRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const parseRaw = useCallback((source: string | File) => {
    setLoading(true)
    setError(null)

    const onComplete = (results: Papa.ParseResult<WeatherRecord>) => {
      const rows = results.data
        .filter(r => r.year)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          // sub-years ("2021a" before "2021b") sorted alphabetically
          return (a.subYear || '').localeCompare(b.subYear || '')
        })
      setData(rows)
      setLoading(false)
    }

    const onError = (err: Error) => {
      setError(err.message)
      setLoading(false)
    }

    if (typeof source === 'string') {
      Papa.parse<WeatherRecord>(source, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        download: true,
        complete: onComplete,
        error: onError,
      })
    } else {
      Papa.parse<WeatherRecord>(source, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: onComplete,
        error: onError,
      })
    }
  }, [])

  useEffect(() => {
    parseRaw(csvPath)
  }, [csvPath, parseRaw])

  const loadFile = useCallback(
    (file: File) => parseRaw(file),
    [parseRaw],
  )

  return { data, loading, error, loadFile }
}


