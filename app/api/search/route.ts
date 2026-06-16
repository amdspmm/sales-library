import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json({ results: [] })

  const { data, error } = await supabaseAdmin
    .from('entries')
    .select('*')
    .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content.ilike.%${q}%`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ results: data })
}
