import { searchAll } from '@/lib/supabase/search'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  const results = await searchAll(q)
  return NextResponse.json(results)
}
