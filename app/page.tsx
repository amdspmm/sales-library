'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

function ResultCard({ item }: { item: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        {item.file_type && (
          <div className="shrink-0">
            {item.url
              ? <a href={item.url} target="_blank" rel="noopener noreferrer"><AssetThumbnail fileType={item.file_type} /></a>
              : <AssetThumbnail fileType={item.file_type} />
            }
          </div>
        )}
        <div className="flex-1 min-w-0">
          {item.url
            ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">{item.title}</a>
            : <h3 className="font-semibold text-gray-900">{item.title}</h3>
          }
          {item.summary && <p className="text-sm text-gray-500 mt-1">{item.summary}</p>}
          {item.content && <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="mt-2 block text-xs text-gray-400 hover:text-blue-600 truncate">{item.url}</a>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {item.tags.map((tag: string) => (
                <a key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition">{tag}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState<any[]>([])
  const [allEntries, setAllEntries] = useState<any[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetch('/api/entries?limit=3').then(r => r.json()).then(d => setRecent(d.entries ?? []))
    fetch('/api/entries').then(r => r.json()).then(d => setAllEntries(d.entries ?? []))
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.results ?? [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-5">
        <header className="bg-white border border-gray-100 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm max-w-5xl mx-auto">
          <h1 className="text-lg font-bold" style={{ fontFamily: 'Lora, Georgia, serif', color: '#000000' }}>Sales Library°</h1>
          <div className="flex gap-4 items-center">
            {isAdmin(session?.user?.email) && (
              <a href="/admin" className="text-sm font-medium hover:opacity-70 transition" style={{ color: '#000000' }}>Admin</a>
            )}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-2 rounded-xl transition"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="page-heading mb-3 text-center" style={{ color: '#000000' }}>
          What do you need?
        </h2>
        <p className="text-center mb-8 text-base" style={{ color: '#4a4e2a' }}>
          Ask anything — how to position a feature, handle an objection, talk to a persona.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. How do I talk to a CFO about ROI?"
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ background: 'white', border: '1.5px solid #e5df00', color: '#000000' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
            style={{ background: '#e5df00', color: '#000000' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {!searched && allEntries.length > 0 && (
          <div className="mt-3 text-center">
            <button onClick={() => setShowAll(!showAll)} className="text-sm font-medium hover:underline mr-4" style={{ color: '#6b7a00' }}>
              {showAll ? 'Hide list' : `Browse all ${allEntries.length} assets`}
            </button>
            <a href="/browse" className="text-sm hover:underline" style={{ color: '#9aa040' }}>Open full page →</a>
          </div>
        )}

        {!searched && showAll && (
          <div className="mt-6 space-y-3">
            {allEntries.map((item: any) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {!searched && !showAll && recent.length > 0 && (
          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9aa040' }}>Recently Added</p>
            <div className="space-y-3">
              {recent.map((item: any) => (
                <ResultCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-10 space-y-4">
            {results.map((item: any) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <p className="text-center mt-10 text-sm" style={{ color: '#9aa040' }}>No results found. Try a different question.</p>
        )}
      </main>
    </div>
  )
}
