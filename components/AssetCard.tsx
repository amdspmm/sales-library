'use client'
import AssetThumbnail from './AssetThumbnail'

type Props = {
  item: any
  admin: boolean
  activeTag?: string
}

function cardBg(safe: boolean | null | undefined) {
  if (safe === true) return 'bg-green-50 border-green-200 hover:border-green-300'
  if (safe === false) return 'bg-red-50 border-red-200 hover:border-red-300'
  return 'bg-white border-gray-200 hover:border-gray-300'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AssetCard({ item, admin, activeTag }: Props) {
  return (
    <div className={`rounded-lg border p-5 transition-colors ${cardBg(item.safe_to_share)}`}>
      <div className="flex items-start gap-4">
        {item.file_type && (
          <div className="shrink-0 mt-0.5">
            <AssetThumbnail fileType={item.file_type} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <a href={`/entry/${item.id}`} className="font-semibold text-gray-900 hover:underline underline-offset-2 leading-snug">
            {item.title}
          </a>
          {item.summary && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.summary}</p>
          )}

          {/* Metadata chicklets */}
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            {item.file_type && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-700 text-white">
                {item.file_type}
              </span>
            )}
            {item.topic && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {item.topic}
              </span>
            )}
            {item.tags && item.tags.map((tag: string) => (
              <a
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors border ${
                  tag === activeTag
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                }`}
              >
                {tag}
              </a>
            ))}
          </div>

          {/* Date + share status */}
          <div className="mt-2 flex items-center gap-3">
            {item.created_at && (
              <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
            )}
            {item.safe_to_share === true && (
              <span className="text-xs text-green-700 font-medium">✓ Safe to share externally</span>
            )}
            {item.safe_to_share === false && (
              <span className="text-xs text-red-600 font-medium">⚠ Internal only</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
