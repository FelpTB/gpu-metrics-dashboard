import { NextResponse } from 'next/server'
import { fetchErrorsDirect, groupErrorsByTime } from '@/lib/supabase-direct'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not set' },
        { status: 500 }
      )
    }

    const errors = await fetchErrorsDirect(1000)
    const groupedErrors = groupErrorsByTime(errors, 5)
    
    return NextResponse.json({
      totalErrors: errors.length,
      groupedErrors: groupedErrors.length,
      errors: errors.slice(0, 10).map(e => ({
        id: e.id,
        created_at: e.created_at,
        error_message: e.error_message
      })),
      grouped: groupedErrors.slice(0, 10).map(g => ({
        time: g.time,
        timestamp: g.timestamp instanceof Date ? g.timestamp.toISOString() : g.timestamp,
        count: g.count
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch errors',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
