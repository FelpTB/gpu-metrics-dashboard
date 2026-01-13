import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Para conexão direta com PostgreSQL, vamos usar a connection string
const connectionString = process.env.DATABASE_URL || ''

export interface LLMMetrics {
  id?: number | string
  created_at?: string
  num_requests_running: number | string
  num_requests_waiting: number | string
  kv_cache_usage_perc: number
  avg_queue_time_seconds: number
  gpu_util_percent: number
  total_gb: number
  used_gb: number
  percent_memory: number
  cpu_percent: number
}

// Cliente Supabase para queries SQL diretas
export const supabase = createClient(supabaseUrl, supabaseKey)

// Função para buscar métricas do banco
export async function fetchMetrics(limit: number = 100) {
  try {
    const { data, error } = await supabase
      .from('LLM-Metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }

    return data as LLMMetrics[]
  } catch (error) {
    console.error('Error in fetchMetrics:', error)
    throw error
  }
}

// Função para buscar última métrica
export async function fetchLatestMetric() {
  try {
    const { data, error } = await supabase
      .from('LLM-Metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest metric:', error)
      throw error
    }

    return data as LLMMetrics
  } catch (error) {
    console.error('Error in fetchLatestMetric:', error)
    throw error
  }
}
