'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import {
  Bot, ChevronDown, ChevronUp, Link2, Upload, FileText, Table2,
  CheckCircle2, AlertTriangle, RotateCcw, Check, X, Loader2,
  Brain, BookOpen, Lightbulb, Clock, MessageSquare, Send, User,
} from 'lucide-react'
import { DEFAULT_BRAIN } from '@/lib/default-brain'
import { loadDocs, formatBytes, type ProjectDoc } from '@/lib/project-docs'
import { updateTask, getDecisions, type Decision } from '@/lib/queries'
import type { Task } from '@/lib/mock-data'
import type { Proposal, TimelineRisk } from '@/app/api/bot/analyze/route'
import type { ChatMessage } from '@/app/api/bot/chat/route'

const LS_BRAIN_KEY  = 'pm-project-brain'
const LS_CHAT_KEY   = 'pm-bot-chat-history'

function loadBrain() {
  try { return localStorage.getItem(LS_BRAIN_KEY) ?? DEFAULT_BRAIN } catch { return DEFAULT_BRAIN }
}
function saveBrain(v: string) {
  try { localStorage.setItem(LS_BRAIN_KEY, v) } catch {}
}
function loadChatHistory(): (ChatMessage & { ts: number })[] {
  try { return JSON.parse(localStorage.getItem(LS_CHAT_KEY) ?? '[]') } catch { return [] }
}
function saveChatHistory(msgs: (ChatMessage & { ts: number })[]) {
  try { localStorage.setItem(LS_CHAT_KEY, JSON.stringify(msgs.slice(-60))) } catch {}
}

// ─── Smart chunking ──────────────────────────────────────────────────────────
// Extracts the most relevant sections from a large doc based on task keywords.
function smartChunk(content: string, keywords: string[], maxChars: number): string {
  if (content.length <= maxChars) return content

  const intro    = content.slice(0, 1500)
  const rest     = content.slice(1500)
  const budget   = maxChars - intro.length
  if (budget <= 0) return content.slice(0, maxChars)

  const CHUNK = 600
  const chunks: { text: string; idx: number; score: number }[] = []
  const lkw   = keywords.map(k => k.toLowerCase())

  for (let i = 0; i < rest.length; i += CHUNK) {
    const text  = rest.slice(i, i + CHUNK)
    const lower = text.toLowerCase()
    const score = lkw.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0)
    chunks.push({ text, idx: i, score })
  }

  chunks.sort((a, b) => b.score - a.score || a.idx - b.idx)
  const selected: typeof chunks = []
  let used = 0
  for (const c of chunks) {
    if (used + c.text.length > budget) break
    selected.push(c)
    used += c.text.length
  }
  selected.sort((a, b) => a.idx - b.idx)

  return intro + '\n\n[...]\n\n' + selected.map(c => c.text).join('')
}

// Build context string from selected docs (excluding primary doc being analyzed)
function buildDocContext(
  docs: ProjectDoc[],
  taskKeywords: string[],
  maxTotal: number,
  excludeId?: string,
): string {
  const ctx = docs.filter(d => d.id !== excludeId)
  if (!ctx.length) return ''

  const totalLen = ctx.reduce((s, d) => s + d.content.length, 0) || 1
  return ctx.map(d => {
    const perDoc = Math.max(3000, Math.min(20000, Math.floor(maxTotal * d.content.length / totalLen)))
    return `### ${d.name}\n${smartChunk(d.content, taskKeywords, perDoc)}`
  }).join('\n\n---\n\n')
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  tasks:     Task[]
  members:   any[]
  sprints:   any[]
  projectId: string
}

type Tab      = 'doc' | 'report' | 'chat'
type DocInput = 'url' | 'file' | 'project-doc'

// ─── Component ───────────────────────────────────────────────────────────────

export function BotClient({ tasks, sprints, projectId }: Props) {
  // ── Shared ──────────────────────────────────────────────────────────────────
  const [brain,        setBrain]       = useState(() => typeof window !== 'undefined' ? loadBrain() : DEFAULT_BRAIN)
  const [showBrain,    setShowBrain]   = useState(false)
  const [projectDocs,  setProjectDocs] = useState<ProjectDoc[]>([])
  const [decisions,    setDecisions]   = useState<Decision[]>([])
  const [tab,          setTab]         = useState<Tab>('doc')

  // ── Analyze state ───────────────────────────────────────────────────────────
  const [docInput,       setDocInput]      = useState<DocInput>('url')
  const [url,            setUrl]           = useState('')
  const [file,           setFile]          = useState<File | null>(null)
  const [primaryDocId,   setPrimaryDocId]  = useState<string | null>(null)
  const [includedDocIds, setIncludedDocIds] = useState<Set<string>>(new Set())
  const [analyzing,      setAnalyzing]     = useState(false)
  const [analyzeError,   setAnalyzeError]  = useState<string | null>(null)
  const [proposals,      setProposals]     = useState<(Proposal & { selected: boolean })[]>([])
  const [suggestions,    setSuggestions]   = useState<string[]>([])
  const [timelineRisks,  setTimelineRisks] = useState<TimelineRisk[]>([])
  const [applied,        setApplied]       = useState(false)
  const [applying,       setApplying]      = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<(ChatMessage & { ts: number })[]>([])
  const [chatInput,    setChatInput]    = useState('')
  const [chatLoading,  setChatLoading]  = useState(false)
  const [chatError,    setChatError]    = useState<string | null>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const docs = loadDocs()
    setProjectDocs(docs)
    setIncludedDocIds(new Set(docs.map(d => d.id)))
    if (projectId) getDecisions(projectId).then(setDecisions).catch(() => {})
    setChatMessages(loadChatHistory())
  }, [projectId])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  function handleBrainChange(v: string) { setBrain(v); saveBrain(v) }

  // ── Analyze ─────────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    setAnalyzeError(null)
    setProposals([]); setSuggestions([]); setTimelineRisks([])
    setApplied(false)
    setAnalyzing(true)

    try {
      const taskKeywords = tasks.flatMap(t => t.title.split(/\s+/).filter(w => w.length > 3))
      const selectedDocs = projectDocs.filter(d => includedDocIds.has(d.id))
      const docContext   = buildDocContext(selectedDocs, taskKeywords, 50000, primaryDocId ?? undefined)
      const brainWithDocs = docContext
        ? brain + '\n\n## Tài liệu dự án (ngữ cảnh)\n' + docContext
        : brain

      const fd = new FormData()
      fd.append('tasks',       JSON.stringify(tasks))
      fd.append('brain',       brainWithDocs)
      fd.append('decisions',   JSON.stringify(decisions))
      fd.append('sprints',     JSON.stringify(sprints))
      fd.append('currentDate', new Date().toISOString().slice(0, 10))

      if (tab === 'doc') {
        if (docInput === 'url') {
          if (!url.trim()) { setAnalyzeError('Nhập URL Google Docs'); return }
          fd.append('type', 'doc-url')
          fd.append('url', url.trim())
        } else if (docInput === 'file') {
          if (!file) { setAnalyzeError('Chọn file .docx'); return }
          fd.append('type', 'doc-file')
          fd.append('file', file)
        } else {
          // project-doc: use selected doc content directly
          const doc = projectDocs.find(d => d.id === primaryDocId)
          if (!doc) { setAnalyzeError('Chọn tài liệu để phân tích'); return }
          fd.append('type', 'project-doc')
          fd.append('doc_text', doc.content)
          fd.append('doc_name', doc.name)
        }
      } else {
        if (!file) { setAnalyzeError('Chọn file Excel'); return }
        fd.append('type', 'report')
        fd.append('file', file)
      }

      const res  = await fetch('/api/bot/analyze', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) { setAnalyzeError(json.error ?? 'Lỗi không xác định'); return }
      if (!json.proposals?.length && !json.suggestions?.length && !json.timeline_risks?.length) {
        setAnalyzeError('Bot không tìm thấy thay đổi hay gợi ý nào.'); return
      }

      setProposals((json.proposals ?? []).map((p: Proposal) => ({ ...p, selected: p.confidence >= 0.75 })))
      setSuggestions(json.suggestions ?? [])
      setTimelineRisks(json.timeline_risks ?? [])
    } catch (e: any) {
      setAnalyzeError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleApply() {
    const toApply = proposals.filter(p => p.selected)
    if (!toApply.length) return
    setApplying(true)
    for (const p of toApply) {
      const patch: Partial<Task> = { status: p.new_status as Task['status'] }
      if (p.description) patch.description = p.description
      await updateTask(p.task_id, patch)
    }
    setApplying(false)
    setApplied(true)
  }

  function resetFile() { setFile(null); if (fileRef.current) fileRef.current.value = '' }
  function resetAnalyze() {
    setApplied(false); setProposals([]); setSuggestions([]); setTimelineRisks([])
    setUrl(''); resetFile(); setPrimaryDocId(null)
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────
  async function handleChat() {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    setChatError(null)

    const userMsg: ChatMessage & { ts: number } = { role: 'user', content: text, ts: Date.now() }
    const updated = [...chatMessages, userMsg]
    setChatMessages(updated)
    saveChatHistory(updated)
    setChatLoading(true)

    try {
      const taskKeywords = tasks.flatMap(t => t.title.split(/\s+/).filter(w => w.length > 3))
      const docContext   = buildDocContext(projectDocs, taskKeywords, 30000)
      const brainWithDocs = docContext
        ? brain + '\n\n## Tài liệu dự án\n' + docContext
        : brain

      const res  = await fetch('/api/bot/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:    updated.map(m => ({ role: m.role, content: m.content })),
          tasks,
          sprints,
          brain:       brainWithDocs,
          decisions,
          currentDate: new Date().toISOString().slice(0, 10),
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setChatError(json.error ?? 'Lỗi không xác định'); return }

      const botMsg: ChatMessage & { ts: number } = { role: 'assistant', content: json.message, ts: Date.now() }
      const final = [...updated, botMsg]
      setChatMessages(final)
      saveChatHistory(final)
    } catch (e: any) {
      setChatError(e.message)
    } finally {
      setChatLoading(false)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedCount = proposals.filter(p => p.selected).length
  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">PM Bot</h1>
          <p className="text-xs text-gray-400">Phân tích tài liệu · Cập nhật tiến độ · Hỏi về dự án</p>
        </div>
      </div>

      {/* Project Brain */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button onClick={() => setShowBrain(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
          <Brain size={15} className="text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">Project Brain</span>
          <span className="text-xs text-gray-400 ml-1">— ngữ cảnh dự án cho bot</span>
          <div className="flex-1" />
          {showBrain ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </button>
        {showBrain && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mt-3 mb-2">Bot dùng nội dung này làm ngữ cảnh cho mọi lần phân tích và hội thoại.</p>
            <textarea value={brain} onChange={e => handleBrainChange(e.target.value)} rows={12}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          </div>
        )}
      </div>

      {/* Tab selector */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: 'doc',    label: 'BA Docs',      icon: FileText },
          { key: 'report', label: 'Daily Report', icon: Table2 },
          { key: 'chat',   label: 'Chat',         icon: MessageSquare },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key}
            onClick={() => { setTab(key); resetFile(); setProposals([]); setAnalyzeError(null); setApplied(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ANALYZE TABS ─────────────────────────────────────────────────────── */}
      {tab !== 'chat' && (
        <>
          {/* Project Docs — context checkboxes */}
          {projectDocs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <BookOpen size={14} className="text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">Tài liệu dự án</span>
                <span className="text-xs text-gray-400">— tick = đưa vào ngữ cảnh bot</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {projectDocs.map(doc => {
                  const on = includedDocIds.has(doc.id)
                  return (
                    <li key={doc.id}
                      onClick={() => setIncludedDocIds(prev => {
                        const n = new Set(prev); on ? n.delete(doc.id) : n.add(doc.id); return n
                      })}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${on ? 'bg-indigo-50/40 hover:bg-indigo-50' : 'opacity-50 hover:bg-gray-50'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${on ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
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

          {/* Input panel */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">

            {tab === 'doc' && (
              <>
                {/* Source toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                  {([
                    { key: 'url',         label: 'Google Docs URL',         icon: Link2 },
                    { key: 'file',        label: 'Upload .docx',            icon: Upload },
                    { key: 'project-doc', label: 'Từ tài liệu đã upload',   icon: BookOpen },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button key={key}
                      onClick={() => { setDocInput(key); resetFile(); setPrimaryDocId(null); setAnalyzeError(null) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        docInput === key
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      <Icon size={12} />{label}
                    </button>
                  ))}
                </div>

                {docInput === 'url' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Google Docs URL <span className="text-gray-400 font-normal">(share "Anyone with link can view")</span>
                    </label>
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/document/d/..." className={inputCls} />
                  </div>
                )}

                {docInput === 'file' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">File .docx</label>
                    <FileDropZone accept=".docx" file={file} onFile={setFile} onClear={resetFile} ref={fileRef} />
                  </div>
                )}

                {docInput === 'project-doc' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Chọn tài liệu để phân tích
                      <span className="text-gray-400 font-normal ml-1">— các tài liệu còn lại vẫn là ngữ cảnh</span>
                    </label>
                    {projectDocs.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Chưa có tài liệu nào. Upload tài liệu ở trang Tổng quan trước.</p>
                    ) : (
                      <ul className="space-y-2">
                        {projectDocs.map(doc => {
                          const selected = primaryDocId === doc.id
                          return (
                            <li key={doc.id}
                              onClick={() => setPrimaryDocId(doc.id)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selected
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                              }`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-indigo-600' : 'border-gray-300'}`}>
                                {selected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                              </div>
                              <span className="text-base shrink-0">
                                {doc.name.endsWith('.pdf') ? '📕' : doc.name.endsWith('.docx') ? '📘' : '📝'}
                              </span>
                              <span className="flex-1 text-sm text-gray-700 truncate font-medium">{doc.name}</span>
                              <span className="text-xs text-gray-400 shrink-0">{formatBytes(doc.size)}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
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

            {analyzeError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{analyzeError}</p>
              </div>
            )}

            <button onClick={handleAnalyze} disabled={analyzing}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {analyzing
                ? <><Loader2 size={15} className="animate-spin" /> Đang phân tích...</>
                : <><Bot size={15} /> Phân tích</>
              }
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
                  <li key={i}
                    onClick={() => setProposals(prev => prev.map((x, j) => j === i ? { ...x, selected: !x.selected } : x))}
                    className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${p.selected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50 opacity-60'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${p.selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                      {p.selected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 text-sm font-medium text-gray-900 truncate">{p.task_title}</p>
                        {p.description && (
                          <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600 border border-indigo-200">
                            📝 +mô tả
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {p.new_status !== p.current_status ? (
                          <>
                            <StatusBadge status={p.current_status} />
                            <span className="text-gray-400 text-xs">→</span>
                            <StatusBadge status={p.new_status} highlight />
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">status không đổi</span>
                        )}
                        <span className="ml-auto text-xs text-gray-400">{Math.round(p.confidence * 100)}% chắc</span>
                      </div>
                      {p.note && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.note}</p>}
                      {p.description && (
                        <p className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1 mt-1.5 line-clamp-2 leading-relaxed">{p.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
                <button onClick={() => { setProposals([]); setAnalyzeError(null) }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
                  <RotateCcw size={12} /> Hủy
                </button>
                <div className="flex-1" />
                <span className="text-xs text-gray-400">{selectedCount} / {proposals.length} được chọn</span>
                <button onClick={handleApply} disabled={applying || selectedCount === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  {applying ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  Áp dụng {selectedCount} thay đổi
                </button>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-100 bg-amber-50/60">
                <Lightbulb size={14} className="text-amber-500" />
                <span className="text-sm font-semibold text-gray-900">Gợi ý hành động</span>
                <span className="text-xs text-gray-400">({suggestions.length})</span>
              </div>
              <ul className="divide-y divide-amber-50">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-700">{s}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline Risks */}
          {timelineRisks.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-red-100 bg-red-50/60">
                <Clock size={14} className="text-red-500" />
                <span className="text-sm font-semibold text-gray-900">Cảnh báo Timeline</span>
                <span className="text-xs text-gray-400">({timelineRisks.length})</span>
              </div>
              <ul className="divide-y divide-red-50">
                {timelineRisks.map((r, i) => {
                  const sev = r.severity === 'high'
                    ? { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Cao' }
                    : r.severity === 'medium'
                    ? { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Vừa' }
                    : { bg: 'bg-gray-100',  text: 'text-gray-600',  label: 'Thấp' }
                  return (
                    <li key={i} className="flex items-start gap-3 px-5 py-3">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold mt-0.5 ${sev.bg} ${sev.text}`}>{sev.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">{r.sprint}</p>
                        <p className="text-sm text-gray-800">{r.risk}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Applied confirmation */}
          {applied && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Đã cập nhật thành công!</p>
                <p className="text-xs text-green-600 mt-0.5">
                  {selectedCount} task đã được cập nhật
                  {proposals.filter(p => p.selected && p.description).length > 0 &&
                    ` (${proposals.filter(p => p.selected && p.description).length} có mô tả mới)`
                  }. Vào Sprint Board để kiểm tra.
                </p>
              </div>
              <button onClick={resetAnalyze} className="text-xs text-green-700 underline hover:no-underline">
                Phân tích tiếp
              </button>
            </div>
          )}
        </>
      )}

      {/* ── CHAT TAB ─────────────────────────────────────────────────────────── */}
      {tab === 'chat' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: '560px' }}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <MessageSquare size={18} className="text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Hỏi PM Bot về dự án</p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                  {[
                    'Sprint 1 tiến độ thế nào?',
                    'Task nào đang bị blocked?',
                    'Tiến còn bao nhiêu task chưa làm?',
                    'Khả năng kịp deadline sprint không?',
                  ].map(q => (
                    <button key={q} onClick={() => { setChatInput(q) }}
                      className="text-xs text-left px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-100'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-gray-600" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot size={14} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Error */}
          {chatError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-700 flex-1">{chatError}</p>
              <button onClick={() => setChatError(null)} className="text-red-400 hover:text-red-600"><X size={13} /></button>
            </div>
          )}

          {/* Clear history */}
          {chatMessages.length > 0 && (
            <div className="px-4 py-1.5 border-t border-gray-50 flex justify-end">
              <button onClick={() => { setChatMessages([]); saveChatHistory([]) }}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
                Xóa lịch sử
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat() } }}
                placeholder="Hỏi về tiến độ, task, sprint..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={chatLoading}
              />
              <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()}
                className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
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
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${highlight ? 'ring-1 ring-offset-1' : ''}`}
      style={{ backgroundColor: s.bg, color: s.text, ...(highlight ? { ringColor: s.text } : {}) }}>
      {s.label}
    </span>
  )
}

// ─── File Drop Zone ───────────────────────────────────────────────────────────

const FileDropZone = forwardRef<HTMLInputElement, {
  accept: string; file: File | null; onFile: (f: File) => void; onClear: () => void
}>(({ accept, file, onFile, onClear }, ref) => {
  const [dragging, setDragging] = useState(false)

  if (file) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 border border-indigo-200 bg-indigo-50 rounded-lg">
        <FileText size={16} className="text-indigo-500 shrink-0" />
        <span className="flex-1 text-sm text-indigo-700 truncate font-medium">{file.name}</span>
        <button onClick={onClear} className="w-5 h-5 rounded flex items-center justify-center text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100">
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <div onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
      onClick={() => (ref as any)?.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
      }`}>
      <Upload size={18} className="text-gray-400" />
      <p className="text-xs text-gray-400">Kéo thả hoặc <span className="text-indigo-500 font-medium">chọn file</span></p>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
    </div>
  )
})
FileDropZone.displayName = 'FileDropZone'
