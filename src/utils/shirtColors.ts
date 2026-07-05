export const SHIRT_COLORS: Record<
    number,
    { hex: string; name: string; displayHueOrder: number }
> = {
  1982: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  1983: { hex: '#F2C94C', name: 'Yellow', displayHueOrder: 300 },
  1984: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  1985: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  1986: { hex: '#A9D3F5', name: 'Powder Blue', displayHueOrder: 650 },
  1987: { hex: '#F6C1A6', name: 'Pale Peach', displayHueOrder: 200 },
  1988: { hex: '#2D9C9C', name: 'Medium Teal', displayHueOrder: 500 },
  1989: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  1990: { hex: '#D5DADF', name: 'Cool Light Gray', displayHueOrder: 1200 },
  1991: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  1992: { hex: '#F5BE9C', name: 'Light Peach', displayHueOrder: 200 },
  1993: { hex: '#AEB8F4', name: 'Periwinkle', displayHueOrder: 900 },
  1994: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  1995: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  1996: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  1997: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  1998: { hex: '#F6C1A6', name: 'Pale Peach', displayHueOrder: 200 },
  1999: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  2000: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  2001: { hex: '#A9D3F5', name: 'Powder Blue', displayHueOrder: 650 },
  2002: { hex: '#DADDE2', name: 'Silver Gray', displayHueOrder: 1200 },
  2003: { hex: '#F7F0C6', name: 'Pale Cream Yellow', displayHueOrder: 275 },
  2004: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  2005: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  2006: { hex: '#BFD95A', name: 'Light Lime', displayHueOrder: 400 },
  2007: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  2008: { hex: '#6E839C', name: 'Muted Slate Blue', displayHueOrder: 850 },
  2009: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  2010: { hex: '#B6B8C3', name: 'Cool Silver Gray', displayHueOrder: 1200 },
  2011: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  2012: { hex: '#F6F2E8', name: 'Warm Ivory', displayHueOrder: 1000 },
  2013: { hex: '#2B2B2B', name: 'Black', displayHueOrder: 1300 },
  2014: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  2015: { hex: '#D64545', name: 'Red', displayHueOrder: 100 },
  2016: { hex: '#2C6BEA', name: 'Royal Blue', displayHueOrder: 750 },
  2017: { hex: '#6C8FF0', name: 'Cornflower Blue', displayHueOrder: 700 },
  2018: { hex: '#AEB4B9', name: 'Heather Gray', displayHueOrder: 1200 },
  2019: { hex: '#FAFAFA', name: 'White', displayHueOrder: 1100 },
  2020: { hex: '#D64545', name: 'Red', displayHueOrder: 100 },
  2021: { hex: '#5C8EF5', name: 'Bright Cornflower Blue', displayHueOrder: 725 },
  2022: { hex: '#56B7D8', name: 'Aqua Blue', displayHueOrder: 600 },
  2023: { hex: '#F2994A', name: 'Peach Orange', displayHueOrder: 250 },
  2024: { hex: '#2458B5', name: 'Deep Sapphire Blue', displayHueOrder: 800 },
  2025: { hex: '#D64545', name: 'Red', displayHueOrder: 100 },
  2026: { hex: '#F2E61C', name: 'Sunflower Yellow', displayHueOrder: 350 },
}

/** Convert a 6-digit hex color to rgba() with the given alpha (0–1). */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Return the HSL hue (0–360) for a 6-digit hex color. Achromatic colors return 0. */
export function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return 0
  let hue: number
  if (max === r)      hue = 60 * (((g - b) / delta) % 6)
  else if (max === g) hue = 60 * ((b - r) / delta + 2)
  else                hue = 60 * ((r - g) / delta + 4)
  return hue < 0 ? hue + 360 : hue
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove leading '#'
  hex = hex.replace('#', '')

  // Expand shorthand form (#abc -> #aabbcc)
  if (hex.length === 3) {
    hex = hex
        .split('')
        .map(c => c + c)
        .join('')
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / delta + 2) * 60
        break
      case b:
        h = ((r - g) / delta + 4) * 60
        break
    }

    s = delta / (1 - Math.abs(2 * l - 1))
  }

  return {
    h: Math.round(h),          // 0–360
    s: Math.round(s * 100),    // 0–100
    l: Math.round(l * 100),    // 0–100
  }
}

export function getShirtColorSort(hex: string) {
  const { h, s, l } = hexToHsl(hex)

  const isNeutral = s < 18

  return {
    group: isNeutral ? 1 : 0,
    hue: isNeutral ? 999 : h,
    lightness: l,
  }
}

