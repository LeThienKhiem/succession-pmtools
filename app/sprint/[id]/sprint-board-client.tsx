'use client'

import { useState, useMemo, useRef } from 'react'
import { TASK_TYPE_STYLES, STATUS_STYLES, computeStats, type Task } from '@/lib/mock-data'
import { updateTask } from '@/lib/queries'
import { AlertTriangle, CheckCircle2, Zap, Circle } from 'lucide-react'
import { TaskDetailModal } from '@/components/task-detail-modal'
import type { Task as TaskType } from '@/lib/mock-data'

interface Epic   { id: string; code: string; name: string; color: string }
interface Member { id: string; code: string; name: string; color: string; role: string }

interface Props {
  tasks: Task[]
  epics: Epic[]
  members: Member[]
}

const COLUMNS: { status: Task['status']; label: string; dot: string }[] = [
  { status: 'todo',        label: 'Todo',        dot: '#9CA3AF' },
  { status: 'in-progress', label: 'In Progress',  dot: '#3B82F6' },
  { status: 'done',        label: 'Done',         dot: '#22C55E' },
  { status: 'blocked',     label: 'Blocked',      dot: '#EF4444' },
]

export function SprintBoardClient({ tasks: initialTasks, epics, members }: Props) {
  // Local state — will be wired to Supabase later
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterType,     setFilterType]     = useState('all')
  const [filterEpic,     setFilterEpic]     = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [viewMode,       setViewMode]       = useState<'board' | 'list'>('board')

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterAssignee !== 'all' && t.assignee_code !== filterAssignee) return false
    if (filterType     !== 'all' && t.type           !== filterType)     return false
    if (filterEpic     !== 'all' && t.epic_code      !== filterEpic)     return false
    if (filterPriority !== 'all' && t.priority       !== filterPriority) return false
    return true
  }), [tasks, filterAssignee, filterType, filterEpic, filterPriority])

  const stats = useMemo(() => computeStats(tasks), [tasks])
  const taskEpicCodes = [...new Set(tasks.map(t => t.epic_code))]

  function handleUpdate(taskId: string, patch: Partial<Task>) {
    // Optimistic update — UI changes immediately
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...patch } : t))
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, ...patch } : prev)
    // Persist to DB (fire-and-forget; errors logged in updateTask)
    updateTask(taskId, patch)
  }

  const selectCls = 'text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer'

  return (
    <>
      <div className="space-y-3">
        {/* Stats bar — reactive to task state */}
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-sm">
            <Circle size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{stats.total}</span>
            <span className="text-gray-400">tasks</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-sm">
            <Zap size={14} className="text-blue-500" />
            <span className="font-semibold text-blue-600">{stats.inProgress}</span>
            <span className="text-gray-400">in-progress</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="font-semibold text-green-600">{stats.done}</span>
            <span className="text-gray-400">done</span>
          </div>
          {stats.blocked > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="font-semibold text-red-600">{stats.blocked}</span>
              <span className="text-gray-400">blocked</span>
            </div>
          )}
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400">Critical:</span>
            <span className="font-semibold text-red-600">{stats.critical}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.total ? Math.round(stats.done * 100 / stats.total) : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {stats.total ? Math.round(stats.done * 100 / stats.total) : 0}%
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <select className={selectCls} value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
            <option value="all">Tất cả thành viên</option>
            {members.map(m => <option key={m.code} value={m.code}>{m.name} ({m.code})</option>)}
          </select>

          <select className={selectCls} value={filterEpic} onChange={e => setFilterEpic(e.target.value)}>
            <option value="all">Tất cả epic</option>
            {taskEpicCodes.map(code => <option key={code} value={code}>{code}</option>)}
          </select>

          <select className={selectCls} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tất cả loại</option>
            {(['spec','story','design','dev','test','review','doc'] as const).map(t => (
              <option key={t} value={t}>{TASK_TYPE_STYLES[t].label}</option>
            ))}
          </select>

          <select className={selectCls} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">Tất cả priority</option>
            <option value="critical">🔴 Critical</option>
            <option value="priority">🟠 Priority</option>
            <option value="normal">Normal</option>
          </select>

          <span className="text-xs text-gray-400 ml-1">{filtered.length} tasks</span>
          <div className="flex-1" />

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['board','list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'board' ? 'Kanban' : 'List'}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'board' ? (
          <BoardView
            tasks={filtered}
            members={members}
            onTaskClick={setSelectedTask}
            onStatusChange={(id, s) => handleUpdate(id, { status: s })}
          />
        ) : (
          <ListView
            tasks={filtered}
            members={members}
            onTaskClick={setSelectedTask}
          />
        )}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          epics={epics}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}

// ─── Member Avatar ───────────────────────────────────────────────────────────

function MemberAvatar({ code, members, size = 20 }: { code: string; members: Member[]; size?: number }) {
  const m = members.find(x => x.code === code)
  if (!m) return null
  return (
    <div
      title={`${m.name} (${m.role})`}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: m.color, fontSize: size * 0.38 }}
    >
      {m.code.toUpperCase().slice(0, 2)}
    </div>
  )
}

// ─── Task Card ───────────────────────────────────────────────────────────────

function TaskCard({
  task, members, onTaskClick, onDragStart, onDragEnd,
}: {
  task: Task
  members: Member[]
  onTaskClick: (t: Task) => void
  onDragStart: (e: React.DragEvent, t: Task) => void
  onDragEnd: (e: React.DragEvent) => void
}) {
  const typeStyle = TASK_TYPE_STYLES[task.type]

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onTaskClick(task)}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing active:opacity-60 active:scale-[0.98] group select-none"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">{task.epic_code}</span>
        <span
          className="px-1.5 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
        >
          {typeStyle.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm text-gray-800 leading-snug mb-2.5 group-hover:text-gray-900 line-clamp-3">
        {task.title}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MemberAvatar code={task.assignee_code} members={members} size={20} />
          <span className="text-xs text-gray-400">{task.day_label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {task.priority === 'critical' && <AlertTriangle size={12} className="text-red-500" />}
          {task.priority === 'priority' && <AlertTriangle size={12} className="text-orange-400" />}
          {task.estimated_hours && (
            <span className="text-xs text-gray-400">{task.estimated_hours}h</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Board (Kanban) View ─────────────────────────────────────────────────────

function BoardView({
  tasks, members, onTaskClick, onStatusChange,
}: {
  tasks: Task[]
  members: Member[]
  onTaskClick: (t: Task) => void
  onStatusChange: (id: string, s: Task['status']) => void
}) {
  const draggingRef = useRef<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null)

  function handleDragStart(e: React.DragEvent, task: Task) {
    draggingRef.current = task.id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  function handleDragEnd(e: React.DragEvent) {
    draggingRef.current = null
    setDragOverCol(null)
  }

  function handleDragOver(e: React.DragEvent, status: Task['status']) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(status)
  }

  function handleDrop(e: React.DragEvent, status: Task['status']) {
    e.preventDefault()
    const id = draggingRef.current ?? e.dataTransfer.getData('text/plain')
    if (id) onStatusChange(id, status)
    setDragOverCol(null)
    draggingRef.current = null
  }

  return (
    <div className="grid grid-cols-4 gap-4 items-start">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status)
        const isOver   = dragOverCol === col.status

        return (
          <div
            key={col.status}
            onDragEnter={e => { e.preventDefault(); setDragOverCol(col.status) }}
            onDragOver={e => handleDragOver(e, col.status)}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null) }}
            onDrop={e => handleDrop(e, col.status)}
            className={`rounded-xl border overflow-hidden transition-colors ${
              isOver
                ? 'border-indigo-400 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dot }} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>

            {/* Drop zone + cards */}
            <div className={`p-2 space-y-2 min-h-[120px] transition-colors ${isOver ? 'bg-indigo-50' : ''}`}>
              {colTasks.length === 0 ? (
                <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${
                  isOver ? 'border-indigo-300 text-indigo-400' : 'border-gray-200 text-gray-400'
                }`}>
                  <span className="text-xs">{isOver ? 'Thả vào đây' : 'Trống'}</span>
                </div>
              ) : (
                colTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    members={members}
                    onTaskClick={onTaskClick}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
              {/* Extra drop target at bottom when column has cards */}
              {colTasks.length > 0 && isOver && (
                <div className="h-8 rounded-lg border-2 border-dashed border-indigo-300 flex items-center justify-center">
                  <span className="text-xs text-indigo-400">Thả vào đây</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── List View ───────────────────────────────────────────────────────────────

function ListView({ tasks, members, onTaskClick }: {
  tasks: Task[]
  members: Member[]
  onTaskClick: (t: Task) => void
}) {
  const byDay = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    ;(acc[t.day_label] ??= []).push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(byDay).map(([day, dayTasks]) => (
        <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{day}</span>
            <span className="text-xs text-gray-400">{dayTasks.length} tasks</span>
          </div>
          <div className="divide-y divide-gray-50">
            {dayTasks.map(t => {
              const typeStyle   = TASK_TYPE_STYLES[t.type]
              const statusStyle = STATUS_STYLES[t.status]
              return (
                <div
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusStyle.dot }} />
                  <p className="flex-1 text-sm text-gray-800 min-w-0 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-gray-400">{t.epic_code}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
                    >
                      {typeStyle.label}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusStyle.label}
                    </span>
                    {t.priority === 'critical' && <span className="text-xs">🔴</span>}
                    {t.priority === 'priority' && <span className="text-xs">🟠</span>}
                    <MemberAvatar code={t.assignee_code} members={members} size={22} />
                    {t.estimated_hours && (
                      <span className="text-xs text-gray-400 w-8 text-right">{t.estimated_hours}h</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
