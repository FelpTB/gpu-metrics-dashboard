'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts'
import { format } from 'date-fns'
import { GroupedRequestHistory } from '@/lib/supabase-direct'

interface RequestsRateChartProps {
  data: GroupedRequestHistory[]
  title: string
  color?: string
}

export function RequestsRateChart({ 
  data, 
  title, 
  color = '#3b82f6'
}: RequestsRateChartProps) {
  // Preparar dados do gráfico mostrando quantidade por intervalo (não acumulado)
  // Converter timestamps para horário local e formatar com precisão de segundos
  const chartData = data
    .map(item => {
      // Converter timestamp UTC para horário local
      const timestamp = item.timestamp instanceof Date 
        ? item.timestamp 
        : new Date(item.timestamp)
      
      return {
        time: format(timestamp, 'HH:mm:ss'), // Formato exato como nos outros gráficos
        dateTime: format(timestamp, 'dd/MM/yyyy HH:mm:ss'),
        count: item.count, // Quantidade de requisições neste intervalo específico
        timestamp: timestamp.getTime()
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp) // Ordenar por timestamp crescente

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
            label={{ value: 'Requisições por Intervalo', angle: -90, position: 'insideLeft' }}
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
                    {value} requisições completas
                  </p>
                  <p className="text-sm text-gray-600">
                    neste intervalo de 1 minuto
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {props.payload.dateTime}
                  </p>
                </div>,
                'Requisições por Intervalo'
              ]
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={color} 
            strokeWidth={2}
            dot={<Dot r={3} fill={color} />}
            activeDot={{ r: 5 }}
            name="Requisições por Intervalo"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
