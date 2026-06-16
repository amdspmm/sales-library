'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Sales Library</h1>
        <div className="flex gap-4 items-center">
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Manage</a>
          <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">What do you need?</h2>
        <p className="text-gray-500 text-center mb-8">Ask anything — how to position a feature, handle an objection, talk to a persona.</p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. How do I talk to a CFO about ROI?"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-10 space-y-4">
            {results.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.summary}</p>
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 text-xs text-blue-600 hover:underline">
                      Open →
                    </a>
                  )}
                </div>
                {item.content && (
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {item.tags.map((tag: string) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <p className="text-center text-gray-400 mt-10 text-sm">No results found. Try a different question.</p>
        )}
      </main>
    </div>
  )
}
