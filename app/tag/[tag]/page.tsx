'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetCard from '@/components/AssetCard'

export default function TagPage() {
  const { data: session } = useSession()
  const admin = isAdmin(session?.user?.email)
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
    <div className="min-h-screen bg-[#f4f3ea]">
      <nav className="bg-white border-b border-[#e2e0d3]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold text-gray-900 hover:text-black transition-colors" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            DocuSketch Sales & CS Library
          </a>
          <div className="flex items-center gap-6">
            {admin && (
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
            {entries.map((item: any) => <AssetCard key={item.id} item={item} admin={admin} activeTag={tag} />)}
          </div>
        )}
      </main>
    </div>
  )
}
