// Minimal widget types for card statistics components

import type { ThemeColor } from '@core/types'

export type CardStatsCharacterProps = {
  title: string
  src: string
  stats: string | number
  trendNumber: string | number
  trend: 'positive' | 'negative'
  chipText: string
  chipColor: ThemeColor
}

export type CardStatsCustomerStatsProps = {
  title: string
  avatarIcon: string
  color: ThemeColor
  description?: string
  stats?: string | number
  content?: string
  chipLabel?: string
}
