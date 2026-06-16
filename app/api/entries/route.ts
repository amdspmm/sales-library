import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, summary, content, url, tags } = body
  const { data, error } = await supabaseAdmin
    .from('entries')
    .insert({ title, summary, content, url, tags })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, title, summary, content, url, tags } = body
  const { data, error } = await supabaseAdmin
    .from('entries')
    .update({ title, summary, content, url, tags })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
