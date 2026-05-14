/**
 * HeroUI v3 theme tokens for Recharts / SVG.
 * Use these instead of legacy `--heroui-*` variables (not present in v3).
 */
export const chartTheme = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--muted)",
  border: "var(--border)",
  foreground: "var(--foreground)",
  surface: "var(--surface)",
  background: "var(--background)",
  /** Subtle grid lines (SVG-safe) */
  grid: "var(--border)"
} as const

export const chartSeriesColors = [
  chartTheme.success,
  chartTheme.warning,
  chartTheme.danger,
  chartTheme.accent
] as const
