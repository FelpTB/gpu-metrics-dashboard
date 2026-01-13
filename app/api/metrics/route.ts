import { NextResponse } from 'next/server'
import { fetchMetricsDirect, fetchLatestMetricDirect } from '@/lib/supabase-direct'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL não está configurada')
      return NextResponse.json(
        { 
          error: 'DATABASE_URL environment variable is not set', 
          details: 'Configure DATABASE_URL in Railway Variables',
          hasDatabaseUrl: false
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const latest = searchParams.get('latest') === 'true'

    if (latest) {
      const metric = await fetchLatestMetricDirect()
      return NextResponse.json(metric)
    }

    const metrics = await fetchMetricsDirect(limit)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error in API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    
    // Retornar mais detalhes para debug em produção
    return NextResponse.json(
      { 
        error: 'Failed to fetch metrics',
        details: errorMessage,
        code: errorCode,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      { status: 500 }
    )
  }
}
