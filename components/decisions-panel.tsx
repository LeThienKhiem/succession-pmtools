'use client'

import { useState } from 'react'
import { Lightbulb, Compass, Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { addDecision, updateDecision, deleteDecision, type Decision } from '@/lib/queries'
import { TEAM_MEMBERS } from '@/lib/mock-data'

interface Props {
  projectId:        string
  initialDecisions: Decision[]
}

const CATEGORIES = [
  { key: 'decision',  label: 'Quyết định', icon: Lightbulb, color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { key: 'direction', label: 'Định hướng', icon: Compass,   color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
] as const

const PM = TEAM_MEMBERS.find(m => m.code === 'lk')!

export function DecisionsPanel({ projectId, initialDecisions }: Props) {
  const [items,    setItems]    = useState<Decision[]>(initialDecisions)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editId,   setEditId]   = useState<string | null>(null)

  // ── Add form state ──────────────────────────────────────────────────────────
  const [newCat,     setNewCat]     = useState<'decision' | 'direction'>('decision')
  const [newTitle,   setNewTitle]   = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState<string | null>(null)

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editTitle,   setEditTitle]   = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCat,     setEditCat]     = useState<'decision' | 'direction'>('decision')

  async function handleAdd() {
    if (!newTitle.trim()) return
    setSaving(true); setSaveError(null)
    try {
      const saved = await addDecision({
        project_id:  projectId,
        category:    newCat,
        title:       newTitle.trim(),
        content:     newContent.trim(),
        author_name: PM.name,
      })
      setItems(prev => [saved, ...prev])
      setNewTitle(''); setNewContent(''); setShowForm(false)
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setItems(prev => prev.filter(d => d.id !== id))
    await deleteDecision(id)
  }

  function startEdit(d: Decision) {
    setEditId(d.id)
    setEditTitle(d.title)
    setEditContent(d.content)
    setEditCat(d.category)
  }

  async function commitEdit(id: string) {
    setItems(prev => prev.map(d => d.id === id
      ? { ...d, title: editTitle, content: editContent, category: editCat }
      : d
    ))
    setEditId(null)
    await updateDecision(id, { title: editTitle, content: editContent, category: editCat })
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className="text-amber-500" />
          <span className="text-sm font-semibold text-gray-900">Quyết định & Định hướng</span>
          {items.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-600 font-semibold px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-1">· lưu Supabase, cả team xem được</span>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setSaveError(null) }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus size={12} /> Thêm
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/50 space-y-3">
          {/* Category toggle */}
          <div className="flex items-center gap-2">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setNewCat(c.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  newCat === c.key
                    ? `${c.bg} ${c.border} ${c.color}`
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                <c.icon size={12} /> {c.label}
              </button>
            ))}
          </div>

          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleAdd() }}
            placeholder="Tiêu đề *"
            className={inputCls}
          />
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Chi tiết, lý do, tác động... (không bắt buộc)"
            rows={3}
            className={`${inputCls} resize-none`}
          />

          {saveError && (
            <p className="text-xs text-red-600">{saveError}</p>
          )}

          <div className="flex items-center gap-2">
            <button onClick={() => { setShowForm(false); setNewTitle(''); setNewContent('') }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleAdd} disabled={saving || !newTitle.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-40 transition-colors">
              {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 && !showForm ? (
        <div className="flex items-center justify-center h-16 text-xs text-gray-400">
          Chưa có quyết định nào · Nhấn Thêm để ghi lại
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {items.map(d => {
            const cat     = CATEGORIES.find(c => c.key === d.category)!
            const isOpen  = expanded.has(d.id)
            const isEdit  = editId === d.id
            const hasBody = d.content.trim().length > 0

            return (
              <li key={d.id} className="group">
                {isEdit ? (
                  /* ── Edit mode ── */
                  <div className="px-5 py-3.5 space-y-2.5 bg-gray-50">
                    <div className="flex items-center gap-2">
                      {CATEGORIES.map(c => (
                        <button key={c.key} onClick={() => setEditCat(c.key)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors ${
                            editCat === c.key ? `${c.bg} ${c.border} ${c.color}` : 'bg-white border-gray-200 text-gray-400'
                          }`}>
                          <c.icon size={11} /> {c.label}
                        </button>
                      ))}
                    </div>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      className={inputCls} />
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                      rows={3} className={`${inputCls} resize-none`} />
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-500 hover:bg-white transition-colors">
                        Hủy
                      </button>
                      <button onClick={() => commitEdit(d.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">
                        <Check size={11} /> Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      {/* Category pill */}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 mt-0.5 ${cat.bg} ${cat.border} ${cat.color}`}>
                        <cat.icon size={10} /> {cat.label}
                      </span>

                      {/* Title + content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">{d.title}</p>
                          {hasBody && (
                            <button onClick={() => toggleExpand(d.id)}
                              className="text-gray-300 hover:text-gray-500 transition-colors">
                              {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>
                        {isOpen && hasBody && (
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed whitespace-pre-wrap">{d.content}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {d.author_name} · {new Date(d.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Actions (visible on hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => startEdit(d)}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDelete(d.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
