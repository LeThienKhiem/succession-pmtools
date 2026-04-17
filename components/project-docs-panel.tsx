'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Trash2, Bot, Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { loadDocs, addDoc, removeDoc, formatBytes, type ProjectDoc } from '@/lib/project-docs'
import Link from 'next/link'

const ACCEPT = '.docx,.pdf,.txt,.md'

export function ProjectDocsPanel() {
  const [docs,      setDocs]      = useState<ProjectDoc[]>([])
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState<string | null>(null) // filename being processed
  const [toast,     setToast]     = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDocs(loadDocs()) }, [])

  function showToast(type: 'ok' | 'err', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  async function processFile(file: File) {
    if (docs.find(d => d.name === file.name)) {
      showToast('err', `"${file.name}" đã tồn tại. Xóa cũ rồi upload lại.`)
      return
    }
    setUploading(file.name)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/docs/extract', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) { showToast('err', json.error ?? 'Lỗi đọc file'); return }

      const doc: ProjectDoc = {
        id:          `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name:        file.name,
        uploaded_at: new Date().toISOString(),
        size:        file.size,
        content:     json.text,
      }
      addDoc(doc)
      setDocs(loadDocs())
      showToast('ok', `"${file.name}" đã được thêm vào — bot sẽ đọc khi phân tích.`)
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

  function handleDelete(id: string) {
    removeDoc(id)
    setDocs(loadDocs())
  }

  const fileIcon = (name: string) => {
    if (name.endsWith('.pdf'))          return '📕'
    if (name.endsWith('.docx'))         return '📘'
    if (name.endsWith('.md'))           return '📝'
    return '📄'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-900">Tài liệu dự án</span>
          {docs.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full">
              {docs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {docs.length > 0 && (
            <Link href="/bot"
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
              <Bot size={12} />
              Mở Bot
            </Link>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!!uploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </div>
      </div>

      {/* Doc list */}
      {docs.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {docs.map(doc => (
            <li key={doc.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-gray-50 transition-colors">
              <span className="text-lg shrink-0">{fileIcon(doc.name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(doc.uploaded_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {' · '}{formatBytes(doc.size)}
                  {' · '}<span className="text-indigo-400">{doc.content.length.toLocaleString()} ký tự</span>
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Link href="/bot"
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                  <Bot size={11} /> Phân tích
                </Link>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Drop zone (shown when empty or as bottom area) */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        className={`flex items-center justify-center gap-2 cursor-pointer transition-colors ${
          docs.length === 0 ? 'h-20' : 'h-12 border-t border-gray-50'
        } ${dragging ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-indigo-500 text-xs">
            <Loader2 size={13} className="animate-spin" />
            Đang đọc {uploading}...
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
