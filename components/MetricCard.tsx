'use client'

import { LLMMetrics } from '@/lib/supabase-direct'

interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  description?: string
  status?: 'normal' | 'warning' | 'critical'
  trend?: 'up' | 'down' | 'stable'
}

export function MetricCard({ 
  title, 
  value, 
  unit = '', 
  description,
  status = 'normal',
  trend 
}: MetricCardProps) {
  const statusColors = {
    normal: 'border-gray-200 bg-white',
    warning: 'border-yellow-400 bg-yellow-50',
    critical: 'border-red-400 bg-red-50'
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→'
  }

  return (
    <div className={`rounded-lg border-2 p-6 shadow-sm transition-all hover:shadow-md ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toFixed(2) : value}
            {unit && <span className="ml-2 text-lg font-normal text-gray-500">{unit}</span>}
          </p>
          {description && (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          )}
        </div>
        {trend && (
          <div className="text-2xl text-gray-400">{trendIcons[trend]}</div>
        )}
      </div>
    </div>
  )
}
