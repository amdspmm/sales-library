'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { isAdmin } from '@/lib/admins'
import AssetThumbnail from '@/components/AssetThumbnail'

type Entry = {
  id: string
  title: string
  summary: string
  content: string
  url: string
  file_type: string
  tags: string[]
}

const FILE_TYPES = ['PDF', 'Video', 'Email', 'Presentation', 'Webpage', 'Document', 'Spreadsheet', 'Other']

export default function AdminPage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [form, setForm] = useState({ title: '', summary: '', content: '', url: '', file_type: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchEntries() }, [])

  if (!isAdmin(session?.user?.email)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Access denied.</div>
  }

  async function fetchEntries() {
    const res = await fetch('/api/entries')
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }

  function startNew() {
    setEditing(null)
    setForm({ title: '', summary: '', content: '', url: '', file_type: '', tags: '' })
    setMessage('')
  }

  function startEdit(entry: Entry) {
    setEditing(entry)
    setForm({
      title: entry.title,
      summary: entry.summary,
      content: entry.content,
      url: entry.url ?? '',
      file_type: entry.file_type ?? '',
      tags: (entry.tags ?? []).join(', '),
    })
    setMessage('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      id: editing?.id,
      file_type: form.file_type || null,
    }
    const res = await fetch('/api/entries', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMessage(editing ? 'Updated!' : 'Added!')
      setEditing(null)
      setForm({ title: '', summary: '', content: '', url: '', file_type: '', tags: '' })
      fetchEntries()
    } else {
      setMessage('Something went wrong.')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch('/api/entries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchEntries()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-5">
        <header className="bg-white rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm max-w-5xl mx-auto">
          <h1 className="text-lg font-bold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#000000' }}>DocuSketch Sales & CS Library — Admin</h1>
          <div className="flex gap-4 items-center">
            <a href="/browse" className="text-sm font-medium hover:opacity-70" style={{ color: '#000000' }}>Quick Edit</a>
            <a href="/" className="text-sm font-medium px-4 py-2 rounded-xl" style={{ background: '#e5df00', color: '#000000' }}>← Back to library</a>
          </div>
        </header>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">


        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Entry' : 'Add New Entry'}</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Title" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
            <input value={form.summary} onChange={e => setForm({...form, summary: e.target.value})}
              placeholder="Short summary (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              placeholder="Full content / talking points (optional)" rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
            <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              placeholder="Link to asset (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
            <select value={form.file_type} onChange={e => setForm({...form, file_type: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
              <option value="">File type (optional)</option>
              {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              placeholder="Tags, comma separated (e.g. CFO, ROI, objection)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Add Entry'}
              </button>
              {editing && (
                <button type="button" onClick={startNew}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
          </form>
        </div>

        {/* Entry list */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">All Entries ({entries.length})</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-400">No entries yet. Add your first one!</p>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      {entry.file_type && (
                        <div className="shrink-0 scale-75 origin-top-left">
                          <AssetThumbnail fileType={entry.file_type} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{entry.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{entry.summary}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(entry)}
                        className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                  {entry.tags?.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
