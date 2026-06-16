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
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-5">
        <header className="bg-white rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm max-w-5xl mx-auto">
          <a href="/" className="text-lg font-bold" style={{ fontFamily: 'Lora, Georgia, serif', color: '#000000' }}>Sales Library°</a>
          <div className="flex gap-4 items-center">
            {isAdmin(session?.user?.email) && (
              <a href="/admin" className="text-sm font-medium hover:opacity-70" style={{ color: '#000000' }}>Admin</a>
            )}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-2 rounded-xl"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <a href="/browse" className="text-sm text-gray-400 hover:text-gray-600">← All assets</a>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {tag} {!loading && <span className="text-gray-400 font-normal text-lg">({entries.length})</span>}
          </h2>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400">No entries found for this tag.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
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
                      : <p className="font-semibold text-gray-900">{item.title}</p>
                    }
                    {item.summary && <p className="text-sm text-gray-500 mt-1">{item.summary}</p>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="mt-1 block text-xs text-gray-400 hover:text-blue-600 truncate">{item.url}</a>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {item.tags.map((t: string) => (
                          <a key={t} href={`/tag/${encodeURIComponent(t)}`}
                            className={`text-xs px-2 py-1 rounded-full transition ${t === tag ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
