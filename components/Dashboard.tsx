'use client'

import { useEffect, useState } from 'react'
import { LLMMetrics, GroupedError, GroupedRequestHistory } from '@/lib/supabase-direct'
import { MetricCard } from './MetricCard'
import { MetricChart } from './MetricChart'
import { RequestsHistoryChart } from './RequestsHistoryChart'

export function Dashboard() {
  const [metrics, setMetrics] = useState<LLMMetrics[]>([])
  const [latestMetric, setLatestMetric] = useState<LLMMetrics | null>(null)
  const [errors, setErrors] = useState<GroupedError[]>([])
  const [totalRequests, setTotalRequests] = useState<number>(0)
  const [requestsHistory, setRequestsHistory] = useState<GroupedRequestHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics?limit=100')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      
      // Verificar se a resposta tem formato novo (com errors) ou antigo (só metrics)
      if (data.metrics && data.errors) {
        setMetrics(data.metrics)
        // Converter timestamps de string para Date (garantir UTC)
        const convertedErrors = data.errors.map((error: any) => {
          let timestamp: Date
          if (error.timestamp) {
            // Se já é Date, usar diretamente, senão converter string para Date
            timestamp = error.timestamp instanceof Date 
              ? error.timestamp 
              : new Date(error.timestamp)
          } else {
            timestamp = new Date()
          }
          
          return {
            ...error,
            timestamp
          }
        })
        
        // Debug: Log erros convertidos
        console.log('Errors converted:', convertedErrors.length, convertedErrors.map((e: GroupedError) => ({
          time: e.time,
          timestamp: e.timestamp.toISOString(),
          count: e.count
        })))
        
        setErrors(convertedErrors)
        // Atualizar total de requisições se disponível
        if (typeof data.totalRequests === 'number') {
          setTotalRequests(data.totalRequests)
        }
        // Atualizar histórico de requisições se disponível
        if (data.requestsHistory && Array.isArray(data.requestsHistory)) {
          // Converter timestamps de string para Date
          const convertedHistory = data.requestsHistory.map((item: any) => {
            let timestamp: Date
            if (item.timestamp) {
              timestamp = item.timestamp instanceof Date 
                ? item.timestamp 
                : new Date(item.timestamp)
            } else {
              timestamp = new Date()
            }
            
            return {
              ...item,
              timestamp
            }
          })
          setRequestsHistory(convertedHistory)
        }
        if (data.metrics.length > 0) {
          setLatestMetric(data.metrics[0])
        }
      } else {
        // Formato antigo (backward compatibility)
        setMetrics(data)
        setErrors([])
        if (data.length > 0) {
          setLatestMetric(data[0])
        }
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLatest = async () => {
    try {
      const response = await fetch('/api/metrics?latest=true')
      if (!response.ok) throw new Error('Failed to fetch latest metric')
      const data = await response.json()
      if (data) {
        setLatestMetric(data)
        // Atualizar total de requisições se disponível
        if (typeof data.totalRequests === 'number') {
          setTotalRequests(data.totalRequests)
        }
        // Atualizar histórico de requisições se disponível (para atualização em tempo real)
        if (data.requestsHistory && Array.isArray(data.requestsHistory)) {
          const convertedHistory = data.requestsHistory.map((item: any) => {
            let timestamp: Date
            if (item.timestamp) {
              timestamp = item.timestamp instanceof Date 
                ? item.timestamp 
                : new Date(item.timestamp)
            } else {
              timestamp = new Date()
            }
            
            return {
              ...item,
              timestamp
            }
          })
          setRequestsHistory(convertedHistory)
        }
        // Adicionar à lista se não existir ou atualizar se for mais recente
        setMetrics(prev => {
          const exists = prev.find(m => m.id === data.id)
          if (exists) {
            return prev.map(m => m.id === data.id ? data : m)
          }
          return [data, ...prev].slice(0, 100)
        })
      }
    } catch (err) {
      console.error('Error fetching latest metric:', err)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    // Atualizar métricas a cada 2 segundos
    const interval = setInterval(() => {
      fetchLatest()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
          <p className="text-red-800">Erro ao carregar métricas: {error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!latestMetric) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Nenhuma métrica disponível</p>
      </div>
    )
  }

  // Determinar status das métricas críticas
  const getKVCacheStatus = (value: number): 'normal' | 'warning' | 'critical' => {
    if (value >= 85) return 'critical'
    if (value >= 80) return 'warning'
    return 'normal'
  }

  const getQueueTimeStatus = (value: number): 'normal' | 'warning' | 'critical' => {
    if (value > 5) return 'critical'
    if (value > 2) return 'warning'
    return 'normal'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">GPU Metrics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitoramento em tempo real das métricas de GPU e vLLM
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Atualizando em tempo real</span>
          </div>
        </div>

        {/* Métricas Críticas - Cards Principais */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Métricas Críticas</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Requisições Completas"
              value={totalRequests}
              description="Total de requisições completas pelo LLM"
            />
            <MetricCard
              title="KV Cache Usage"
              value={Number(latestMetric.kv_cache_usage_perc)}
              unit="%"
              description="Uso do KV Cache da GPU - Principal gargalo"
              status={getKVCacheStatus(Number(latestMetric.kv_cache_usage_perc))}
            />
            <MetricCard
              title="Requests Running"
              value={Number(latestMetric.num_requests_running)}
              description="Requisições ativas no ciclo de geração"
            />
            <MetricCard
              title="Requests Waiting"
              value={Number(latestMetric.num_requests_waiting)}
              description="Requisições aguardando recursos"
              status={Number(latestMetric.num_requests_waiting) > 0 ? 'warning' : 'normal'}
            />
            <MetricCard
              title="Avg Queue Time"
              value={Number(latestMetric.avg_queue_time_seconds)}
              unit="s"
              description="Tempo médio na fila interna"
              status={getQueueTimeStatus(Number(latestMetric.avg_queue_time_seconds))}
            />
          </div>
        </div>

        {/* Métricas de Saúde */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Métricas de Saúde</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="GPU Utilization"
              value={Number(latestMetric.gpu_util_percent)}
              unit="%"
              description="Uso computacional da GPU"
            />
            <MetricCard
              title="Memory Usage"
              value={Number(latestMetric.percent_memory)}
              unit="%"
              description="Percentual de uso da RAM"
            />
            <MetricCard
              title="CPU Usage"
              value={Number(latestMetric.cpu_percent)}
              unit="%"
              description="Uso de CPU do host"
            />
            <MetricCard
              title="Memory Used"
              value={Number(latestMetric.used_gb)}
              unit="GB"
              description={`de ${Number(latestMetric.total_gb)} GB total`}
            />
          </div>
        </div>

        {/* Gráfico de Requisições Completas */}
        {requestsHistory.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Requisições Completas pelo LLM</h2>
            <RequestsHistoryChart
              data={requestsHistory}
              title="Requisições Completas por Intervalo de Tempo"
              color="#10b981"
            />
          </div>
        )}

        {/* Gráficos */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Histórico de Métricas</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MetricChart
              data={metrics}
              dataKey="kv_cache_usage_perc"
              title="KV Cache Usage (%)"
              color="#ef4444"
              unit="%"
              yAxisDomain={[0, 100]}
              errors={errors}
            />
            <MetricChart
              data={metrics}
              dataKey="num_requests_running"
              title="Requests Running"
              color="#3b82f6"
              errors={errors}
            />
            <MetricChart
              data={metrics}
              dataKey="num_requests_waiting"
              title="Requests Waiting"
              color="#f59e0b"
              errors={errors}
            />
            <MetricChart
              data={metrics}
              dataKey="avg_queue_time_seconds"
              title="Average Queue Time (s)"
              color="#8b5cf6"
              unit="s"
              errors={errors}
            />
            <MetricChart
              data={metrics}
              dataKey="gpu_util_percent"
              title="GPU Utilization (%)"
              color="#10b981"
              unit="%"
              yAxisDomain={[0, 100]}
              errors={errors}
            />
            <MetricChart
              data={metrics}
              dataKey="percent_memory"
              title="Memory Usage (%)"
              color="#6366f1"
              unit="%"
              yAxisDomain={[0, 100]}
              errors={errors}
            />
            <MetricChart
              data={metrics}
              dataKey="cpu_percent"
              title="CPU Utilization (%)"
              color="#ec4899"
              unit="%"
              yAxisDomain={[0, 100]}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
