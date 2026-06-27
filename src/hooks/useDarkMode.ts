import { useState, useEffect } from 'react'

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('peachtree-theme')
      if (stored) return stored === 'dark'
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('peachtree-theme', isDark ? 'dark' : 'light')
    } catch {}
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)
  return [isDark, toggle]
}

