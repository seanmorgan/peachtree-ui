# 🏃 Peachtree Road Race — Weather Archive

An interactive, fully client-side dashboard visualizing 40+ years of race-morning weather conditions at the **AJC Peachtree Road Race** (Atlanta, GA · July 4th · 1982–Present).

> **Disclaimer:** This project is an independent historical archive. "Peachtree Road Race" and "Atlanta Track Club" are referenced to identify the event being documented. All trademarks are the property of their respective owners.

---

## Features

| Section | Description                                                                                               |
|---|-----------------------------------------------------------------------------------------------------------|
| **Summary Cards** | Extremes (hottest, coolest, highest dew point, heat index, stress score) plus historical averages         |
| **Historical Chart** | Multi-metric line chart (temperature, dew point, heat index, humidity, stress score) with togglable series |
| **Rankings Table** | Fully sortable table of 40+ years, ranked by Runner Stress Score                                       |
| **Scatter Plot** | Temperature vs. dew point, color-coded by stress category                                                 |
| **Year Details** | Deep-dive panel for any selected year — all metrics plus historical rank for each                         |
| **Forecast Panel** | Enter hypothetical conditions to auto-compute heat index, stress score, and see how they'd rank all-time  |
| **Dark Mode** | System-aware, toggleable, persisted in `localStorage`                                                     |
| **PNG Export** | Download the main chart as a PNG                                                                          |

### Runner Stress Categories

| Emoji | Label | Score Range |
|---|---|-------------|
| 🟢 | Comfortable | < 160       |
| 🟡 | Warm | 160 – 170   |
| 🟠 | Hot | 170 – 177   |
| 🔴 | Brutal | 177 – 181   |
| 🟣 | Historic | ≥ 181       |

### Runner Stress Score Formula

```
Stress Score = Temp (°F) + (Dew Point (°F) × 1.5) − (Wind Speed (mph, capped at 10) × 0.5)
```

Dew point is weighted more heavily because high atmospheric moisture impairs the body's ability to cool through sweating — the primary driver of heat stress for endurance athletes. Wind provides a small cooling credit (capped at 5 points at 10+ mph) since a breeze aids evaporative cooling.

---

## Data Notes

- **Coverage:** 1982–Present (40+ years). The race began July 4, 1970, but granular hourly records at Fulton County Airport (KFTY) are not reliably available before 1982.
- **Reference time:** All years are pinned to **7:00 AM** for fair comparison. The race start time has varied historically (10:00 AM in 1970, then progressively earlier over the years). The `minutesFromTarget` column records how close each observation was to 7:00 AM.
- **Source:** [Weather Underground](https://www.wunderground.com) · Station KFTY (Fulton County Airport, Atlanta, GA)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite 5](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling with custom `peachtree` and `navy` color scales |
| [Recharts](https://recharts.org) | Line chart, scatter plot, reference lines |
| [PapaParse](https://www.papaparse.com) | CSV parsing |
| [Framer Motion](https://www.framer.com/motion/) | Animations and modal transitions |
| [Heroicons](https://heroicons.com) | SVG icons |
| [html2canvas](https://html2canvas.hertzen.com) | PNG chart export |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run

```bash
git clone https://github.com/seanmorgan/peachtree-ui.git
cd peachtree-ui
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

The output is a fully static site — deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

---

## Project Structure

```
src/
├── components/
│   ├── ChartControls.tsx   # Metric toggle buttons + PNG download
│   ├── ForecastPanel.tsx   # Hypothetical conditions → ranking comparison
│   ├── InfoModal.tsx       # About / methodology modal
│   ├── MainChart.tsx       # Multi-metric line chart with forecast overlays
│   ├── MetricCard.tsx      # Reusable animated stat card
│   ├── RankingsTable.tsx   # Sortable historical rankings table
│   ├── ScatterPlot.tsx     # Temp vs. dew point scatter, colored by stress
│   ├── StressBadge.tsx     # Color-coded stress category pill
│   ├── SummaryCards.tsx    # Extremes + averages card rows
│   └── YearDetails.tsx     # Year selector with metric deep-dive
├── hooks/
│   ├── useDarkMode.ts      # Dark mode toggle with localStorage persistence
│   └── useWeatherData.ts   # PapaParse CSV loader
├── types/
│   └── index.ts            # TypeScript interfaces + metric configs
├── utils/
│   ├── calculations.ts     # Heat index (NWS formula), stress score, rankings
│   ├── categories.ts       # Stress category definitions + condition emojis
│   └── cn.ts               # clsx + tailwind-merge class utility
├── App.tsx                 # Root component + layout
├── index.css               # Tailwind base + custom utilities
└── main.tsx                # React entry point

public/
└── peachtree-start-conditions.csv   # Source data (served statically)
```

---

## CSV Format

The dashboard expects a CSV at `/peachtree-start-conditions.csv` with these columns:

| Column | Type | Description |
|---|---|---|
| `year` | number | Race year |
| `date` | string | Full date (YYYY-MM-DD) |
| `time` | string | Observation time |
| `targetTime` | string | Target comparison time (7:00 AM) |
| `minutesFromTarget` | number | How close the observation was to target time |
| `tempF` | number | Temperature (°F) |
| `dewPointF` | number | Dew point (°F) |
| `humidityPct` | number | Relative humidity (%) |
| `heatIndexF` | number | Heat index (°F) |
| `runnerStressScore` | number | Composite stress metric |
| `wind` | string | Wind direction |
| `windSpeedMph` | number | Wind speed (mph) |
| `windGustMph` | number | Wind gust (mph) |
| `pressureIn` | number | Barometric pressure (inHg) |
| `precipIn` | number | Precipitation (inches) |
| `condition` | string | Sky condition description |
| `sourceUrl` | string | Link to source observation |

---

## Copyright Notice

Copyright © 2026 Sean Morgan

All rights reserved.

The source code in this repository is made publicly available for transparency, educational purposes, code review, and community contributions.

Except as otherwise permitted by applicable law, no part of this repository may be copied, modified, redistributed, sublicensed, or used to create derivative works without prior written permission from the copyright holder.

Contributions submitted through GitHub Pull Requests may be incorporated into this project. By submitting a contribution, you grant the project owner a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, and distribute your contribution as part of this project and future versions of this project. Permission to submit issues and pull requests does not grant permission to deploy, redistribute, or create derivative versions of this project.

This repository and its contents are provided "as is", without warranty of any kind.

References to "Peachtree Road Race" are used solely to describe the subject matter of this project. "Peachtree Road Race" and related marks are the property of their respective owners.

This project is an independent community resource and is not affiliated with or endorsed by the Atlanta Track Club.

---

*Created by [Sean Morgan](mailto:websean.com@gmail.com)*
