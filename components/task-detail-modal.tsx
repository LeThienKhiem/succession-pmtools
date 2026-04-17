'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Clock, User, Tag, Calendar, Plus, Trash2, Link as LinkIcon, Pencil, Check, Bot, Upload, Link2, Loader2, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { TASK_TYPE_STYLES, STATUS_STYLES, PRIORITY_STYLES, type Task, type TaskPriority, type TaskType } from '@/lib/mock-data'
import { DEFAULT_BRAIN } from '@/lib/default-brain'

const LS_BRAIN_KEY = 'pm-project-brain'
function loadBrain() {
  try { return localStorage.getItem(LS_BRAIN_KEY) ?? DEFAULT_BRAIN } catch { return DEFAULT_BRAIN }
}

interface Member { id: string; code: string; name: string; color: string; role: string }
interface Epic   { id: string; code: string; name: string; color: string }

interface Props {
  task: Task
  members: Member[]
  epics: Epic[]
  onClose: () => void
  onUpdate: (taskId: string, patch: Partial<Task>) => void
}

const STATUSES: Task['status'][] = ['todo', 'in-progress', 'done', 'blocked']
const STATUS_LABELS: Record<Task['status'], string> = {
  'todo': 'Todo', 'in-progress': 'Đang làm', 'done': 'Hoàn thành', 'blocked': 'Blocked', 'outline': 'Outline',
}
const PRIORITIES: TaskPriority[] = ['critical', 'priority', 'normal']
const PRIORITY_UI: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  critical: { label: 'Critical', dot: '#E24B4A', text: '#C0392B', bg: '#FEF2F2' },
  priority: { label: 'Priority', dot: '#EF9F27', text: '#B7760D', bg: '#FFF7ED' },
  normal:   { label: 'Normal',   dot: '#D1D5DB', text: '#6B7280', bg: '#F9FAFB' },
}
const TYPES: TaskType[] = ['spec', 'story', 'design', 'dev', 'test', 'review', 'doc']

function isValidUrl(s: string) {
  try { new URL(s); return true } catch { return false }
}

export function TaskDetailModal({ task, members, epics, onClose, onUpdate }: Props) {
  const [title,        setTitle]        = useState(task.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [description,  setDescription]  = useState(task.description ?? '')
  const [status,       setStatus]       = useState<Task['status']>(task.status)
  const [priority,     setPriority]     = useState<TaskPriority>(task.priority as TaskPriority)
  const [type,         setType]         = useState<TaskType>(task.type)
  const [assigneeCode, setAssigneeCode] = useState(task.assignee_code)
  const [epicCode,     setEpicCode]     = useState(task.epic_code)
  const [dayLabel,     setDayLabel]     = useState(task.day_label)
  const [editingDay,   setEditingDay]   = useState(false)
  const [hours,        setHours]        = useState(task.estimated_hours ?? 0)
  const [editingHours, setEditingHours] = useState(false)
  const [documents,    setDocuments]    = useState<string[]>(task.documents ?? [])
  const [newUrl,       setNewUrl]       = useState('')
  const [urlError,     setUrlError]     = useState('')

  // ── Spec analysis ──────────────────────────────────────────────────────────
  const [showSpec,      setShowSpec]      = useState(false)
  const [specInput,     setSpecInput]     = useState<'url' | 'file'>('url')
  const [specUrl,       setSpecUrl]       = useState('')
  const [specFile,      setSpecFile]      = useState<File | null>(null)
  const [specAnalyzing, setSpecAnalyzing] = useState(false)
  const [specError,     setSpecError]     = useState<string | null>(null)
  const [specPoints,    setSpecPoints]    = useState<string[]>([])
  const specFileRef = useRef<HTMLInputElement>(null)

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const dayRef   = useRef<HTMLInputElement>(null)
  const hoursRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])
  useEffect(() => { if (editingDay)   dayRef.current?.focus()   }, [editingDay])
  useEffect(() => { if (editingHours) hoursRef.current?.focus() }, [editingHours])

  function commitTitle() {
    const t = title.trim()
    if (!t) { setTitle(task.title); setEditingTitle(false); return }
    setEditingTitle(false)
    onUpdate(task.id, { title: t })
  }

  function handleStatusChange(s: Task['status']) {
    setStatus(s)
    onUpdate(task.id, { status: s })
  }

  function handlePriorityChange(p: TaskPriority) {
    setPriority(p)
    onUpdate(task.id, { priority: p })
  }

  function handleTypeChange(t: TaskType) {
    setType(t)
    onUpdate(task.id, { type: t })
  }

  function handleAssigneeChange(code: string) {
    setAssigneeCode(code)
    onUpdate(task.id, { assignee_code: code })
  }

  function handleEpicChange(code: string) {
    setEpicCode(code)
    onUpdate(task.id, { epic_code: code })
  }

  function commitDay() {
    setEditingDay(false)
    const d = dayLabel.trim()
    if (d) onUpdate(task.id, { day_label: d })
  }

  function commitHours() {
    setEditingHours(false)
    onUpdate(task.id, { estimated_hours: hours || undefined })
  }

  function handleDescriptionBlur() {
    onUpdate(task.id, { description: description.trim() || undefined })
  }

  async function handleSpecAnalyze() {
    setSpecError(null)
    setSpecPoints([])
    setSpecAnalyzing(true)
    try {
      const brain = loadBrain()
      const fd = new FormData()
      fd.append('brain', brain)
      fd.append('task', JSON.stringify({
        id: task.id, title: task.title,
        epic_code: task.epic_code, type: task.type,
      }))
      if (specInput === 'url') {
        if (!specUrl.trim()) { setSpecError('Nhập URL Google Docs'); setSpecAnalyzing(false); return }
        fd.append('type', 'doc-url')
        fd.append('url', specUrl.trim())
      } else {
        if (!specFile) { setSpecError('Chọn file'); setSpecAnalyzing(false); return }
        fd.append('type', 'doc-file')
        fd.append('file', specFile)
      }
      const res  = await fetch('/api/bot/analyze-spec', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) { setSpecError(json.error ?? 'Lỗi không xác định'); return }
      // Fill description + save
      setDescription(json.description)
      setSpecPoints(json.key_points ?? [])
      onUpdate(task.id, { description: json.description })
    } catch (e: any) {
      setSpecError(e.message)
    } finally {
      setSpecAnalyzing(false)
    }
  }

  function addDocument() {
    const url = newUrl.trim()
    if (!url) return
    if (!isValidUrl(url)) { setUrlError('URL không hợp lệ (cần có http:// hoặc https://)'); return }
    if (documents.includes(url)) { setUrlError('URL đã tồn tại'); return }
    const next = [...documents, url]
    setDocuments(next)
    onUpdate(task.id, { documents: next })
    setNewUrl('')
    setUrlError('')
  }

  function removeDocument(url: string) {
    const next = documents.filter(d => d !== url)
    setDocuments(next)
    onUpdate(task.id, { documents: next.length ? next : undefined })
  }

  function hostname(url: string) {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  }

  const member    = members.find(m => m.code === assigneeCode)
  const epic      = epics.find(e => e.code === epicCode)
  const typeStyle = TASK_TYPE_STYLES[type] ?? TASK_TYPE_STYLES['spec']
  const prioUi    = PRIORITY_UI[priority] ?? PRIORITY_UI['normal']

  const selectCls = 'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            {/* Epic code + Type selector + Priority badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400">{epicCode}</span>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as TaskType)}
                className="text-xs font-medium rounded px-1.5 py-0.5 border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{TASK_TYPE_STYLES[t]?.label ?? t}</option>
                ))}
              </select>
              {priority !== 'normal' && (
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: prioUi.text }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: prioUi.dot }} />
                  {prioUi.label}
                </span>
              )}
            </div>

            {/* Editable title */}
            {editingTitle ? (
              <div className="flex items-start gap-2">
                <textarea
                  ref={titleRef}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitTitle() }
                    if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false) }
                  }}
                  rows={2}
                  className="flex-1 text-base font-semibold text-gray-900 resize-none border border-indigo-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-snug"
                />
                <button onClick={commitTitle} className="mt-1 w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2 group/title">
                <h2 className="flex-1 text-base font-semibold text-gray-900 leading-snug">{title}</h2>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="mt-0.5 w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover/title:opacity-100 transition-all shrink-0"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>

          <button onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Trạng thái</p>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => {
                const st = STATUS_STYLES[s]
                const isActive = status === s
                return (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      isActive ? 'shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                    }`}
                    style={isActive ? { backgroundColor: st.bg, color: st.text, borderColor: st.dot } : {}}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? st.dot : '#D1D5DB' }} />
                    {STATUS_LABELS[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">

            {/* Assignee */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <User size={12} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Người thực hiện</p>
              </div>
              <select value={assigneeCode} onChange={e => handleAssigneeChange(e.target.value)} className={selectCls}>
                {members.map(m => (
                  <option key={m.code} value={m.code}>{m.name}</option>
                ))}
              </select>
              {member && (
                <p className="text-xs text-gray-400 mt-1 truncate">{member.role}</p>
              )}
            </div>

            {/* Epic */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag size={12} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Epic</p>
              </div>
              <select value={epicCode} onChange={e => handleEpicChange(e.target.value)} className={selectCls}>
                {epics.map(e => (
                  <option key={e.code} value={e.code}>{e.code} — {e.name}</option>
                ))}
              </select>
              {epic && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: epic.color }} />
                  <p className="text-xs text-gray-400 truncate">{epic.name}</p>
                </div>
              )}
            </div>

            {/* Day label */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={12} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày</p>
              </div>
              {editingDay ? (
                <div className="flex gap-1">
                  <input
                    ref={dayRef}
                    value={dayLabel}
                    onChange={e => setDayLabel(e.target.value)}
                    onBlur={commitDay}
                    onKeyDown={e => { if (e.key === 'Enter') commitDay(); if (e.key === 'Escape') { setDayLabel(task.day_label); setEditingDay(false) } }}
                    className="flex-1 text-sm border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={commitDay} className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between group/day cursor-pointer"
                  onClick={() => setEditingDay(true)}
                >
                  <p className="text-sm font-medium text-gray-800">{dayLabel}</p>
                  <Pencil size={11} className="text-gray-300 group-hover/day:text-indigo-400 transition-colors" />
                </div>
              )}
            </div>

            {/* Estimated hours */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={12} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ước tính</p>
              </div>
              {editingHours ? (
                <div className="flex gap-1 items-center">
                  <input
                    ref={hoursRef}
                    type="number"
                    min={0}
                    max={99}
                    step={0.5}
                    value={hours}
                    onChange={e => setHours(parseFloat(e.target.value) || 0)}
                    onBlur={commitHours}
                    onKeyDown={e => { if (e.key === 'Enter') commitHours(); if (e.key === 'Escape') { setHours(task.estimated_hours ?? 0); setEditingHours(false) } }}
                    className="w-16 text-sm border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-sm text-gray-500">h</span>
                  <button onClick={commitHours} className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 ml-auto">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between group/hours cursor-pointer"
                  onClick={() => setEditingHours(true)}
                >
                  <p className="text-sm font-medium text-gray-800">{hours ? `${hours}h` : '—'}</p>
                  <Pencil size={11} className="text-gray-300 group-hover/hours:text-indigo-400 transition-colors" />
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Priority</p>
            <div className="flex gap-2">
              {PRIORITIES.map(p => {
                const ui = PRIORITY_UI[p]
                const isActive = priority === p
                return (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      isActive ? 'shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                    }`}
                    style={isActive ? { backgroundColor: ui.bg, color: ui.text, borderColor: ui.dot } : {}}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isActive ? ui.dot : '#D1D5DB' }} />
                    {ui.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mô tả</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Thêm mô tả chi tiết cho task này..."
              rows={3}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-300 bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Spec Analysis */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowSpec(v => !v)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <Bot size={13} className="text-indigo-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phân tích Spec bằng AI</span>
              <span className="text-xs text-gray-400 font-normal ml-1">— tự điền mô tả từ tài liệu</span>
              <div className="flex-1" />
              {showSpec ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </button>

            {showSpec && (
              <div className="px-4 py-3 space-y-3 bg-white">
                {/* Sub-toggle */}
                <div className="flex items-center gap-2">
                  {([
                    { key: 'url',  label: 'Google Docs URL', icon: Link2 },
                    { key: 'file', label: 'Upload .docx',    icon: Upload },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => { setSpecInput(key); setSpecFile(null); setSpecError(null) }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        specInput === key
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>

                {specInput === 'url' ? (
                  <input
                    value={specUrl}
                    onChange={e => { setSpecUrl(e.target.value); setSpecError(null) }}
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                ) : (
                  <div>
                    {specFile ? (
                      <div className="flex items-center gap-2 px-3 py-2 border border-indigo-200 bg-indigo-50 rounded-lg">
                        <span className="flex-1 text-xs text-indigo-700 truncate font-medium">{specFile.name}</span>
                        <button onClick={() => { setSpecFile(null); if (specFileRef.current) specFileRef.current.value = '' }}
                          className="text-indigo-400 hover:text-indigo-700 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => specFileRef.current?.click()}
                        className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-gray-50 transition-colors"
                      >
                        <Upload size={14} className="text-gray-400" />
                        <p className="text-xs text-gray-400">Chọn <span className="text-indigo-500 font-medium">.docx</span> hoặc .txt</p>
                      </div>
                    )}
                    <input ref={specFileRef} type="file" accept=".docx,.txt,.md" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) { setSpecFile(f); setSpecError(null) } }} />
                  </div>
                )}

                {specError && (
                  <div className="flex items-start gap-1.5 text-xs text-red-600">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {specError}
                  </div>
                )}

                <button
                  onClick={handleSpecAnalyze}
                  disabled={specAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {specAnalyzing
                    ? <><Loader2 size={11} className="animate-spin" /> Đang phân tích...</>
                    : <><Sparkles size={11} /> Phân tích & điền mô tả</>
                  }
                </button>

                {specPoints.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-indigo-700 mb-1.5">Điểm chính từ spec:</p>
                    {specPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 text-xs shrink-0 mt-0.5">•</span>
                        <p className="text-xs text-indigo-800">{pt}</p>
                      </div>
                    ))}
                    <p className="text-xs text-indigo-500 mt-2">✓ Mô tả đã được cập nhật tự động</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Documents ({documents.length})
            </p>
            {documents.length > 0 && (
              <ul className="space-y-1.5 mb-2.5">
                {documents.map(url => (
                  <li key={url} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 group/doc">
                    <LinkIcon size={13} className="text-indigo-400 shrink-0" />
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate min-w-0"
                      title={url}
                      onClick={e => e.stopPropagation()}>
                      {hostname(url)}
                    </a>
                    <button
                      onClick={() => removeDocument(url)}
                      className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover/doc:opacity-100 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => { setNewUrl(e.target.value); setUrlError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDocument() } }}
                  placeholder="https://docs.google.com/..."
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-300 ${
                    urlError
                      ? 'border-red-300 focus:ring-red-400 bg-red-50'
                      : 'border-gray-200 focus:ring-indigo-400 bg-gray-50'
                  }`}
                />
                {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
              </div>
              <button
                onClick={addDocument}
                className="shrink-0 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 text-sm font-medium">
                <Plus size={14} />
                Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
