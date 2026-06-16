'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

export default function EntryPage() {
  const { data: session } = useSession()
  const admin = isAdmin(session?.user?.email)
  const params = useParams()
  const id = params.id as string
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/entries/${id}`)
      .then(r => r.json())
      .then(d => { setEntry(d.entry); setLoading(false) })
  }, [id])

  function copyLink() {
    if (!entry?.url) return
    navigator.clipboard.writeText(entry.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold text-gray-900 hover:text-black transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </a>
          <div className="flex items-center gap-6">
            {admin && <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Admin</a>}
            <button onClick={() => signOut()}
              className="text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
              style={{ background: '#e5df00', color: '#000000' }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back</a>

        {loading && <p className="text-sm text-gray-400 mt-8">Loading...</p>}

        {!loading && !entry && (
          <p className="text-sm text-gray-400 mt-8">Entry not found.</p>
        )}

        {!loading && entry && (
          <div className="mt-6">
            <div className="flex items-start gap-4 mb-6">
              {entry.file_type && (
                <div className="shrink-0 mt-1">
                  <AssetThumbnail fileType={entry.file_type} />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 leading-snug" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  {entry.title}
                </h1>
                {entry.file_type && (
                  <p className="text-sm text-gray-400 mt-1">{entry.file_type}</p>
                )}
              </div>
            </div>

            {entry.summary && (
              <p className="text-base text-gray-600 leading-relaxed mb-6">{entry.summary}</p>
            )}

            {entry.content && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Details</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
              </div>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-8">
                {entry.tags.map((tag: string) => (
                  <a key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                    className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors">
                    {tag}
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              {entry.url && (
                <a href={entry.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#e5df00', color: '#000000' }}>
                  Open asset →
                </a>
              )}
              {entry.url && (
                <button onClick={copyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-600 hover:border-gray-400 transition-colors">
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>
              )}
              {admin && (
                <a href={`/admin?edit=${entry.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-600 hover:border-gray-400 transition-colors ml-auto">
                  Edit
                </a>
              )}
            </div>

            {!entry.url && (
              <p className="text-sm text-gray-400 mt-2">No link available for this asset yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
