import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const limit = req.nextUrl.searchParams.get('limit')
  let query = supabaseAdmin.from('entries').select('*').order('created_at', { ascending: false })
  if (limit) query = query.limit(parseInt(limit))
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data })
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const body = await req.json()
  const { title, summary, content, url, file_type, tags, topic, safe_to_share } = body
  const { data, error } = await supabaseAdmin
    .from('entries')
    .insert({ title, summary, content, url, file_type, tags, topic, safe_to_share })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function PUT(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const body = await req.json()
  const { id, ...fields } = body
  const update: Record<string, any> = {}
  const optionalTextFields = new Set(['summary', 'content', 'url', 'topic'])
  for (const key of ['title', 'summary', 'content', 'url', 'file_type', 'tags', 'topic', 'safe_to_share', 'created_at']) {
    if (!(key in fields)) continue
    const val = fields[key]
    // Don't overwrite existing DB values with empty strings for optional fields
    if (optionalTextFields.has(key) && val === '') update[key] = null
    // Never blank out the title
    else if (key === 'title' && !val) continue
    else update[key] = val
  }
  const { data, error } = await supabaseAdmin
    .from('entries')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
