'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Dot, Cell } from 'recharts'
import { format } from 'date-fns'
import { LLMMetrics, GroupedError } from '@/lib/supabase-direct'

interface MetricChartProps {
  data: LLMMetrics[]
  dataKey: keyof LLMMetrics
  title: string
  color?: string
  unit?: string
  yAxisDomain?: [number, number] | ['auto', 'auto']
  errors?: GroupedError[]
}

// Componente customizado para pontos de erro
const ErrorDot = (props: any) => {
  const { cx, cy, payload } = props
  if (!payload || !payload.hasError) return null
  
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={payload.errorCount > 1 ? 6 : 4}
        fill="#ef4444"
        stroke="#dc2626"
        strokeWidth={2}
      />
      {payload.errorCount > 1 && (
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="#dc2626"
          fontSize="10"
          fontWeight="bold"
        >
          {payload.errorCount}
        </text>
      )}
    </g>
  )
}

export function MetricChart({ 
  data, 
  dataKey, 
  title, 
  color = '#0ea5e9',
  unit = '',
  yAxisDomain = ['auto', 'auto'],
  errors = []
}: MetricChartProps) {
  // Debug: Log erros recebidos e dados
  if (typeof window !== 'undefined') {
    console.log(`[${title}] Chart data:`, {
      dataPoints: data.length,
      errorsReceived: errors.length,
      errors: errors.map(e => ({
        time: e.time,
        timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : String(e.timestamp),
        count: e.count
      })),
      firstMetric: data[0] ? {
        created_at: data[0].created_at,
        timestamp: new Date(data[0].created_at || '').toISOString()
      } : null,
      lastMetric: data[data.length - 1] ? {
        created_at: data[data.length - 1].created_at,
        timestamp: new Date(data[data.length - 1].created_at || '').toISOString()
      } : null
    })
  }
  
  // Preparar dados do gráfico com informações de erro
  const chartData = data
    .map(item => {
      const itemTime = item.created_at ? format(new Date(item.created_at), 'HH:mm:ss') : ''
      // Usar UTC para evitar problemas de fuso horário
      const itemDate = item.created_at ? new Date(item.created_at) : new Date()
      const itemTimestamp = itemDate.getTime()
      
      // Verificar se há erro neste timestamp (dentro de 60 segundos para compensar diferenças de coleta)
      const relatedError = errors.find(error => {
        // Garantir que timestamp seja um Date e usar UTC
        const errorTimestamp = error.timestamp instanceof Date 
          ? error.timestamp 
          : new Date(error.timestamp)
        const errorTime = errorTimestamp.getTime()
        const timeDiff = Math.abs(itemTimestamp - errorTime) / 1000 // em segundos
        
        // Debug para primeiro erro encontrado
        if (timeDiff <= 60 && typeof window !== 'undefined') {
          console.log(`[${title}] Error matched:`, {
            metricTime: itemTime,
            errorTime: format(errorTimestamp, 'HH:mm:ss'),
            timeDiff: timeDiff.toFixed(2) + 's',
            errorCount: error.count
          })
        }
        
        // Aumentar janela para 60 segundos para capturar erros próximos
        return timeDiff <= 60
      })
      
      return {
        time: itemTime,
        value: item[dataKey] as number,
        timestamp: itemTimestamp,
        hasError: !!relatedError,
        errorCount: relatedError?.count || 0,
        errorMessage: relatedError?.errors[0]?.error_message || null
      }
    })
    .reverse() // Reverter para mostrar do mais antigo para o mais recente

  // Obter range de tempo das métricas
  const metricTimes = chartData.map(p => p.timestamp).filter(t => t > 0)
  const minMetricTime = metricTimes.length > 0 ? Math.min(...metricTimes) : 0
  const maxMetricTime = metricTimes.length > 0 ? Math.max(...metricTimes) : Date.now()
  
  // Criar linhas de referência para erros que não estão próximos de pontos de dados
  // Mas que estão dentro do período das métricas (com margem de 5 minutos)
  const errorReferenceLines = errors
    .filter(error => {
      const errorTimestamp = error.timestamp instanceof Date 
        ? error.timestamp 
        : new Date(error.timestamp)
      const errorTime = errorTimestamp.getTime()
      
      // Verificar se o erro está próximo de algum ponto de dados
      const isNearPoint = chartData.some(point => {
        const timeDiff = Math.abs(point.timestamp - errorTime) / 1000
        return timeDiff <= 60
      })
      
      // Se não está próximo, verificar se está dentro do período das métricas (com margem de 5 minutos)
      if (!isNearPoint && minMetricTime > 0) {
        const margin = 5 * 60 * 1000 // 5 minutos em ms
        return errorTime >= (minMetricTime - margin) && errorTime <= (maxMetricTime + margin)
      }
      
      return !isNearPoint
    })
    .map(error => {
      const errorTimestamp = error.timestamp instanceof Date 
        ? error.timestamp 
        : new Date(error.timestamp)
      return {
        time: format(errorTimestamp, 'HH:mm:ss'),
        count: error.count,
        message: error.errors[0]?.error_message,
        timestamp: errorTimestamp
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
            domain={yAxisDomain}
            label={{ value: unit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string, props: any) => {
              if (props.payload?.hasError) {
                return [
                  <div key="error-tooltip">
                    <p className="font-semibold text-red-800">
                      {value.toFixed(2)} {unit}
                    </p>
                    <p className="text-sm text-red-600">
                      Erro{props.payload.errorCount > 1 ? `s (${props.payload.errorCount})` : ''}
                    </p>
                    {props.payload.errorMessage && (
                      <p className="mt-1 text-xs text-red-500">
                        {props.payload.errorMessage.substring(0, 100)}
                      </p>
                    )}
                  </div>,
                  title
                ]
              }
              return [`${value.toFixed(2)} ${unit}`, title]
            }}
          />
          <Legend />
          {/* Linhas de referência para erros isolados */}
          {errorReferenceLines.map((error, index) => {
            // Calcular posição Y baseada no valor médio do gráfico
            const values = chartData.map(d => d.value).filter(v => !isNaN(v))
            const avgValue = values.length > 0 
              ? values.reduce((a, b) => a + b, 0) / values.length 
              : 0
            
            return (
              <ReferenceLine
                key={`error-ref-${index}`}
                x={error.time}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: error.count > 1 ? `${error.count} erros` : 'Erro', 
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 10,
                  offset: 5
                }}
              />
            )
          })}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={(props: any) => {
              // Sempre retornar um elemento válido
              if (props.payload?.hasError) {
                return <ErrorDot {...props} />
              }
              // Retornar um dot invisível quando não há erro
              return <Dot r={0} fill="transparent" />
            }}
            activeDot={(props: any) => {
              if (props.payload?.hasError) {
                return <ErrorDot {...props} />
              }
              return <Dot r={4} fill={color} />
            }}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
