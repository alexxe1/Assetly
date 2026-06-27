export const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  '2D':      { bg: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa' },
  '3D':      { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
  'Audio':   { bg: 'rgba(34, 197, 94, 0.15)',  color: '#4ade80' },
  'UI':      { bg: 'rgba(234, 179, 8, 0.15)',  color: '#facc15' },
  'Fuentes': { bg: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' },
  'Shaders': { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' },
  'Otro':    { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' },
}

export function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Otro']
}