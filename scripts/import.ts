import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FILE_TYPE_MAP: Record<string, string> = {
  '📹 Video': 'Video',
  '🌐 Webpage': 'Webpage',
  '👩‍🏫 Presentation': 'Presentation',
  '📑 Document': 'Document',
  '📄 PDF': 'PDF',
  '📊 Spreadsheet': 'Spreadsheet',
}

const csv = fs.readFileSync('/Users/docusketch/Downloads/Sales and CS Library - Main View.csv', 'utf8')
const lines = csv.split('\n').slice(2) // skip header rows

const entries = lines
  .filter(line => line.trim())
  .map(line => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? []
    const clean = (s: string) => (s ?? '').replace(/^"|"$/g, '').trim()

    const title = clean(cols[0] ?? '')
    const typeRaw = clean(cols[1] ?? '')
    const kind = clean(cols[2] ?? '')
    const topic = clean(cols[3] ?? '')
    const notes = clean(cols[7] ?? '')

    if (!title) return null

    const file_type = FILE_TYPE_MAP[typeRaw] ?? 'Other'
    const tags = [kind, topic].filter(t => t && t !== 'General')
    const summary = notes || null

    return { title, file_type, tags, summary }
  })
  .filter((e): e is { title: string; file_type: string; tags: string[]; summary: string | null } => e !== null)

async function run() {
  console.log(`Importing ${entries.length} entries...`)
  const { error } = await supabase.from('entries').insert(entries)
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Done!')
  }
}

run()
