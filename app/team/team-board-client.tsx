'use client'

import { useState } from 'react'
import { Users, Pencil, X, Check, CheckCircle2, Zap, Circle, ChevronRight } from 'lucide-react'
import { updateTeamMember } from '@/lib/queries'
import { TASK_TYPE_STYLES, STATUS_STYLES, type Task, type TeamMember } from '@/lib/mock-data'
import Link from 'next/link'

interface Props {
  initialMembers: TeamMember[]
  tasks: Task[]
}

export function TeamBoardClient({ initialMembers, tasks }: Props) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [selected, setSelected] = useState<TeamMember | null>(null)

  function handleUpdate(id: string, patch: Partial<Pick<TeamMember, 'name' | 'role'>>) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev)
    updateTeamMember(id, patch)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">Nhân sự dự án</h1>
          <span className="text-sm text-gray-400">({members.length} thành viên)</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {members.map(member => {
            const memberTasks   = tasks.filter(t => t.assignee_code === member.code)
            const inProgress    = memberTasks.filter(t => t.status === 'in-progress')
            const done          = memberTasks.filter(t => t.status === 'done')
            const blocked       = memberTasks.filter(t => t.status === 'blocked')
            const todo          = memberTasks.filter(t => t.status === 'todo')

            return (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.code.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>

                {/* Workload bar */}
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="text-gray-400">{memberTasks.length} tasks</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    {memberTasks.length > 0 && (
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${Math.min((inProgress.length + done.length) * 100 / memberTasks.length, 100)}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {inProgress.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      <Zap size={10} /> {inProgress.length} đang làm
                    </span>
                  )}
                  {done.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                      <CheckCircle2 size={10} /> {done.length} xong
                    </span>
                  )}
                  {blocked.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                      ⚠ {blocked.length} blocked
                    </span>
                  )}
                  {todo.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs font-medium">
                      <Circle size={10} /> {todo.length} todo
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Member detail modal */}
      {selected && (
        <MemberModal
          member={selected}
          tasks={tasks.filter(t => t.assignee_code === selected.code)}
          allTasks={tasks}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}

// ─── Member Modal ────────────────────────────────────────────────────────────

function MemberModal({ member, tasks, onClose, onUpdate }: {
  member: TeamMember
  tasks: Task[]
  allTasks: Task[]
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Pick<TeamMember, 'name' | 'role'>>) => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [editingRole, setEditingRole] = useState(false)
  const [name, setName] = useState(member.name)
  const [role, setRole] = useState(member.role)
  const [activeTab, setActiveTab] = useState<'inprogress' | 'done' | 'todo' | 'blocked'>('inprogress')

  function commitName() {
    const v = name.trim()
    if (v) onUpdate(member.id, { name: v })
    else setName(member.name)
    setEditingName(false)
  }

  function commitRole() {
    const v = role.trim()
    if (v) onUpdate(member.id, { role: v })
    else setRole(member.role)
    setEditingRole(false)
  }

  const byStatus = {
    inprogress: tasks.filter(t => t.status === 'in-progress'),
    done:       tasks.filter(t => t.status === 'done'),
    todo:       tasks.filter(t => t.status === 'todo'),
    blocked:    tasks.filter(t => t.status === 'blocked'),
  }

  const TABS: { key: typeof activeTab; label: string; count: number; color: string }[] = [
    { key: 'inprogress', label: 'Đang làm', count: byStatus.inprogress.length, color: 'text-blue-600' },
    { key: 'done',       label: 'Đã xong',  count: byStatus.done.length,       color: 'text-green-600' },
    { key: 'todo',       label: 'Todo',      count: byStatus.todo.length,       color: 'text-gray-500' },
    { key: 'blocked',    label: 'Blocked',   count: byStatus.blocked.length,    color: 'text-red-500' },
  ]

  const activeTasks = byStatus[activeTab]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ backgroundColor: member.color }}
            >
              {member.code.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              {/* Editable name */}
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setName(member.name); setEditingName(false) } }}
                    className="flex-1 text-base font-semibold border border-indigo-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={commitName} className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0">
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/name">
                  <p className="text-base font-semibold text-gray-900">{name}</p>
                  <button onClick={() => setEditingName(true)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover/name:opacity-100 transition-all">
                    <Pencil size={12} />
                  </button>
                </div>
              )}

              {/* Editable role */}
              {editingRole ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRole(); if (e.key === 'Escape') { setRole(member.role); setEditingRole(false) } }}
                    className="flex-1 text-sm border border-indigo-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={commitRole} className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0">
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/role">
                  <p className="text-sm text-gray-500">{role}</p>
                  <button onClick={() => setEditingRole(true)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover/role:opacity-100 transition-all">
                    <Pencil size={12} />
                  </button>
                </div>
              )}

              {/* Summary */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-gray-400">{tasks.length} tasks tổng</span>
                {byStatus.inprogress.length > 0 && (
                  <span className="text-xs text-blue-500 font-medium">{byStatus.inprogress.length} đang làm</span>
                )}
                {byStatus.done.length > 0 && (
                  <span className="text-xs text-green-500 font-medium">{byStatus.done.length} xong</span>
                )}
              </div>
            </div>

            <button onClick={onClose}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? `border-indigo-600 ${tab.color}`
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {activeTasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">
              Không có task nào
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {activeTasks.map(t => {
                const typeStyle   = TASK_TYPE_STYLES[t.type]
                const statusStyle = STATUS_STYLES[t.status]
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusStyle.dot }} />
                    <p className="flex-1 text-sm text-gray-800 min-w-0 leading-snug line-clamp-2">{t.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{t.epic_code}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}>
                        {typeStyle.label}
                      </span>
                      {t.priority === 'critical' && <span className="text-xs">🔴</span>}
                      {t.priority === 'high' && <span className="text-xs">🟠</span>}
                      <Link
                        href={`/sprint/${t.sprint_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-indigo-400 hover:text-indigo-600 hover:underline transition-colors"
                      >
                        {t.sprint_id.replace('sp-', 'S')}
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
