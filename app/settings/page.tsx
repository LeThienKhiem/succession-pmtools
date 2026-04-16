import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-indigo-600" />
        <h1 className="text-lg font-bold text-gray-900">Thiết lập</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Kết nối Database</h2>
        <p className="text-sm text-gray-500 mb-4">
          Dự án này sẽ dùng chung Supabase project với SuccessionOS.
          Điền thông tin kết nối vào file <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> để kích hoạt.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 space-y-1">
          <p>NEXT_PUBLIC_SUPABASE_URL=<span className="text-indigo-500">https://your-project.supabase.co</span></p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-indigo-500">your-anon-key</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Thông tin dự án</h2>
        <p className="text-sm text-gray-500">Cấu hình tên dự án, timeline và team sẽ được mở sau khi kết nối DB.</p>
      </div>
    </div>
  )
}
