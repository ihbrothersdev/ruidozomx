import { getCassetteHistory } from '@/lib/supabase/cassettes'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cassettes = await getCassetteHistory()
  return NextResponse.json({ cassettes })
}
