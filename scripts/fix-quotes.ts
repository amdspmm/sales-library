import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data, error } = await supabase.from('entries').select('id, title')
  if (error) { console.error(error.message); return }

  const toFix = data.filter(e => e.title.startsWith('"') && e.title.endsWith('"'))
  console.log(`Found ${toFix.length} entries to fix`)

  for (const entry of toFix) {
    const cleaned = entry.title.replace(/^"+|"+$/g, '')
    await supabase.from('entries').update({ title: cleaned }).eq('id', entry.id)
    console.log(`Fixed: ${cleaned}`)
  }

  console.log('Done!')
}

run()
