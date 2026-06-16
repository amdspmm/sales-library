import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data } = await supabase
    .from('entries')
    .select('id, title, url')
    .ilike('title', '%matterport one-pager%')
    .order('created_at', { ascending: true })

  if (!data) return
  console.log('Found:', data.map(e => ({ id: e.id, title: e.title, url: e.url })))

  // Delete the one without a URL (the imported duplicate)
  const toDelete = data.find(e => !e.url)
  if (toDelete) {
    await supabase.from('entries').delete().eq('id', toDelete.id)
    console.log('Deleted duplicate:', toDelete.id)
  } else {
    console.log('No duplicate without URL found')
  }
}

run()
