'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, ChevronDown, ChevronUp, Link2, Upload, FileText, Table2, CheckCircle2, AlertTriangle, RotateCcw, Check, X, Loader2, Brain, BookOpen } from 'lucide-react'
import { DEFAULT_BRAIN } from '@/lib/default-brain'
import { loadDocs, formatBytes, type ProjectDoc } from '@/lib/project-docs'
import { updateTask } from '@/lib/queries'
import type { Task } from '@/lib/mock-data'
import type { Proposal } from '@/app/api/bot/analyze/route'

const LS_BRAIN_KEY = 'pm-project-brain'

interface Props {
  tasks: Task[]
  members: any[]
}

type Tab = 'doc' | 'report'
type DocInput = 'url' | 'file'

function loadBrain() {
  try { return localStorage.getItem(LS_BRAIN_KEY) ?? DEFAULT_BRAIN } catch { return DEFAULT_BRAIN }
}
function saveBrain(v: string) {
  try { localStorage.setItem(LS_BRAIN_KEY, v) } catch {}
}

export function BotClient({ tasks }: Props) {
  const [tab, setTab]             = useState<Tab>('doc')
  const [docInput, setDocInput]   = useState<DocInput>('url')
  const [url, setUrl]             = useState('')
  const [file, setFile]           = useState<File | null>(null)
  const [brain, setBrain]         = useState<string>(() => typeof window !== 'undefined' ? loadBrain() : DEFAULT_BRAIN)
  const [showBrain, setShowBrain] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [proposals, setProposals] = useState<(Proposal & { selected: boolean })[]>([])
  const [applied, setApplied]     = useState(false)
  const [applying, setApplying]   = useState(false)
  const [projectDocs, setProjectDocs]           = useState<ProjectDoc[]>([])
  const [includedDocIds, setIncludedDocIds]      = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)

  // Load project docs from localStorage after hydration
  useEffect(() => {
    const docs = loadDocs()
    setProjectDocs(docs)
    // Auto-select all docs by default
    setIncludedDocIds(new Set(docs.map(d => d.id)))
  }, [])

  function handleBrainChange(v: string) {
    setBrain(v)
    saveBrain(v)
  }

  async function handleAnalyze() {
    setError(null)
    setProposals([])
    setApplied(false)
    setAnalyzing(true)

    try {
      // Build brain = base brain + selected project docs
      const selectedDocs = projectDocs.filter(d => includedDocIds.has(d.id))
      const brainWithDocs = selectedDocs.length > 0
        ? brain + '\n\n## Tài liệu dự án đính kèm\n' + selectedDocs.map(d =>
            `### ${d.name}\n${d.content.slice(0, 8000)}`
          ).join('\n\n---\n\n')
        : brain

      const fd = new FormData()
      fd.append('tasks', JSON.stringify(tasks))
      fd.append('brain', brainWithDocs)

      if (tab === 'doc') {
        if (docInput === 'url') {
          if (!url.trim()) { setError('Nhập URL Google Docs'); return }
          fd.append('type', 'doc-url')
          fd.append('url', url.trim())
        } else {
          if (!file) { setError('Chọn file .docx'); return }
          fd.append('type', 'doc-file')
          fd.append('file', file)
        }
      } else {
        if (!file) { setError('Chọn file Excel'); return }
        fd.append('type', 'report')
        fd.append('file', file)
      }

      const res  = await fetch('/api/bot/analyze', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.error ?? 'Lỗi không xác định')
        return
      }

      if (!json.proposals?.length) {
        setError('Bot không tìm thấy thay đổi nào cần cập nhật.')
        return
      }

      setProposals(json.proposals.map((p: Proposal) => ({ ...p, selected: p.confidence >= 0.75 })))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleApply() {
    const toApply = proposals.filter(p => p.selected)
    if (!toApply.length) return
    setApplying(true)
    for (const p of toApply) {
      await updateTask(p.task_id, { status: p.new_status as Task['status'] })
    }
    setApplying(false)
    setApplied(true)
  }

  function resetFile() { setFile(null); if (fileRef.current) fileRef.current.value = '' }

  const selectedCount = proposals.filter(p => p.selected).length
  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">PM Bot</h1>
          <p className="text-xs text-gray-400">Phân tích tài liệu và cập nhật tiến độ tự động</p>
        </div>
      </div>

      {/* Project Brain Panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowBrain(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <Brain size={15} className="text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">Project Brain</span>
          <span className="text-xs text-gray-400 ml-1">— ngữ cảnh dự án cho bot</span>
          <div className="flex-1" />
          {showBrain ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </button>
        {showBrain && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mt-3 mb-2">Chỉnh sửa khi requirements thay đổi. Bot dùng nội dung này làm ngữ cảnh cho mọi lần phân tích.</p>
            <textarea
              value={brain}
              onChange={e => handleBrainChange(e.target.value)}
              rows={12}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        )}
      </div>

      {/* Project Docs */}
      {projectDocs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <BookOpen size={14} className="text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">Tài liệu dự án</span>
            <span className="text-xs text-gray-400">— bot sẽ đọc tài liệu được tick</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {projectDocs.map(doc => {
              const on = includedDocIds.has(doc.id)
              return (
                <li
                  key={doc.id}
                  onClick={() => setIncludedDocIds(prev => {
                    const n = new Set(prev)
                    on ? n.delete(doc.id) : n.add(doc.id)
                    return n
                  })}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${on ? 'bg-indigo-50/40 hover:bg-indigo-50' : 'opacity-50 hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${on ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                    {on && <Check size={9} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-base shrink-0">
                    {doc.name.endsWith('.pdf') ? '📕' : doc.name.endsWith('.docx') ? '📘' : '📝'}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{doc.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatBytes(doc.size)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Tab selector */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: 'doc',    label: 'BA Docs',        icon: FileText },
          { key: 'report', label: 'Daily Report',   icon: Table2 },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setFile(null); setProposals([]); setError(null); setApplied(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">

        {tab === 'doc' && (
          <>
            {/* Sub-toggle: URL vs file */}
            <div className="flex items-center gap-3">
              {([
                { key: 'url',  label: 'Google Docs URL', icon: Link2 },
                { key: 'file', label: 'Upload .docx',    icon: Upload },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setDocInput(key); resetFile(); setError(null) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    docInput === key
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {docInput === 'url' ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Google Docs URL <span className="text-gray-400 font-normal">(doc phải share "Anyone with link can view")</span>
                </label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className={inputCls}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">File .docx</label>
                <FileDropZone accept=".docx" file={file} onFile={setFile} onClear={resetFile} ref={fileRef} />
              </div>
            )}
          </>
        )}

        {tab === 'report' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              File Excel (.xlsx) <span className="text-gray-400 font-normal">— daily report của developer</span>
            </label>
            <FileDropZone accept=".xlsx,.xls" file={file} onFile={setFile} onClear={resetFile} ref={fileRef} />
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 font-medium mb-1">Format cột chuẩn:</p>
              <p className="text-xs text-blue-600 font-mono">Task ID | Task Title | Ngày | Đã làm | Tiến độ % | Blocker</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <><Loader2 size={15} className="animate-spin" /> Đang phân tích...</>
          ) : (
            <><Bot size={15} /> Phân tích</>
          )}
        </button>
      </div>

      {/* Proposals */}
      {proposals.length > 0 && !applied && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-indigo-500" />
              <span className="text-sm font-semibold text-gray-900">Đề xuất cập nhật</span>
              <span className="text-xs text-gray-400">({proposals.length} thay đổi)</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setProposals(p => p.map(x => ({ ...x, selected: true })))}
                className="text-xs text-indigo-500 hover:text-indigo-700">Chọn tất cả</button>
              <span className="text-gray-200">|</span>
              <button onClick={() => setProposals(p => p.map(x => ({ ...x, selected: false })))}
                className="text-xs text-gray-400 hover:text-gray-600">Bỏ chọn</button>
            </div>
          </div>

          <ul className="divide-y divide-gray-50">
            {proposals.map((p, i) => (
              <li
                key={i}
                onClick={() => setProposals(prev => prev.map((x, j) => j === i ? { ...x, selected: !x.selected } : x))}
                className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                  p.selected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50 opacity-60'
                }`}
              >
                {/* Checkbox */}
                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  p.selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                }`}>
                  {p.selected && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.task_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={p.current_status} />
                    <span className="text-gray-400 text-xs">→</span>
                    <StatusBadge status={p.new_status} highlight />
                    <span className="ml-auto text-xs text-gray-400">
                      {Math.round(p.confidence * 100)}% chắc
                    </span>
                  </div>
                  {p.note && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.note}</p>}
                </div>
              </li>
            ))}
          </ul>

          {/* Apply footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
            <button
              onClick={() => { setProposals([]); setError(null) }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw size={12} /> Hủy
            </button>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">{selectedCount} / {proposals.length} được chọn</span>
            <button
              onClick={handleApply}
              disabled={applying || selectedCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {applying ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Áp dụng {selectedCount} thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Applied confirmation */}
      {applied && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">Đã cập nhật thành công!</p>
            <p className="text-xs text-green-600 mt-0.5">
              {selectedCount} task đã được cập nhật. Vào Sprint Board để kiểm tra.
            </p>
          </div>
          <button onClick={() => { setApplied(false); setProposals([]); setUrl(''); resetFile() }}
            className="text-xs text-green-700 underline hover:no-underline">Phân tích tiếp</button>
        </div>
      )}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  'todo':        { label: 'Todo',        bg: '#F3F4F6', text: '#6B7280' },
  'in-progress': { label: 'In Progress', bg: '#EFF6FF', text: '#3B82F6' },
  'done':        { label: 'Done',        bg: '#F0FDF4', text: '#22C55E' },
  'blocked':     { label: 'Blocked',     bg: '#FEF2F2', text: '#EF4444' },
}

function StatusBadge({ status, highlight }: { status: string; highlight?: boolean }) {
  const s = STATUS_MAP[status] ?? { label: status, bg: '#F3F4F6', text: '#6B7280' }
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-xs font-medium ${highlight ? 'ring-1 ring-offset-1' : ''}`}
      style={{ backgroundColor: s.bg, color: s.text, ...(highlight ? { ringColor: s.text } : {}) }}
    >
      {s.label}
    </span>
  )
}

// ─── File Drop Zone ───────────────────────────────────────────────────────────

import { forwardRef } from 'react'

const FileDropZone = forwardRef<HTMLInputElement, {
  accept: string
  file: File | null
  onFile: (f: File) => void
  onClear: () => void
}>(({ accept, file, onFile, onClear }, ref) => {
  const [dragging, setDragging] = useState(false)

  if (file) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 border border-indigo-200 bg-indigo-50 rounded-lg">
        <FileText size={16} className="text-indigo-500 shrink-0" />
        <span className="flex-1 text-sm text-indigo-700 truncate font-medium">{file.name}</span>
        <button onClick={onClear} className="w-5 h-5 rounded flex items-center justify-center text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 transition-colors">
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
      onClick={() => (ref as any)?.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
      }`}
    >
      <Upload size={18} className="text-gray-400" />
      <p className="text-xs text-gray-400">Kéo thả hoặc <span className="text-indigo-500 font-medium">chọn file</span></p>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
    </div>
  )
})
FileDropZone.displayName = 'FileDropZone'
