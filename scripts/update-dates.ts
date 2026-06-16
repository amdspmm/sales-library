import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MONTH_MAP: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function parseDate(raw: string): string | null {
  const parts = raw.trim().split(' ')
  if (parts.length === 2 && MONTH_MAP[parts[0]] && parts[1].match(/^\d{4}$/)) {
    return `${parts[1]}-${MONTH_MAP[parts[0]]}-01T00:00:00Z`
  }
  return null
}

const csv = fs.readFileSync('/Users/docusketch/Downloads/Sales and CS Library - Main View.csv', 'utf8')
const lines = csv.split('\n').slice(2) // skip 2 header rows

const rows = lines
  .filter(line => line.trim())
  .map(line => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? []
    const clean = (s: string) => (s ?? '').replace(/^"|"$/g, '').trim()
    const title = clean(cols[0] ?? '')
    const dateRaw = clean(cols[4] ?? '')
    if (!title) return null
    return { title, date: parseDate(dateRaw) }
  })
  .filter((r): r is { title: string; date: string | null } => r !== null && !!r.date)

async function run() {
  const { data: entries, error } = await supabase.from('entries').select('id, title')
  if (error || !entries) { console.error('Failed to fetch entries:', error?.message); return }

  let updated = 0, skipped = 0
  for (const row of rows) {
    const match = entries.find(e => e.title.trim() === row.title)
    if (!match) { console.log(`  ⚠ No match: "${row.title}"`); skipped++; continue }
    const { error: updateError } = await supabase
      .from('entries')
      .update({ created_at: row.date })
      .eq('id', match.id)
    if (updateError) { console.log(`  ✗ Error updating "${row.title}":`, updateError.message) }
    else { console.log(`  ✓ ${row.title} → ${row.date}`); updated++ }
  }
  console.log(`\nDone. ${updated} updated, ${skipped} skipped (no match).`)
}

run()
