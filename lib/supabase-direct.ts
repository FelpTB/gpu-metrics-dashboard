import { Pool } from 'pg'

// Para conexão direta com PostgreSQL usando a connection string
let pool: Pool | null = null

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

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
  return pool
}

export async function fetchMetricsDirect(limit: number = 100): Promise<LLMMetrics[]> {
  const client = getPool()
  try {
    const result = await client.query(
      `SELECT * FROM "busca_fornecedor"."LLM-Metrics" 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    )
    // Converter strings numéricas para números
    return result.rows.map(row => ({
      ...row,
      id: typeof row.id === 'string' ? parseInt(row.id) : row.id,
      num_requests_running: typeof row.num_requests_running === 'string' 
        ? parseInt(row.num_requests_running) 
        : row.num_requests_running,
      num_requests_waiting: typeof row.num_requests_waiting === 'string' 
        ? parseInt(row.num_requests_waiting) 
        : row.num_requests_waiting,
    })) as LLMMetrics[]
  } catch (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }
}

export async function fetchLatestMetricDirect(): Promise<LLMMetrics | null> {
  const client = getPool()
  try {
    const result = await client.query(
      `SELECT * FROM "busca_fornecedor"."LLM-Metrics" 
       ORDER BY created_at DESC 
       LIMIT 1`
    )
    if (!result.rows[0]) return null
    
    const row = result.rows[0]
    // Converter strings numéricas para números
    return {
      ...row,
      id: typeof row.id === 'string' ? parseInt(row.id) : row.id,
      num_requests_running: typeof row.num_requests_running === 'string' 
        ? parseInt(row.num_requests_running) 
        : row.num_requests_running,
      num_requests_waiting: typeof row.num_requests_waiting === 'string' 
        ? parseInt(row.num_requests_waiting) 
        : row.num_requests_waiting,
    } as LLMMetrics
  } catch (error) {
    console.error('Error fetching latest metric:', error)
    throw error
  }
}
