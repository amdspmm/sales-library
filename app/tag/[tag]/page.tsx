'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

export default function TagPage() {
  const { data: session } = useSession()
  const params = useParams()
  const tag = decodeURIComponent(params.tag as string)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/entries/by-tag?tag=${encodeURIComponent(tag)}`).then(r => r.json()).then(d => {
      setEntries(d.entries ?? [])
      setLoading(false)
    })
  }, [tag])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold text-gray-900 hover:text-black transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </a>
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <a href="/browse" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← All assets</a>
          <h1 className="text-xl font-semibold text-gray-900 mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {tag} {!loading && <span className="text-gray-400 font-normal text-base">({entries.length})</span>}
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400">No entries found for this tag.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
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
                    {item.url
                      ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:underline underline-offset-2">{item.title}</a>
                      : <p className="font-semibold text-gray-900">{item.title}</p>
                    }
                    {item.summary && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.summary}</p>}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex gap-1.5 flex-wrap">
                        {item.tags.map((t: string) => (
                          <a key={t} href={`/tag/${encodeURIComponent(t)}`}
                            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${t === tag ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {t}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
