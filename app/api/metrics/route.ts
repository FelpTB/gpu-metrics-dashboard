import { NextResponse } from 'next/server'
import { fetchMetricsDirect, fetchLatestMetricDirect, fetchErrorsDirect, groupErrorsByTime } from '@/lib/supabase-direct'

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
    const errors = await fetchErrorsDirect(1000)
    const groupedErrors = groupErrorsByTime(errors, 5) // Agrupar erros dentro de 5 segundos
    
    return NextResponse.json({
      metrics,
      errors: groupedErrors
    })
  } catch (error) {
    console.error('Error in API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    
    // Log completo do erro para debug
    console.error('Full error object:', {
      message: errorMessage,
      code: errorCode,
      stack: error instanceof Error ? error.stack : undefined,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 50)
    })
    
    // Retornar mais detalhes para debug em produção
    return NextResponse.json(
      { 
        error: 'Failed to fetch metrics',
        details: errorMessage,
        code: errorCode,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        databaseUrlPreview: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
          : 'Not set',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
