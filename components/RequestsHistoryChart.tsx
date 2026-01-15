'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { GroupedRequestHistory } from '@/lib/supabase-direct'

interface RequestsHistoryChartProps {
  data: GroupedRequestHistory[]
  title: string
  color?: string
}

export function RequestsHistoryChart({ 
  data, 
  title, 
  color = '#10b981'
}: RequestsHistoryChartProps) {
  // Preparar dados do gráfico
  // Converter timestamps para horário local e formatar
  const chartData = data.map(item => {
    // Converter timestamp UTC para horário local
    const timestamp = item.timestamp instanceof Date 
      ? item.timestamp 
      : new Date(item.timestamp)
    
    // Formatar data/hora para exibição
    const dateTime = format(timestamp, 'dd/MM HH:mm')
    const timeOnly = format(timestamp, 'HH:mm')
    
    return {
      time: timeOnly,
      dateTime: dateTime,
      count: item.count,
      timestamp: timestamp.getTime()
    }
  })
  .sort((a, b) => a.timestamp - b.timestamp) // Ordenar por timestamp crescente

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Requisições', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string, props: any) => {
              return [
                <div key="tooltip">
                  <p className="font-semibold text-gray-900">
                    {value} requisições
                  </p>
                  <p className="text-sm text-gray-600">
                    {props.payload.dateTime}
                  </p>
                </div>,
                'Requisições Completas'
              ]
            }}
          />
          <Legend />
          <Bar 
            dataKey="count" 
            fill={color}
            radius={[4, 4, 0, 0]}
            name="Requisições Completas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
