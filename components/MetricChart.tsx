'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { LLMMetrics } from '@/lib/supabase-direct'

interface MetricChartProps {
  data: LLMMetrics[]
  dataKey: keyof LLMMetrics
  title: string
  color?: string
  unit?: string
  yAxisDomain?: [number, number] | ['auto', 'auto']
}

export function MetricChart({ 
  data, 
  dataKey, 
  title, 
  color = '#0ea5e9',
  unit = '',
  yAxisDomain = ['auto', 'auto']
}: MetricChartProps) {
  const chartData = data
    .map(item => ({
      time: item.created_at ? format(new Date(item.created_at), 'HH:mm:ss') : '',
      value: item[dataKey] as number
    }))
    .reverse() // Reverter para mostrar do mais antigo para o mais recente

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            domain={yAxisDomain}
            label={{ value: unit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
