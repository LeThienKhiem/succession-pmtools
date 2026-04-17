'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Trash2, Bot, Loader2, AlertTriangle, CheckCircle2, X, Database } from 'lucide-react'
import { formatBytes } from '@/lib/project-docs'
import { getKnowledge, addKnowledge, deleteKnowledge, type Knowledge } from '@/lib/queries'
import Link from 'next/link'

const ACCEPT = '.docx,.pdf,.txt,.md'

interface Props {
  projectId: string
}

export function ProjectDocsPanel({ projectId }: Props) {
  const [docs,      setDocs]      = useState<Knowledge[]>([])
  const [loading,   setLoading]   = useState(true)
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [toast,     setToast]     = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!projectId) { setLoading(false); return }
    getKnowledge(projectId)
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  function showToast(type: 'ok' | 'err', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  async function processFile(file: File) {
    if (docs.find(d => d.doc_name === file.name)) {
      showToast('err', `"${file.name}" đã tồn tại. Xóa cũ rồi upload lại.`); return
    }
    setUploading(file.name)
    try {
      // 1. Extract text
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/docs/extract', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) { showToast('err', json.error ?? 'Lỗi đọc file'); return }

      // 2. Save to Supabase knowledge base
      const saved = await addKnowledge({
        project_id: projectId,
        doc_name:   file.name,
        doc_type:   file.name.split('.').pop() ?? 'doc',
        content:    json.text as string,
        file_size:  file.size,
      })
      setDocs(prev => [saved, ...prev])
      showToast('ok', `"${file.name}" đã lưu vào Knowledge Base — bot sẽ tự dùng khi phân tích.`)
    } catch (e: any) {
      showToast('err', e.message)
    } finally {
      setUploading(null)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const f of Array.from(files)) await processFile(f)
  }

  async function handleDelete(id: string) {
    setDocs(prev => prev.filter(d => d.id !== id))
    await deleteKnowledge(id)
  }

  const fileIcon = (name: string) => {
    if (name.endsWith('.pdf'))  return '📕'
    if (name.endsWith('.docx')) return '📘'
    if (name.endsWith('.md'))   return '📝'
    return '📄'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-900">Knowledge Base</span>
          {docs.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full">
              {docs.length}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-1">· lưu Supabase, bot tự đọc</span>
        </div>
        <div className="flex items-center gap-2">
          {docs.length > 0 && (
            <Link href="/bot"
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
              <Bot size={12} /> Mở Bot
            </Link>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={!!uploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-16 gap-2 text-xs text-gray-400">
          <Loader2 size={13} className="animate-spin" /> Đang tải...
        </div>
      )}

      {/* Doc list */}
      {!loading && docs.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {docs.map(doc => (
            <li key={doc.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-gray-50 transition-colors">
              <span className="text-lg shrink-0">{fileIcon(doc.doc_name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.doc_name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(doc.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ''}
                  {' · '}<span className="text-indigo-400">{doc.content.length.toLocaleString()} ký tự</span>
                </p>
              </div>
              <button onClick={() => handleDelete(doc.id)}
                className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        className={`flex items-center justify-center gap-2 cursor-pointer transition-colors ${
          docs.length === 0 && !loading ? 'h-20' : 'h-12 border-t border-gray-50'
        } ${dragging ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-indigo-500 text-xs">
            <Loader2 size={13} className="animate-spin" /> Đang đọc {uploading}...
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {dragging ? '📂 Thả vào đây' : `Kéo thả hoặc click · ${ACCEPT}`}
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mx-4 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          toast.type === 'ok'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {toast.type === 'ok'
            ? <CheckCircle2 size={13} className="shrink-0" />
            : <AlertTriangle size={13} className="shrink-0" />}
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)}><X size={12} /></button>
        </div>
      )}
    </div>
  )
}
