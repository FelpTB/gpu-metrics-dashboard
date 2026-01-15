'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts'
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
  // Preparar dados do gráfico com linha acumulativa
  // Converter timestamps para horário local e formatar
  const sortedData = data
    .map(item => {
      // Converter timestamp UTC para horário local
      const timestamp = item.timestamp instanceof Date 
        ? item.timestamp 
        : new Date(item.timestamp)
      
      return {
        time: format(timestamp, 'HH:mm'),
        dateTime: format(timestamp, 'dd/MM/yyyy HH:mm'),
        count: item.count,
        timestamp: timestamp.getTime()
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp) // Ordenar por timestamp crescente

  // Calcular valores acumulativos para criar linha do tempo
  let cumulativeCount = 0
  const chartData = sortedData.map(item => {
    cumulativeCount += item.count
    return {
      ...item,
      cumulative: cumulativeCount,
      // Manter count para mostrar no tooltip
      countInInterval: item.count
    }
  })

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
            label={{ value: 'Total Acumulado', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'cumulative') {
                return [
                  <div key="tooltip">
                    <p className="font-semibold text-gray-900">
                      Total: {value} requisições
                    </p>
                    <p className="text-sm text-gray-600">
                      +{props.payload.countInInterval} neste intervalo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {props.payload.dateTime}
                    </p>
                  </div>,
                  'Total Acumulado'
                ]
              }
              return [value, name]
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke={color} 
            strokeWidth={2}
            dot={<Dot r={3} fill={color} />}
            activeDot={{ r: 5 }}
            name="Total Acumulado"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
