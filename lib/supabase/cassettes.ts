import { createClient } from './server'

export interface CassetteHistoryItem {
  id: string
  name: string | null
  curator_name: string | null
  start_date: string
  active: boolean
  cover_image_url: string | null
}

export async function getCassetteHistory(): Promise<CassetteHistoryItem[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('cassettes')
    .select('id, name, curator_name, start_date, active, cover_image_url')
    .or('active.eq.true,archived.eq.true')
    .order('start_date', { ascending: false })

  return (data ?? []) as CassetteHistoryItem[]
}
