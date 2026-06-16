'use client'
import { useState, useEffect, useMemo } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

function ResultCard({ item, admin }: { item: any; admin: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-4">
        {item.file_type && (
          <div className="shrink-0 mt-0.5">
            {item.url
              ? <a href={item.url} target="_blank" rel="noopener noreferrer"><AssetThumbnail fileType={item.file_type} /></a>
              : <AssetThumbnail fileType={item.file_type} />
            }
          </div>
        )}
        <div className="flex-1 min-w-0">
          <a href={`/entry/${item.id}`} className="font-semibold text-gray-900 hover:underline underline-offset-2">{item.title}</a>
          {item.summary && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.summary}</p>}
          {item.content && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{item.content}</p>}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {item.tags.map((tag: string) => (
                <a key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                  className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors">{tag}</a>
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
  const admin = isAdmin(session?.user?.email)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState<any[]>([])
  const [allEntries, setAllEntries] = useState<any[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/entries?limit=3').then(r => r.json()).then(d => setRecent(d.entries ?? []))
    fetch('/api/entries').then(r => r.json()).then(d => setAllEntries(d.entries ?? []))
  }, [])

  const tags = useMemo(() => {
    const counts: Record<string, number> = {}
    allEntries.forEach(e => (e.tags ?? []).forEach((t: string) => { counts[t] = (counts[t] ?? 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
  }, [allEntries])

  const filteredEntries = useMemo(() =>
    activeTag ? allEntries.filter(e => (e.tags ?? []).includes(activeTag)) : allEntries,
    [allEntries, activeTag]
  )

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setActiveTag(null)
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.results ?? [])
    setLoading(false)
  }

  function handleTagClick(tag: string) {
    setActiveTag(prev => prev === tag ? null : tag)
    setSearched(false)
    setQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </span>
          <div className="flex items-center gap-6">
            {isAdmin(session?.user?.email) && (
              <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Admin</a>
            )}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-8">
          <h1 className="page-heading mb-2" style={{ color: '#000000' }}>Find what you need.</h1>
          <p className="text-base text-gray-500">Search for assets, objection handling, personas, and more.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. How do I talk to a CFO about ROI?"
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 transition-opacity"
            style={{ background: '#e5df00', color: '#000000' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                  activeTag === tag
                    ? 'border-transparent font-medium'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
                style={activeTag === tag ? { background: '#e5df00', color: '#000000', borderColor: '#e5df00' } : {}}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Tag filter results */}
        {!searched && activeTag && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
              {filteredEntries.length} asset{filteredEntries.length !== 1 ? 's' : ''} tagged "{activeTag}"
            </p>
            {filteredEntries.map((item: any) => <ResultCard key={item.id} item={item} admin={admin} />)}
          </div>
        )}

        {/* Default: recently added */}
        {!searched && !activeTag && recent.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Recently Added</p>
            <div className="space-y-2">
              {recent.map((item: any) => <ResultCard key={item.id} item={item} admin={admin} />)}
            </div>
            <a href="/browse" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors">
              View all {allEntries.length > 0 ? `${allEntries.length} ` : ''}assets →
            </a>
          </div>
        )}

        {/* Search results */}
        {searched && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((item: any) => <ResultCard key={item.id} item={item} admin={admin} />)}
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <p className="mt-10 text-sm text-gray-400">No results found. Try a different question.</p>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} DocuSketch. All rights reserved.</p>
          <p className="text-xs text-gray-400">Confidential — for internal use only. Do not distribute.</p>
        </div>
      </footer>
    </div>
  )
}
