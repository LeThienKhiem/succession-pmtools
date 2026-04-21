export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProject, getSprints, getSprint, getTasksBySprint, getEpicsBySprint, getTeamMembers } from '@/lib/queries'
import { SPRINTS, TASKS, EPICS, TEAM_MEMBERS, type Task } from '@/lib/mock-data'
import { ChevronLeft } from 'lucide-react'
import { SprintBoardClient } from './sprint-board-client'

export default async function SprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Try mock ID first (sp-1, sp-2…)
  let sprint = SPRINTS.find(s => s.id === id)

  // UUID from Supabase → resolve name → redirect to canonical mock URL
  if (!sprint) {
    try {
      const dbSprint = await getSprint(id)
      const matched = SPRINTS.find(s => s.name === dbSprint.name)
      if (matched) redirect(`/sprint/${matched.id}`)
    } catch {}
    notFound()
  }

  // Load tasks/epics/members — try Supabase first, fall back to mock
  let tasks:      Task[]       = TASKS.filter(t => t.sprint_id === id)
  let epics                    = EPICS.filter(e => e.sprint_id === id)
  let members                  = TEAM_MEMBERS
  let dbSprintId: string | null = null   // Supabase sprint UUID (for inserting new tasks)
  let projectId:  string | null = null   // Supabase project UUID

  try {
    const [project, dbMembers] = await Promise.all([getProject(), getTeamMembers()])
    projectId = project.id
    if (dbMembers.length > 0) members = dbMembers

    // Find DB sprint by name → get its UUID → fetch tasks & epics
    const dbSprints = await getSprints(project.id)
    const dbSprint  = dbSprints.find((s: any) => s.name === sprint!.name)
    if (dbSprint) {
      dbSprintId = dbSprint.id
      const [dbTasks, dbEpics] = await Promise.all([
        getTasksBySprint(dbSprint.id),
        getEpicsBySprint(dbSprint.id),
      ])
      if (dbTasks.length > 0) tasks = dbTasks
      if (dbEpics.length > 0) epics = dbEpics.map((e: any) => ({
        id: e.id, code: e.code, name: e.name,
        sprint_id: e.sprint_id ?? id, color: e.color ?? '#6B7280',
      }))
    }
  } catch {
    // Network/DB unavailable — continue with mock data
  }

  const statusLabel = sprint.status === 'active' ? 'Đang chạy' : sprint.status === 'upcoming' ? 'Sắp tới' : 'Xong'
  const statusClass = sprint.status === 'active'
    ? 'bg-indigo-100 text-indigo-700'
    : sprint.status === 'upcoming' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'

  return (
    <div className="max-w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/roadmap" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{sprint.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
          </div>
          <p className="text-sm text-gray-500">
            {sprint.theme} · {new Date(sprint.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} → {new Date(sprint.end_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats bar + board — all inside client so stats react to drag/edit */}
      <SprintBoardClient
        tasks={tasks} epics={epics} members={members} sprintId={id}
        dbSprintId={dbSprintId} projectId={projectId}
        sprintCompleted={sprint.status === 'completed'}
      />
    </div>
  )
}
