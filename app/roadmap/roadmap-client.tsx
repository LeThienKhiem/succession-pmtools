'use client'

import { useState, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { updateTeamMember } from '@/lib/queries'
import { TASK_TYPE_STYLES, type Task, type TeamMember, type SprintStatus } from '@/lib/mock-data'
import { X, GitBranch, Map, Check } from 'lucide-react'
import Link from 'next/link'

// ─── Sprint type ───────────────────────────────────────────────────────────────
interface Sprint {
  id: string
  name: string
  theme: string | null
  start_date: string
  end_date: string
  status: SprintStatus
  epics?: string[]
}

// ─── Assignee chip styling (colors only — labels come from members state) ──────
const CHIP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ba1:      { bg: '#E6F1FB', text: '#0C447C', border: '#B5D4F4', dot: '#378ADD' },
  ba2:      { bg: '#EAF3DE', text: '#27500A', border: '#C0DD97', dot: '#639922' },
  ds:       { bg: '#EEEDFE', text: '#3C3489', border: '#CECBF6', dot: '#7F77DD' },
  dj:       { bg: '#F5EEF8', text: '#6B2FA0', border: '#DDB6E8', dot: '#9B59B6' },
  tl:       { bg: '#FAEEDA', text: '#633806', border: '#FAC775', dot: '#BA7517' },
  lead_dev: { bg: '#FAECE7', text: '#712B13', border: '#F5C4B3', dot: '#D85A30' },
  lk:       { bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', dot: '#1D9E75' },
}
const CHIP_DEFAULT = { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', dot: '#9CA3AF' }

// Day order per sprint
const DAY_ORDER: Record<string, string[]> = {
  'sp-1': ['T2 20/4', 'T3 21/4', 'T4 22/4', 'T4-T5', 'T5 23/4', 'T6 24/4'],
  'sp-2': ['T2 05/5', 'T3 06/5', 'T4 07/5', 'T4-T5', 'T5 08/5', 'T6 09/5'],
  'sp-5': ['T2 26/5', 'T3 27/5', 'T4 28/5', 'T5 29/5', 'T6 30/5'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
function priorityOutline(p: string): React.CSSProperties {
  if (p === 'critical') return { outline: '1.5px solid #E24B4A', outlineOffset: '1px' }
  if (p === 'priority') return { outline: '1.5px solid #EF9F27', outlineOffset: '1px' }
  return {}
}
function priorityDot(p: string) {
  if (p === 'critical') return '#E24B4A'
  if (p === 'priority') return '#EF9F27'
  return '#D1D5DB'
}
function memberLabel(code: string, members: TeamMember[]) {
  return members.find(m => m.code === code)?.name ?? code.toUpperCase()
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  sprints: Sprint[]
  tasks: Task[]
  members: TeamMember[]
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function RoadmapClient({ sprints, tasks: initialTasks, members: initialMembers }: Props) {
  const [tasks,   setTasks]   = useState<Task[]>(initialTasks)
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [tab, setTab] = useState<'timeline' | 'sprints'>('sprints')

  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterSprint,   setFilterSprint]   = useState('all')

  const [tooltip, setTooltip] = useState<{ task: Task; x: number; y: number } | null>(null)
  const [drawer,  setDrawer]  = useState<Task | null>(null)
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null)

  // Rename popover state
  const [renaming, setRenaming] = useState<{ code: string; x: number; y: number } | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  function handleAssigneeClick(code: string, x: number, y: number) {
    setTooltip(null)
    const current = members.find(m => m.code === code)
    setRenameVal(current?.name ?? '')
    setRenaming({ code, x, y })
  }

  async function handleRenameSubmit() {
    if (!renaming) return
    const name = renameVal.trim()
    if (!name) { setRenaming(null); return }
    const member = members.find(m => m.code === renaming.code)
    if (!member) { setRenaming(null); return }
    const prevName = member.name
    // Optimistic
    setMembers(ms => ms.map(m => m.code === renaming.code ? { ...m, name } : m))
    setRenaming(null)
    try {
      await updateTeamMember(member.id, { name })
      showToast(`Đã đổi tên thành "${name}"`, true)
    } catch {
      setMembers(ms => ms.map(m => m.code === renaming.code ? { ...m, name: prevName } : m))
      showToast('Lỗi đổi tên — thử lại', false)
    }
  }

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterAssignee !== 'all' && t.assignee_code !== filterAssignee) return false
    if (filterPriority !== 'all' && t.priority      !== filterPriority) return false
    if (filterSprint   !== 'all' && t.sprint_id     !== filterSprint)   return false
    return true
  }), [tasks, filterAssignee, filterPriority, filterSprint])

  async function handleStatusChange(taskId: string, newStatus: Task['status']) {
    const prev = tasks.find(t => t.id === taskId)?.status
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    setDrawer(d => d?.id === taskId ? { ...d, status: newStatus } : d)
    const { error } = await supabase
      .from('pm_tasks')
      .update({ status: newStatus } as Record<string, unknown>)
      .eq('id', taskId)
    if (error) {
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: prev! } : t))
      setDrawer(d => d?.id === taskId ? { ...d, status: prev! } : d)
      showToast('Lỗi cập nhật — thử lại', false)
    } else {
      showToast('Đã cập nhật trạng thái', true)
    }
  }

  const criticalCount = tasks.filter(t => t.priority === 'critical').length
  const priorityCount = tasks.filter(t => t.priority === 'priority').length
  const normalCount   = tasks.filter(t => t.priority === 'normal').length

  const selectCls = 'text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer'
  const filtersActive = filterAssignee !== 'all' || filterPriority !== 'all' || filterSprint !== 'all'

  const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    active:    { bg: '#E1F5EE', text: '#085041', label: 'Active' },
    upcoming:  { bg: '#E6F1FB', text: '#0C447C', label: 'Upcoming' },
    completed: { bg: '#F0FDF4', text: '#15803D', label: 'Completed' },
    outline:   { bg: '#F1EFE8', text: '#444441', label: 'Outline' },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Sprint Timeline</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          {' · '}{tasks.length} tasks
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tổng tasks</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-red-400 mt-0.5">Critical</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{priorityCount}</p>
          <p className="text-xs text-amber-400 mt-0.5">Priority</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-500">{normalCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Normal</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setTab('timeline')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'timeline' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Map size={13} />
          Lộ trình
        </button>
        <button
          onClick={() => setTab('sprints')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'sprints' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <GitBranch size={13} />
          Sprint Boards
        </button>
      </div>

      {/* ── Sprint Boards tab ───────────────────────────────────────────────────── */}
      {tab === 'sprints' && (
        <div className="space-y-3">
          {sprints.map(sprint => {
            const badge = STATUS_BADGE[sprint.status] ?? STATUS_BADGE.outline
            const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id)
            const done = sprintTasks.filter(t => t.status === 'done').length
            const pct  = sprintTasks.length ? Math.round(done * 100 / sprintTasks.length) : 0
            const canOpen = sprint.status !== 'outline'
            return (
              <div
                key={sprint.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${
                  sprint.status === 'active' ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{sprint.name}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {sprint.theme} · {fmt(sprint.start_date)} → {fmt(sprint.end_date)} · {sprintTasks.length} tasks
                    </p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{done}/{sprintTasks.length} xong · {pct}%</p>
                  </div>
                  {canOpen ? (
                    <Link
                      href={`/sprint/${sprint.id}`}
                      className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Mở board →
                    </Link>
                  ) : (
                    <span className="shrink-0 px-4 py-2 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed">
                      Chưa bắt đầu
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Timeline tab ────────────────────────────────────────────────────────── */}
      {tab === 'timeline' && (
        <>
          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center gap-4 flex-wrap">
              {members.map(m => {
                const cs = CHIP[m.code] ?? CHIP_DEFAULT
                return (
                  <div key={m.code} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cs.dot }} />
                    <span className="text-xs text-gray-600">{m.name}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-4 rounded-full bg-gray-100" style={{ outline: '1.5px solid #E24B4A', outlineOffset: '1px' }} />
                <span className="text-xs text-gray-500">Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-4 rounded-full bg-gray-100" style={{ outline: '1.5px solid #EF9F27', outlineOffset: '1px' }} />
                <span className="text-xs text-gray-500">Priority</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-4 rounded-full bg-gray-100 border border-gray-200" />
                <span className="text-xs text-gray-500">Normal</span>
              </div>
              <span className="text-xs text-gray-400 ml-auto">Click tên assignee trên chip để đổi tên</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select className={selectCls} value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
              <option value="all">Tất cả assignees</option>
              {members.map(m => (
                <option key={m.code} value={m.code}>{m.name}</option>
              ))}
            </select>
            <select className={selectCls} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="all">Tất cả priority</option>
              <option value="critical">🔴 Critical</option>
              <option value="priority">🟠 Priority</option>
              <option value="normal">Normal</option>
            </select>
            <select className={selectCls} value={filterSprint} onChange={e => setFilterSprint(e.target.value)}>
              <option value="all">Tất cả sprints</option>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {filtersActive && (
              <button
                onClick={() => { setFilterAssignee('all'); setFilterPriority('all'); setFilterSprint('all') }}
                className="text-xs text-indigo-500 hover:text-indigo-700 underline"
              >
                Reset
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {filtersActive ? `${filtered.length} / ` : ''}{tasks.length} tasks
            </span>
          </div>

          {/* Sprint blocks */}
          {sprints.map(sprint => (
            <SprintBlock
              key={sprint.id}
              sprint={sprint}
              tasks={filtered.filter(t => t.sprint_id === sprint.id)}
              allSprintTasks={tasks.filter(t => t.sprint_id === sprint.id)}
              members={members}
              onChipHover={(task, x, y) => setTooltip({ task, x, y })}
              onChipLeave={() => setTooltip(null)}
              onChipClick={task => { setTooltip(null); setDrawer(task) }}
              onAssigneeClick={handleAssigneeClick}
            />
          ))}

          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: 'fixed',
                left: tooltip.x + 14,
                top: tooltip.y + 14,
                zIndex: 1000,
                pointerEvents: 'none',
                maxWidth: 280,
                background: 'white',
                border: '0.5px solid #E5E7EB',
                borderRadius: 8,
                padding: '10px 12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.4, marginBottom: 4 }}>
                {tooltip.task.title}
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>
                {memberLabel(tooltip.task.assignee_code, members)}
                {' · '}{tooltip.task.type}
                {' · '}{tooltip.task.estimated_hours ?? 0}h
              </p>
              {tooltip.task.priority !== 'normal' && (
                <span style={{
                  display: 'inline-block',
                  fontSize: 11, fontWeight: 500,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: tooltip.task.priority === 'critical' ? '#FEF2F2' : '#FFF7ED',
                  color: tooltip.task.priority === 'critical' ? '#EF4444' : '#F97316',
                  marginBottom: 4,
                }}>
                  {tooltip.task.priority}
                </span>
              )}
              {tooltip.task.pre_holiday && (
                <p style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>Làm trong tuần nghỉ lễ</p>
              )}
              {tooltip.task.description && (
                <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4, lineHeight: 1.4 }}>
                  {truncate(tooltip.task.description, 80)}
                </p>
              )}
            </div>
          )}

          {/* Drawer */}
          {drawer && (
            <TaskDrawer
              task={drawer}
              sprints={sprints}
              members={members}
              onClose={() => setDrawer(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </>
      )}

      {/* Rename popover */}
      {renaming && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setRenaming(null)} />
          <div
            style={{
              position: 'fixed',
              left: Math.min(renaming.x, window.innerWidth - 260),
              top: renaming.y + 8,
              zIndex: 50,
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
              width: 240,
            }}
          >
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Đổi tên — <span className="text-indigo-500">{renaming.code.toUpperCase()}</span>
            </p>
            <div className="flex gap-1.5">
              <input
                autoFocus
                className="flex-1 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameSubmit()
                  if (e.key === 'Escape') setRenaming(null)
                }}
              />
              <button
                onClick={handleRenameSubmit}
                className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
              >
                <Check size={13} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.ok ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── Sprint Block ──────────────────────────────────────────────────────────────
function SprintBlock({
  sprint, tasks, allSprintTasks, members, onChipHover, onChipLeave, onChipClick, onAssigneeClick,
}: {
  sprint: Sprint
  tasks: Task[]
  allSprintTasks: Task[]
  members: TeamMember[]
  onChipHover: (task: Task, x: number, y: number) => void
  onChipLeave: () => void
  onChipClick: (task: Task) => void
  onAssigneeClick: (code: string, x: number, y: number) => void
}) {
  const isOutline = sprint.status === 'outline'
  const isActive  = sprint.status === 'active'

  const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    active:    { bg: '#E1F5EE', text: '#085041', label: 'Active' },
    upcoming:  { bg: '#E6F1FB', text: '#0C447C', label: 'Upcoming' },
    completed: { bg: '#F0FDF4', text: '#15803D', label: 'Completed' },
    outline:   { bg: '#F1EFE8', text: '#444441', label: 'Outline' },
  }
  const badge = STATUS_BADGE[sprint.status] ?? STATUS_BADGE.outline

  const assigneeCounts = allSprintTasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.assignee_code] = (acc[t.assignee_code] ?? 0) + 1
    return acc
  }, {})
  const total = Object.values(assigneeCounts).reduce((a, b) => a + b, 0)

  const preHolidayCount = allSprintTasks.filter(t => t.pre_holiday).length

  const dayOrder = DAY_ORDER[sprint.id] ?? []
  const allDaysInSprint = [...new Set([...dayOrder, ...allSprintTasks.map(t => t.day_label)])]
    .filter(d => d && d !== 'Sprint 3' && d !== 'Sprint 4')
    .sort((a, b) => {
      const ia = dayOrder.indexOf(a), ib = dayOrder.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
      isActive ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-gray-900">{sprint.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {sprint.theme}
              {' · '}{fmt(sprint.start_date)} → {fmt(sprint.end_date)}
              {' · '}{allSprintTasks.length} tasks
              {sprint.epics && sprint.epics.length > 0 && (
                <span className="ml-1 text-indigo-400">
                  {sprint.epics.map(e => e.split(' · ')[0]).join(', ')}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Summary bar */}
        {!isOutline && total > 0 && (
          <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-2">
            {Object.entries(assigneeCounts).map(([code, count]) => (
              <div
                key={code}
                title={`${memberLabel(code, members)}: ${count}`}
                style={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: CHIP[code]?.dot ?? '#9CA3AF',
                  minWidth: 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Pre-holiday note */}
        {preHolidayCount > 0 && (
          <div className="mt-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            {memberLabel('ba1', members)} nên làm {preHolidayCount} spec tasks này trong tuần nghỉ lễ để dev bắt đầu ngay T2 05/5
          </div>
        )}
      </div>

      {/* Body */}
      {isOutline ? (
        <div className="divide-y divide-gray-50">
          {tasks.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-300 italic">Không có tasks</p>
          ) : (
            tasks.map(t => (
              <div
                key={t.id}
                className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 cursor-pointer"
                onClick={() => onChipClick(t)}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: priorityDot(t.priority) }}
                />
                <span className="flex-1 text-xs text-gray-700 leading-snug">{t.title}</span>
                <span className="shrink-0 text-xs text-indigo-400 font-medium">{t.epic_code}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {allDaysInSprint.map(day => {
            const dayTasks = tasks.filter(t => t.day_label === day)
            return (
              <div key={day} className="flex border-b border-gray-50 last:border-0 min-h-[34px]">
                <div className="w-20 shrink-0 px-3 py-2 bg-gray-50/70 border-r border-gray-100 flex items-start">
                  <span className="text-[11px] font-medium text-gray-400 leading-tight">{day}</span>
                </div>
                <div className="flex-1 flex flex-wrap gap-1 px-2.5 py-1.5 items-start content-start">
                  {dayTasks.length === 0 ? (
                    <span className="text-xs text-gray-200 italic self-center">—</span>
                  ) : (
                    dayTasks.map(t => (
                      <TaskChip
                        key={t.id}
                        task={t}
                        members={members}
                        onHover={onChipHover}
                        onLeave={onChipLeave}
                        onClick={onChipClick}
                        onAssigneeClick={onAssigneeClick}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Task Chip ─────────────────────────────────────────────────────────────────
function TaskChip({
  task, members, onHover, onLeave, onClick, onAssigneeClick,
}: {
  task: Task
  members: TeamMember[]
  onHover: (task: Task, x: number, y: number) => void
  onLeave: () => void
  onClick: (task: Task) => void
  onAssigneeClick: (code: string, x: number, y: number) => void
}) {
  const cs = CHIP[task.assignee_code] ?? CHIP_DEFAULT
  const isDone    = task.status === 'done'
  const isBlocked = task.status === 'blocked'
  const label     = memberLabel(task.assignee_code, members)

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 11,
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: isBlocked ? '#FEF2F2' : cs.bg,
    color:           isBlocked ? '#EF4444'  : cs.text,
    border:          `1px solid ${isBlocked ? '#FCA5A5' : cs.border}`,
    opacity: isDone ? 0.6 : 1,
    ...priorityOutline(task.priority),
  }

  return (
    <div
      style={style}
      onMouseMove={e => onHover(task, e.clientX, e.clientY)}
      onMouseLeave={onLeave}
      onClick={() => onClick(task)}
    >
      <span
        style={{ fontWeight: 700, cursor: 'pointer' }}
        title="Click để đổi tên"
        onClick={e => {
          e.stopPropagation()
          onLeave()
          onAssigneeClick(task.assignee_code, e.clientX, e.clientY)
        }}
      >
        {label}
      </span>
      <span style={{ textDecoration: isDone ? 'line-through' : undefined }}>
        {truncate(task.title, 30)}
      </span>
      {task.estimated_hours != null && task.estimated_hours > 0 && (
        <span style={{ opacity: 0.55 }}>{task.estimated_hours}h</span>
      )}
    </div>
  )
}

// ─── Task Drawer ───────────────────────────────────────────────────────────────
function TaskDrawer({
  task, sprints, members, onClose, onStatusChange,
}: {
  task: Task
  sprints: Sprint[]
  members: TeamMember[]
  onClose: () => void
  onStatusChange: (id: string, status: Task['status']) => void
}) {
  const sprint    = sprints.find(s => s.id === task.sprint_id)
  const cs        = CHIP[task.assignee_code] ?? CHIP_DEFAULT
  const typeStyle = TASK_TYPE_STYLES[task.type] ?? { bg: '#F3F4F6', text: '#374151', label: task.type }
  const label     = memberLabel(task.assignee_code, members)

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col"
        style={{ width: 380, animation: 'drawerSlideIn 0.2s ease-out' }}
      >
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <p className="flex-1 text-base font-medium text-gray-900 leading-snug">{task.title}</p>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}
            >
              {label}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
            >
              {typeStyle.label}
            </span>
            {task.priority !== 'normal' && (
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: task.priority === 'critical' ? '#FEF2F2' : '#FFF7ED',
                  color:           task.priority === 'critical' ? '#EF4444' : '#F97316',
                }}
              >
                {task.priority}
              </span>
            )}
            {task.estimated_hours != null && task.estimated_hours > 0 && (
              <span className="px-2 py-0.5 rounded text-xs text-gray-500 bg-gray-100">
                {task.estimated_hours}h
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ngày thực hiện</p>
            <p className="text-sm text-gray-700">{task.day_label} · {sprint?.name ?? task.sprint_id}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Epic</p>
            <p className="text-sm text-gray-700">{task.epic_code}</p>
          </div>

          {task.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Mô tả</p>
              <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {task.pre_holiday && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              Nên làm trong tuần nghỉ lễ 25/4 – 4/5
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Trạng thái</p>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={task.status === 'outline' ? 'todo' : task.status}
              onChange={e => onStatusChange(task.id, e.target.value as Task['status'])}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">Đang làm</option>
              <option value="done">Xong</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
