'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { TASK_TYPE_STYLES, STATUS_STYLES, computeStats, type Task } from '@/lib/mock-data'
import { updateTask } from '@/lib/queries'
import { AlertTriangle, CheckCircle2, Zap, Circle } from 'lucide-react'
import { TaskDetailModal } from '@/components/task-detail-modal'

interface Epic   { id: string; code: string; name: string; color: string }
interface Member { id: string; code: string; name: string; color: string; role: string }

interface Props {
  tasks: Task[]
  epics: Epic[]
  members: Member[]
  sprintId: string
}

const lsKey = (id: string) => `pm-sprint-order-${id}`

type OrderEntry = { status: Task['status']; sort_order: number }

function loadOrder(sprintId: string): Record<string, OrderEntry> | null {
  try {
    const raw = localStorage.getItem(lsKey(sprintId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveOrder(sprintId: string, tasks: Task[]) {
  try {
    const map: Record<string, OrderEntry> = {}
    tasks.forEach(t => { map[t.id] = { status: t.status, sort_order: t.sort_order ?? 0 } })
    localStorage.setItem(lsKey(sprintId), JSON.stringify(map))
  } catch {}
}

const COLUMNS: { status: Task['status']; label: string; dot: string }[] = [
  { status: 'todo',        label: 'Todo',        dot: '#9CA3AF' },
  { status: 'in-progress', label: 'In Progress',  dot: '#3B82F6' },
  { status: 'done',        label: 'Done',         dot: '#22C55E' },
  { status: 'blocked',     label: 'Blocked',      dot: '#EF4444' },
]

export function SprintBoardClient({ tasks: initialTasks, epics, members, sprintId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Restore saved positions from localStorage after hydration
  useEffect(() => {
    const saved = loadOrder(sprintId)
    if (!saved) return
    setTasks(prev => prev.map(t => saved[t.id] ? { ...t, ...saved[t.id] } : t))
  }, [sprintId])

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
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, ...patch } : t)
      saveOrder(sprintId, next)
      return next
    })
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, ...patch } : prev)
    updateTask(taskId, patch)
  }

  /** Called by BoardView when a card is dropped onto a column/zone */
  function handleBoardDrop(
    draggedId: string,
    targetStatus: Task['status'],
    insertBeforeId: string | null,
  ) {
    setTasks(prev => {
      const dragged = prev.find(t => t.id === draggedId)
      if (!dragged) return prev

      // New ordered list for the target column (excluding the dragged card)
      const colTasks = prev
        .filter(t => t.status === targetStatus && t.id !== draggedId)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

      const draggedNew: Task = { ...dragged, status: targetStatus }

      if (insertBeforeId) {
        const idx = colTasks.findIndex(t => t.id === insertBeforeId)
        colTasks.splice(idx >= 0 ? idx : colTasks.length, 0, draggedNew)
      } else {
        colTasks.push(draggedNew)
      }

      // Assign contiguous sort_order and persist changes
      const sortMap = new Map<string, number>()
      colTasks.forEach((t, i) => sortMap.set(t.id, (i + 1) * 10))

      colTasks.forEach((t, i) => {
        const newOrder = (i + 1) * 10
        if (t.id === draggedId) {
          updateTask(t.id, { status: targetStatus, sort_order: newOrder })
        } else if ((t.sort_order ?? 0) !== newOrder) {
          updateTask(t.id, { sort_order: newOrder })
        }
      })

      const next = prev.map(t => {
        if (sortMap.has(t.id)) return { ...t, status: targetStatus, sort_order: sortMap.get(t.id) }
        return t
      })
      saveOrder(sprintId, next)
      return next
    })
  }

  const selectCls = 'text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer'

  return (
    <>
      <div className="space-y-3">
        {/* Stats bar */}
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
            onDrop={handleBoardDrop}
          />
        ) : (
          <ListView
            tasks={filtered}
            members={members}
            onTaskClick={setSelectedTask}
          />
        )}
      </div>

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
  task, members, onTaskClick, onDragStart, onDragEnd, onDragOver, onDrop, dropIndicator,
}: {
  task: Task
  members: Member[]
  onTaskClick: (t: Task) => void
  onDragStart: (e: React.DragEvent, t: Task) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, taskId: string) => void
  onDrop: (e: React.DragEvent, taskId: string) => void
  dropIndicator: 'top' | 'bottom' | null
}) {
  const typeStyle = TASK_TYPE_STYLES[task.type]

  return (
    <div className="relative">
      {/* Top insert line */}
      {dropIndicator === 'top' && (
        <div className="absolute -top-px inset-x-0 h-0.5 bg-indigo-400 rounded-full z-10 pointer-events-none" />
      )}

      <div
        draggable
        onDragStart={e => onDragStart(e, task)}
        onDragEnd={onDragEnd}
        onDragOver={e => onDragOver(e, task.id)}
        onDrop={e => onDrop(e, task.id)}
        onClick={() => onTaskClick(task)}
        className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing active:opacity-50 active:scale-[0.98] group select-none ${
          dropIndicator ? 'border-indigo-200' : 'border-gray-200 hover:border-indigo-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400">{task.epic_code}</span>
          <span
            className="px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {typeStyle.label}
          </span>
        </div>

        <p className="text-sm text-gray-800 leading-snug mb-2.5 group-hover:text-gray-900 line-clamp-3">
          {task.title}
        </p>

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

      {/* Bottom insert line */}
      {dropIndicator === 'bottom' && (
        <div className="absolute -bottom-px inset-x-0 h-0.5 bg-indigo-400 rounded-full z-10 pointer-events-none" />
      )}
    </div>
  )
}

// ─── Board (Kanban) View ─────────────────────────────────────────────────────

function BoardView({
  tasks, members, onTaskClick, onDrop,
}: {
  tasks: Task[]
  members: Member[]
  onTaskClick: (t: Task) => void
  onDrop: (draggedId: string, targetStatus: Task['status'], insertBeforeId: string | null) => void
}) {
  const draggingRef = useRef<string | null>(null)
  const [dragOverCol,    setDragOverCol]    = useState<Task['status'] | null>(null)
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)
  const [dragOverPos,    setDragOverPos]    = useState<'top' | 'bottom'>('bottom')

  function clearDrag() {
    draggingRef.current = null
    setDragOverCol(null)
    setDragOverCardId(null)
  }

  function handleDragStart(e: React.DragEvent, task: Task) {
    draggingRef.current = task.id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  function handleCardDragOver(e: React.DragEvent, taskId: string) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const pos: 'top' | 'bottom' = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom'
    setDragOverCardId(taskId)
    setDragOverPos(pos)
  }

  function handleCardDrop(e: React.DragEvent, targetTask: Task, colTasks: Task[]) {
    e.preventDefault()
    e.stopPropagation()
    const id = draggingRef.current ?? e.dataTransfer.getData('text/plain')
    if (!id || id === targetTask.id) { clearDrag(); return }

    const idx = colTasks.findIndex(t => t.id === targetTask.id)
    let insertBeforeId: string | null
    if (dragOverPos === 'top') {
      insertBeforeId = targetTask.id
    } else {
      insertBeforeId = idx < colTasks.length - 1 ? colTasks[idx + 1].id : null
    }

    onDrop(id, targetTask.status, insertBeforeId)
    clearDrag()
  }

  function handleColDrop(e: React.DragEvent, status: Task['status']) {
    e.preventDefault()
    // Only fire if not already handled by a card
    if (dragOverCardId) { clearDrag(); return }
    const id = draggingRef.current ?? e.dataTransfer.getData('text/plain')
    if (id) onDrop(id, status, null)
    clearDrag()
  }

  return (
    <div className="grid grid-cols-4 gap-4 items-start">
      {COLUMNS.map(col => {
        const colTasks = tasks
          .filter(t => t.status === col.status)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        const isOver = dragOverCol === col.status && !dragOverCardId

        return (
          <div
            key={col.status}
            onDragEnter={e => { e.preventDefault(); setDragOverCol(col.status) }}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) clearDrag() }}
            onDrop={e => handleColDrop(e, col.status)}
            className={`rounded-xl border overflow-hidden transition-colors ${
              isOver ? 'border-indigo-400 bg-indigo-50 shadow-md' : 'border-gray-200 bg-gray-50'
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

            {/* Cards */}
            <div className={`p-2 space-y-2 min-h-[120px] transition-colors ${isOver ? 'bg-indigo-50' : ''}`}>
              {colTasks.length === 0 ? (
                <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${
                  isOver ? 'border-indigo-300 text-indigo-400' : 'border-gray-200 text-gray-400'
                }`}>
                  <span className="text-xs">{isOver ? 'Thả vào đây' : 'Trống'}</span>
                </div>
              ) : (
                colTasks.map(t => {
                  const isOverThis = dragOverCardId === t.id
                  return (
                    <TaskCard
                      key={t.id}
                      task={t}
                      members={members}
                      onTaskClick={onTaskClick}
                      onDragStart={handleDragStart}
                      onDragEnd={clearDrag}
                      onDragOver={handleCardDragOver}
                      onDrop={(e, taskId) => {
                        const target = colTasks.find(x => x.id === taskId)!
                        handleCardDrop(e, target, colTasks)
                      }}
                      dropIndicator={isOverThis ? dragOverPos : null}
                    />
                  )
                })
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
