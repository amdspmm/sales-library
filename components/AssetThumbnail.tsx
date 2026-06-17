export default function AssetThumbnail({ fileType }: { fileType: string }) {
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
        <div className="w-14 h-14 rounded-lg bg-[#f4f3ea] border border-[#e2e0d3] flex flex-col items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs text-gray-500 font-medium mt-1">Other</span>
        </div>
      )
  }
}
