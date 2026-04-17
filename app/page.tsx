import Link from 'next/link'
import { getProject, getMilestones, getSprints, getTasksByProject, getTeamMembers, computeStats } from '@/lib/queries'
import { PROJECT, GOALS, MILESTONES, SPRINTS as MOCK_SPRINTS, TASKS, TEAM_MEMBERS } from '@/lib/mock-data'
import { CheckCircle2, Clock, Target, Users, CalendarDays, TrendingUp, AlertTriangle, Zap, ArrowRight } from 'lucide-react'
import { ProjectDocsPanel } from '@/components/project-docs-panel'
import { DecisionsPanel } from '@/components/decisions-panel'
import { getDecisions } from '@/lib/queries'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function OverviewPage() {
  // Try Supabase; fall back to mock data if env vars missing or DB unreachable
  let project    = PROJECT as any
  let members    = TEAM_MEMBERS as any[]
  let milestones = MILESTONES as any[]
  let sprints    = MOCK_SPRINTS as any[]
  let allTasks   = TASKS as any[]
  let decisions  = [] as any[]

  try {
    const dbProject = await getProject()
    const [dbMembers, dbMilestones, dbSprints, dbTasks, dbDecisions] = await Promise.all([
      getTeamMembers(),
      getMilestones(dbProject.id),
      getSprints(dbProject.id),
      getTasksByProject(dbProject.id),
      getDecisions(dbProject.id),
    ])
    project    = dbProject
    if (dbMembers.length    > 0) members    = dbMembers
    if (dbMilestones.length > 0) milestones = dbMilestones
    if (dbSprints.length    > 0) sprints    = dbSprints
    if (dbTasks.length      > 0) allTasks   = dbTasks
    decisions = dbDecisions
  } catch {
    // DB unavailable — continue with mock data above
  }

  const activeSprint = sprints.find((s: any) => s.status === 'active')
  const activeSprintHref = activeSprint
    ? `/sprint/${MOCK_SPRINTS.find(m => m.name === activeSprint.name)?.id ?? activeSprint.id}`
    : null
  const activeStats = activeSprint
    ? computeStats(allTasks.filter((t: any) => t.sprint_id === activeSprint.id))
    : { total: 0, done: 0, inProgress: 0, blocked: 0, critical: 0 }

  const totalStats = computeStats(allTasks)

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 uppercase tracking-wide whitespace-nowrap ml-4 mt-1">
            Đang khởi tạo
          </span>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <CalendarDays size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Thời gian thực hiện</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Tiến độ tổng thể</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full"
                    style={{ width: `${totalStats.total ? Math.round(totalStats.done * 100 / totalStats.total) : 0}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {totalStats.total ? Math.round(totalStats.done * 100 / totalStats.total) : 0}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <Users size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Nhân sự cốt lõi</p>
              <p className="text-sm font-semibold text-gray-900">
                {String(members.length).padStart(2, '0')} Thành viên
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Tasks hoàn thành</span>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {activeStats.done}
            <span className="text-sm font-normal text-gray-400">/{activeStats.total}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{activeSprint?.name ?? 'Sprint hiện tại'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Đang thực hiện</span>
            <Zap size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeStats.inProgress}</p>
          <p className="text-xs text-gray-500 mt-1">tasks in-progress</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Blockers</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{activeStats.blocked}</p>
          <p className="text-xs text-gray-500 mt-1">cần giải quyết</p>
        </div>

        {activeSprint && activeSprintHref ? (
          <Link href={activeSprintHref}
            className="bg-indigo-600 rounded-xl border border-indigo-500 p-4 shadow-sm hover:bg-indigo-700 transition-colors group block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-indigo-200">Sprint hiện tại</span>
              <ArrowRight size={16} className="text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-white">{activeSprint.name}</p>
            <p className="text-xs text-indigo-200 mt-1 truncate">{activeSprint.theme}</p>
          </Link>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Sprint hiện tại</span>
              <Clock size={16} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">—</p>
          </div>
        )}
      </div>

      {/* Two-column: Documents (local) + Decisions (Supabase shared) */}
      <div className="grid grid-cols-2 gap-5">
        <ProjectDocsPanel projectId={project.id} />
        <DecisionsPanel projectId={project.id} initialDecisions={decisions} />
      </div>

      {/* Goals + Milestones */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-900">Mục tiêu chính</h2>
          </div>
          <ul className="space-y-3">
            {GOALS.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700 leading-snug">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-900">Mốc quan trọng</h2>
          </div>
          <ol className="space-y-3">
            {milestones.slice(0, 5).map((ms: any, i: number) => (
              <li key={ms.id} className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  ms.is_done ? 'bg-green-500 text-white' : i === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ms.is_done ? '✓' : i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-indigo-600 font-medium">
                    {new Date(ms.target_date ?? ms.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{ms.title}</p>
                  {ms.description && <p className="text-xs text-gray-500 leading-snug">{ms.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
