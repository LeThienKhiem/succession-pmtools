'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { TASK_TYPE_STYLES, STATUS_STYLES, computeStats, type Task, type TaskType } from '@/lib/mock-data'
import { updateTask, insertTask } from '@/lib/queries'
import { AlertTriangle, CheckCircle2, Zap, Circle, Plus, X, Check, Archive } from 'lucide-react'
import { TaskDetailModal } from '@/components/task-detail-modal'

interface Epic   { id: string; code: string; name: string; color: string }
interface Member { id: string; code: string; name: string; color: string; role: string }

interface Props {
  tasks:       Task[]
  epics:       Epic[]
  members:     Member[]
  sprintId:    string
  dbSprintId:  string | null  // Supabase sprint UUID — null when DB not connected
  projectId:   string | null  // Supabase project UUID
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const lsKey         = (id: string) => `pm-sprint-order-${id}`
const lsNewTasksKey = (id: string) => `pm-sprint-newtasks-${id}`

type OrderEntry = { status: Task['status']; sort_order: number }

function loadOrder(sprintId: string): Record<string, OrderEntry> | null {
  try { const r = localStorage.getItem(lsKey(sprintId)); return r ? JSON.parse(r) : null }
  catch { return null }
}
function saveOrder(sprintId: string, tasks: Task[]) {
  try {
    const map: Record<string, OrderEntry> = {}
    tasks.forEach(t => { map[t.id] = { status: t.status, sort_order: t.sort_order ?? 0 } })
    localStorage.setItem(lsKey(sprintId), JSON.stringify(map))
  } catch {}
}
function loadNewTasks(sprintId: string): Task[] {
  try { const r = localStorage.getItem(lsNewTasksKey(sprintId)); return r ? JSON.parse(r) : [] }
  catch { return [] }
}
function persistNewTask(sprintId: string, task: Task) {
  const all = loadNewTasks(sprintId)
  const idx = all.findIndex(t => t.id === task.id)
  idx >= 0 ? all.splice(idx, 1, task) : all.push(task)
  try { localStorage.setItem(lsNewTasksKey(sprintId), JSON.stringify(all)) } catch {}
}
function removeNewTask(sprintId: string, taskId: string) {
  const all = loadNewTasks(sprintId).filter(t => t.id !== taskId)
  try { localStorage.setItem(lsNewTasksKey(sprintId), JSON.stringify(all)) } catch {}
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS: { status: Task['status']; label: string; dot: string; isArchive?: boolean }[] = [
  { status: 'todo',        label: 'Todo',        dot: '#9CA3AF' },
  { status: 'in-progress', label: 'In Progress', dot: '#3B82F6' },
  { status: 'done',        label: 'Done',        dot: '#22C55E' },
  { status: 'blocked',     label: 'Blocked',     dot: '#EF4444' },
  { status: 'outline',     label: 'Archive',     dot: '#D1D5DB', isArchive: true },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ─── SprintBoardClient ────────────────────────────────────────────────────────

export function SprintBoardClient({ tasks: initialTasks, epics, members, sprintId, dbSprintId, projectId }: Props) {
  const [tasks,        setTasks]        = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Restore saved positions + locally-created / locally-edited tasks
  useEffect(() => {
    const saved    = loadOrder(sprintId)
    const newTasks = loadNewTasks(sprintId)
    setTasks(prev => {
      const existingIds  = new Set(prev.map(t => t.id))
      // Map of locally-persisted task data (non-UUID tasks only)
      const localDataMap = new Map(newTasks.map(t => [t.id, t]))

      // 1. Apply locally-saved full data back onto matching server tasks
      //    (covers mock-ID tasks whose title/description were edited)
      //    UUID tasks are never written to lsNewTasksKey so this is a no-op for them.
      let result = prev.map(t => {
        const local = localDataMap.get(t.id)
        return local ? { ...t, ...local } : t
      })

      // 2. Append truly new locally-created tasks not present in server data
      result = [...result, ...newTasks.filter(t => !existingIds.has(t.id))]

      // 3. Apply status/sort_order overrides last (drag-drop order takes final precedence)
      if (saved) result = result.map(t => saved[t.id] ? { ...t, ...saved[t.id] } : t)
      return result
    })
  }, [sprintId])

  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterType,     setFilterType]     = useState('all')
  const [filterEpic,     setFilterEpic]     = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [viewMode,       setViewMode]       = useState<'board' | 'list'>('board')

  // Exclude archived tasks from stats
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'outline'), [tasks])
  const stats       = useMemo(() => computeStats(activeTasks), [activeTasks])

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterAssignee !== 'all' && t.assignee_code !== filterAssignee) return false
    if (filterType     !== 'all' && t.type           !== filterType)     return false
    if (filterEpic     !== 'all' && t.epic_code      !== filterEpic)     return false
    if (filterPriority !== 'all' && t.priority       !== filterPriority) return false
    return true
  }), [tasks, filterAssignee, filterType, filterEpic, filterPriority])

  const taskEpicCodes = [...new Set(tasks.filter(t => t.status !== 'outline').map(t => t.epic_code))]

  function handleUpdate(taskId: string, patch: Partial<Task>) {
    const next = tasks.map(t => t.id === taskId ? { ...t, ...patch } : t)
    setTasks(next)
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, ...patch } : prev)
    saveOrder(sprintId, next)
    if (!UUID_RE.test(taskId)) {
      const updated = next.find(t => t.id === taskId)
      if (updated) persistNewTask(sprintId, updated)
    }
    updateTask(taskId, patch)
  }

  function handleBoardDrop(
    draggedId: string,
    targetStatus: Task['status'],
    insertBeforeId: string | null,
  ) {
    const dragged = tasks.find(t => t.id === draggedId)
    if (!dragged) return

    const colTasks = tasks
      .filter(t => t.status === targetStatus && t.id !== draggedId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

    const draggedNew: Task = { ...dragged, status: targetStatus }

    if (insertBeforeId) {
      const idx = colTasks.findIndex(t => t.id === insertBeforeId)
      colTasks.splice(idx >= 0 ? idx : colTasks.length, 0, draggedNew)
    } else {
      colTasks.push(draggedNew)
    }

    const sortMap = new Map<string, number>()
    colTasks.forEach((t, i) => sortMap.set(t.id, (i + 1) * 10))

    // DB + localStorage sync — outside state updater so no double-call in StrictMode
    colTasks.forEach((t, i) => {
      const newOrder = (i + 1) * 10
      if (t.id === draggedId) {
        updateTask(t.id, { status: targetStatus, sort_order: newOrder })
      } else if ((t.sort_order ?? 0) !== newOrder) {
        updateTask(t.id, { sort_order: newOrder })
      }
    })

    const next = tasks.map(t =>
      sortMap.has(t.id)
        ? { ...t, status: targetStatus, sort_order: sortMap.get(t.id)! }
        : t
    )
    setTasks(next)
    saveOrder(sprintId, next)

    // Persist full task data for locally-created tasks that were moved
    if (!UUID_RE.test(draggedId)) {
      const updated = next.find(t => t.id === draggedId)
      if (updated) persistNewTask(sprintId, updated)
    }
  }

  async function handleAddTask(
    title: string,
    type: TaskType,
    assigneeCode: string,
    status: Task['status'],
  ) {
    const tempId  = `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const member  = members.find(m => m.code === assigneeCode)
    const epic    = epics[0]

    const newTask: Task = {
      id:            tempId,
      sprint_id:     sprintId,
      epic_id:       epic?.id ?? '',
      epic_code:     epic?.code ?? '',
      title:         title.trim(),
      assignee_id:   member?.id ?? '',
      assignee_code: assigneeCode,
      day_label:     '',
      type,
      status,
      priority:      'normal',
      sort_order:    Date.now(),
    }

    // 1. Optimistic UI update (instant feedback)
    const optimisticNext = [...tasks, newTask]
    setTasks(optimisticNext)
    saveOrder(sprintId, optimisticNext)
    persistNewTask(sprintId, newTask)

    // 2. Persist to Supabase if connected
    if (dbSprintId && projectId) {
      const saved = await insertTask({
        sprint_id:   dbSprintId,
        project_id:  projectId,
        epic_id:     epic?.id || undefined,
        title:       title.trim(),
        assignee_id: member?.id || undefined,
        day_label:   '',
        type,
        status,
        priority:    'normal',
        sort_order:  newTask.sort_order,
      })

      if (saved) {
        // 3. Swap temp ID → real UUID in state + localStorage
        setTasks(prev => {
          const next = prev.map(t =>
            t.id === tempId
              ? {
                  ...saved,
                  // Keep display fields if join didn't resolve (edge case)
                  assignee_code: saved.assignee_code || assigneeCode,
                  epic_code:     saved.epic_code     || epic?.code || '',
                }
              : t
          )
          saveOrder(sprintId, next)
          return next
        })
        removeNewTask(sprintId, tempId)
      }
      // On failure: task stays with temp ID in localStorage — still usable
    }
  }

  const selectCls = 'text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer shadow-sm'

  return (
    <>
      <div className="space-y-3">
        {/* Stats bar */}
        <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-3.5 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-1.5">
            <Circle size={13} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-700 tabular-nums">{stats.total}</span>
            <span className="text-xs text-slate-400">tasks</span>
          </div>
          <div className="w-px h-4 bg-slate-100" />
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-blue-400" />
            <span className="text-sm font-bold text-blue-600 tabular-nums">{stats.inProgress}</span>
            <span className="text-xs text-slate-400">in-progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-sm font-bold text-emerald-600 tabular-nums">{stats.done}</span>
            <span className="text-xs text-slate-400">done</span>
          </div>
          {stats.blocked > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-red-400" />
              <span className="text-sm font-bold text-red-500 tabular-nums">{stats.blocked}</span>
              <span className="text-xs text-slate-400">blocked</span>
            </div>
          )}
          {stats.critical > 0 && (
            <>
              <div className="w-px h-4 bg-slate-100" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Critical</span>
                <span className="text-sm font-bold text-red-500 tabular-nums">{stats.critical}</span>
              </div>
            </>
          )}
          {tasks.filter(t => t.status === 'outline').length > 0 && (
            <>
              <div className="w-px h-4 bg-slate-100" />
              <div className="flex items-center gap-1.5">
                <Archive size={13} className="text-slate-300" />
                <span className="text-sm font-bold text-slate-400 tabular-nums">{tasks.filter(t => t.status === 'outline').length}</span>
                <span className="text-xs text-slate-400">archived</span>
              </div>
            </>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.total ? Math.round(stats.done * 100 / stats.total) : 0}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
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

          <span className="text-xs text-slate-400 ml-1 font-medium">
            {filtered.filter(t => t.status !== 'outline').length} tasks
          </span>
          <div className="flex-1" />

          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(['board','list'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === v
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                }`}>
                {v === 'board' ? 'Kanban' : 'List'}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'board' ? (
          <BoardView
            tasks={filtered}
            members={members}
            epics={epics}
            onTaskClick={setSelectedTask}
            onDrop={handleBoardDrop}
            onAddTask={handleAddTask}
          />
        ) : (
          <ListView tasks={filtered} members={members} onTaskClick={setSelectedTask} />
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

// ─── Member Avatar ─────────────────────────────────────────────────────────────

function MemberAvatar({ code, members, size = 20 }: { code: string; members: Member[]; size?: number }) {
  const m = members.find(x => x.code === code)
  if (!m) return null
  return (
    <div title={`${m.name} (${m.role})`}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: m.color, fontSize: size * 0.38 }}>
      {m.code.toUpperCase().slice(0, 2)}
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task, members, onTaskClick, onDragStart, onDragEnd, onDragOver, onDrop, dropIndicator, muted,
}: {
  task: Task; members: Member[]
  onTaskClick: (t: Task) => void
  onDragStart: (e: React.DragEvent, t: Task) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, taskId: string) => void
  onDrop: (e: React.DragEvent, taskId: string) => void
  dropIndicator: 'top' | 'bottom' | null
  muted?: boolean
}) {
  const typeStyle = TASK_TYPE_STYLES[task.type]
  return (
    <div className="relative">
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
        className={`bg-white border rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing active:opacity-50 active:scale-[0.98] group select-none ${
          muted ? 'opacity-40 hover:opacity-70' : 'hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]'
        } ${dropIndicator
          ? 'border-indigo-300 shadow-[0_0_0_2px_rgba(99,102,241,0.15)]'
          : 'border-slate-100 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)] hover:border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 tracking-wide">{task.epic_code}</span>
          <span className="px-1.5 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}>
            {typeStyle.label}
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-snug mb-2.5 group-hover:text-slate-900 line-clamp-3">
          {task.title}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MemberAvatar code={task.assignee_code} members={members} size={20} />
            {task.day_label && <span className="text-[11px] text-slate-300 font-medium">{task.day_label}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {task.priority === 'critical' && <AlertTriangle size={11} className="text-red-400" />}
            {task.priority === 'priority'  && <AlertTriangle size={11} className="text-orange-300" />}
            {task.estimated_hours && (
              <span className="text-[11px] text-slate-300 font-medium tabular-nums">{task.estimated_hours}h</span>
            )}
          </div>
        </div>
      </div>
      {dropIndicator === 'bottom' && (
        <div className="absolute -bottom-px inset-x-0 h-0.5 bg-indigo-400 rounded-full z-10 pointer-events-none" />
      )}
    </div>
  )
}

// ─── Board (Kanban) View ──────────────────────────────────────────────────────

function BoardView({
  tasks, members, epics, onTaskClick, onDrop, onAddTask,
}: {
  tasks: Task[]
  members: Member[]
  epics: Epic[]
  onTaskClick: (t: Task) => void
  onDrop: (draggedId: string, targetStatus: Task['status'], insertBeforeId: string | null) => void
  onAddTask: (title: string, type: TaskType, assigneeCode: string, status: Task['status']) => void
}) {
  const draggingRef = useRef<string | null>(null)
  const [dragOverCol,    setDragOverCol]    = useState<Task['status'] | null>(null)
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)
  const [dragOverPos,    setDragOverPos]    = useState<'top' | 'bottom'>('bottom')

  // Add card form state
  const [addingToCol,  setAddingToCol]  = useState<Task['status'] | null>(null)
  const [newTitle,     setNewTitle]     = useState('')
  const [newType,      setNewType]      = useState<TaskType>('story')
  const [newAssignee,  setNewAssignee]  = useState(members[0]?.code ?? '')
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingToCol) {
      setNewAssignee(members[0]?.code ?? '')
      setTimeout(() => addInputRef.current?.focus(), 50)
    }
  }, [addingToCol, members])

  function clearDrag() {
    draggingRef.current = null; setDragOverCol(null); setDragOverCardId(null)
  }

  function handleDragStart(e: React.DragEvent, task: Task) {
    draggingRef.current = task.id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  function handleCardDragOver(e: React.DragEvent, taskId: string) {
    e.preventDefault(); e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const pos: 'top' | 'bottom' = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom'
    setDragOverCardId(taskId); setDragOverPos(pos)
  }

  function handleCardDrop(e: React.DragEvent, targetTask: Task, colTasks: Task[]) {
    e.preventDefault(); e.stopPropagation()
    const id = draggingRef.current ?? e.dataTransfer.getData('text/plain')
    if (!id || id === targetTask.id) { clearDrag(); return }
    const idx = colTasks.findIndex(t => t.id === targetTask.id)
    const insertBeforeId = dragOverPos === 'top'
      ? targetTask.id
      : idx < colTasks.length - 1 ? colTasks[idx + 1].id : null
    onDrop(id, targetTask.status, insertBeforeId)
    clearDrag()
  }

  function handleColDrop(e: React.DragEvent, status: Task['status']) {
    e.preventDefault()
    if (dragOverCardId) { clearDrag(); return }
    const id = draggingRef.current ?? e.dataTransfer.getData('text/plain')
    if (id) onDrop(id, status, null)
    clearDrag()
  }

  function confirmAdd() {
    if (!newTitle.trim() || !addingToCol) return
    onAddTask(newTitle.trim(), newType, newAssignee || members[0]?.code, addingToCol)
    setAddingToCol(null); setNewTitle(''); setNewType('story')
  }

  return (
    <div className="flex gap-4 items-start overflow-x-auto pb-2">
      {COLUMNS.map(col => {
        const colTasks = tasks
          .filter(t => t.status === col.status)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        const isOver    = dragOverCol === col.status && !dragOverCardId
        const isAdding  = addingToCol === col.status

        return (
          <div key={col.status}
            onDragEnter={e => { e.preventDefault(); setDragOverCol(col.status) }}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) clearDrag() }}
            onDrop={e => handleColDrop(e, col.status)}
            className={`rounded-2xl border overflow-hidden transition-all duration-200 flex-shrink-0 ${
              col.isArchive ? 'w-52' : 'w-64'
            } ${isOver
              ? 'border-indigo-300 bg-indigo-50/60 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
              : col.isArchive
              ? 'border-dashed border-slate-200 bg-slate-50/40'
              : 'border-slate-100 bg-slate-50/60 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.04)]'
            }`}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2.5 border-b ${
              col.isArchive ? 'border-slate-100 bg-slate-50/80' : 'border-slate-100 bg-white/80'
            }`}>
              <div className="flex items-center gap-2">
                {col.isArchive
                  ? <Archive size={13} className="text-slate-300" />
                  : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dot }} />
                }
                <span className={`text-xs font-semibold uppercase tracking-wide ${
                  col.isArchive ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {col.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full tabular-nums">
                  {colTasks.length}
                </span>
                {!col.isArchive && (
                  <button
                    onClick={() => setAddingToCol(isAdding ? null : col.status)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isAdding
                        ? 'bg-indigo-100 text-indigo-500'
                        : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'
                    }`}
                    title="Thêm task"
                  >
                    {isAdding ? <X size={11} /> : <Plus size={11} />}
                  </button>
                )}
              </div>
            </div>

            {/* Quick-add form */}
            {isAdding && (
              <div className="px-2 pt-2 pb-1.5 bg-indigo-50/50 border-b border-indigo-100/60 space-y-1.5">
                <input
                  ref={addInputRef}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') confirmAdd()
                    if (e.key === 'Escape') { setAddingToCol(null); setNewTitle('') }
                  }}
                  placeholder="Tiêu đề task..."
                  className="w-full text-sm border border-indigo-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white placeholder-slate-300"
                />
                <div className="flex gap-1.5">
                  <select value={newType} onChange={e => setNewType(e.target.value as TaskType)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300">
                    {(['spec','story','design','dev','test','review','doc'] as const).map(t => (
                      <option key={t} value={t}>{TASK_TYPE_STYLES[t].label}</option>
                    ))}
                  </select>
                  <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300">
                    {members.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setAddingToCol(null); setNewTitle('') }}
                    className="flex-1 py-1 rounded-lg border border-slate-200 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
                    Hủy
                  </button>
                  <button onClick={confirmAdd} disabled={!newTitle.trim()}
                    className="flex-1 py-1 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-1">
                    <Check size={10} /> Thêm
                  </button>
                </div>
              </div>
            )}

            {/* Cards */}
            <div className={`p-2 space-y-1.5 min-h-[80px] transition-colors ${isOver ? 'bg-indigo-50/40' : ''}`}>
              {colTasks.length === 0 ? (
                <div className={`flex items-center justify-center h-16 rounded-xl border-2 border-dashed transition-colors ${
                  isOver
                    ? 'border-indigo-200 text-indigo-300'
                    : col.isArchive
                    ? 'border-slate-100 text-slate-200'
                    : 'border-slate-100 text-slate-300'
                }`}>
                  <span className="text-xs font-medium">
                    {isOver ? 'Thả vào đây' : col.isArchive ? 'Kéo task để archive' : 'Trống'}
                  </span>
                </div>
              ) : (
                colTasks.map(t => {
                  const isOverThis = dragOverCardId === t.id
                  return (
                    <TaskCard
                      key={t.id}
                      task={t}
                      members={members}
                      muted={col.isArchive}
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

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ tasks, members, onTaskClick }: {
  tasks: Task[]; members: Member[]; onTaskClick: (t: Task) => void
}) {
  // Exclude archived from list view
  const visible = tasks.filter(t => t.status !== 'outline')
  const byDay   = visible.reduce<Record<string, Task[]>>((acc, t) => {
    ;(acc[t.day_label] ??= []).push(t); return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(byDay).map(([day, dayTasks]) => (
        <div key={day} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_4px_-1px_rgba(0,0,0,0.06)]">
          <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{day}</span>
            <span className="text-[11px] font-semibold text-slate-300 tabular-nums">{dayTasks.length} tasks</span>
          </div>
          <div className="divide-y divide-slate-50">
            {dayTasks.map(t => {
              const typeStyle   = TASK_TYPE_STYLES[t.type]
              const statusStyle = STATUS_STYLES[t.status]
              return (
                <div key={t.id} onClick={() => onTaskClick(t)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusStyle.dot }} />
                  <p className="flex-1 text-sm text-gray-800 min-w-0 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-gray-400">{t.epic_code}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}>
                      {typeStyle.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                      {statusStyle.label}
                    </span>
                    {t.priority === 'critical' && <span className="text-xs">🔴</span>}
                    {t.priority === 'priority'  && <span className="text-xs">🟠</span>}
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
