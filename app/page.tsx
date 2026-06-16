'use client'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'

function AssetThumbnail({ fileType }: { fileType: string }) {
  switch (fileType) {
    case 'PDF':
      return (
        <div className="w-14 h-14 rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#EA4335"/>
            <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PDF</text>
          </svg>
          <span className="text-xs text-red-700 font-medium mt-1">PDF</span>
        </div>
      )
    case 'Presentation':
      return (
        <div className="w-14 h-14 rounded-lg bg-yellow-50 border border-yellow-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#FBBC04"/>
            <rect x="6" y="8" width="12" height="2" rx="1" fill="white"/>
            <rect x="6" y="12" width="8" height="2" rx="1" fill="white"/>
          </svg>
          <span className="text-xs text-yellow-700 font-medium mt-1">Slides</span>
        </div>
      )
    case 'Document':
      return (
        <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#4285F4"/>
            <rect x="6" y="7" width="12" height="2" rx="1" fill="white"/>
            <rect x="6" y="11" width="12" height="2" rx="1" fill="white"/>
            <rect x="6" y="15" width="8" height="2" rx="1" fill="white"/>
          </svg>
          <span className="text-xs text-blue-700 font-medium mt-1">Doc</span>
        </div>
      )
    case 'Spreadsheet':
      return (
        <div className="w-14 h-14 rounded-lg bg-green-50 border border-green-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853"/>
            <rect x="6" y="7" width="5" height="3" rx="0.5" fill="white"/>
            <rect x="13" y="7" width="5" height="3" rx="0.5" fill="white"/>
            <rect x="6" y="12" width="5" height="3" rx="0.5" fill="white"/>
            <rect x="13" y="12" width="5" height="3" rx="0.5" fill="white"/>
          </svg>
          <span className="text-xs text-green-700 font-medium mt-1">Sheet</span>
        </div>
      )
    case 'Video':
      return (
        <div className="w-14 h-14 rounded-lg bg-purple-50 border border-purple-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#7C3AED"/>
            <path d="M10 8l6 4-6 4V8z" fill="white"/>
          </svg>
          <span className="text-xs text-purple-700 font-medium mt-1">Video</span>
        </div>
      )
    case 'Email':
      return (
        <div className="w-14 h-14 rounded-lg bg-sky-50 border border-sky-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="#0EA5E9"/>
            <path d="M3 7l9 6 9-6" stroke="white" strokeWidth="1.5"/>
          </svg>
          <span className="text-xs text-sky-700 font-medium mt-1">Email</span>
        </div>
      )
    case 'Webpage':
      return (
        <div className="w-14 h-14 rounded-lg bg-orange-50 border border-orange-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#F97316"/>
            <path d="M3 8h18M8 3v18" stroke="white" strokeWidth="1.5"/>
          </svg>
          <span className="text-xs text-orange-700 font-medium mt-1">Web</span>
        </div>
      )
    default:
      return (
        <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs text-gray-500 font-medium mt-1">Other</span>
        </div>
      )
  }
}

export default function Home() {
  const { data: session } = useSession()
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
          {isAdmin(session?.user?.email) && (
            <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Manage</a>
          )}
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
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.summary}</p>
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
                </div>
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
