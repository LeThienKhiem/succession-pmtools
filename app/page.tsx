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
  } catch {}

  const activeSprint     = sprints.find((s: any) => s.status === 'active')
  const activeSprintHref = activeSprint
    ? `/sprint/${MOCK_SPRINTS.find(m => m.name === activeSprint.name)?.id ?? activeSprint.id}`
    : null
  const activeStats = activeSprint
    ? computeStats(allTasks.filter((t: any) => t.sprint_id === activeSprint.id))
    : { total: 0, done: 0, inProgress: 0, blocked: 0, critical: 0 }
  const totalStats = computeStats(allTasks)
  const pct = totalStats.total ? Math.round(totalStats.done * 100 / totalStats.total) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Project Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Dự án</p>
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/60 uppercase tracking-wide whitespace-nowrap ml-4 mt-1">
            Đang khởi tạo
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <CalendarDays size={17} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">Thời gian</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(project.start_date)} – {formatDate(project.end_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp size={17} className="text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-400 font-medium mb-1.5">Tiến độ tổng thể</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-800 shrink-0 tabular-nums">{pct}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Users size={17} className="text-violet-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-0.5">Nhân sự cốt lõi</p>
              <p className="text-sm font-semibold text-slate-800">
                {String(members.length).padStart(2, '0')} thành viên
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Hoàn thành</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none mb-1">
            {activeStats.done}
            <span className="text-base font-medium text-slate-300 ml-1">/{activeStats.total}</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">{activeSprint?.name ?? 'Sprint hiện tại'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">In Progress</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Zap size={14} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none mb-1">{activeStats.inProgress}</p>
          <p className="text-[11px] text-slate-400 font-medium">đang thực hiện</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Blockers</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={14} className="text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold tabular-nums leading-none mb-1"
            style={{ color: activeStats.blocked > 0 ? '#EF4444' : '#1E293B' }}>
            {activeStats.blocked}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">cần giải quyết</p>
        </div>

        {activeSprint && activeSprintHref ? (
          <Link href={activeSprintHref}
            className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-4 shadow-[0_4px_16px_-4px_rgba(99,102,241,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(99,102,241,0.6)] hover:scale-[1.01] transition-all duration-200 group block">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wide">Sprint hiện tại</span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <p className="text-xl font-bold text-white leading-tight mb-1">{activeSprint.name}</p>
            <p className="text-[11px] text-indigo-200 font-medium truncate">{activeSprint.theme}</p>
          </Link>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Sprint hiện tại</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Clock size={14} className="text-indigo-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-300 leading-none mb-1">—</p>
            <p className="text-[11px] text-slate-400 font-medium">chưa có sprint</p>
          </div>
        )}
      </div>

      {/* Documents + Decisions */}
      <div className="grid grid-cols-2 gap-5">
        <ProjectDocsPanel projectId={project.id} />
        <DecisionsPanel projectId={project.id} initialDecisions={decisions} />
      </div>

      {/* Goals + Milestones */}
      <div className="grid grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Target size={14} className="text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Mục tiêu chính</h2>
          </div>
          <ul className="space-y-3">
            {GOALS.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                <span className="text-sm text-slate-600 leading-snug">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <Clock size={14} className="text-violet-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Mốc quan trọng</h2>
          </div>
          <ol className="space-y-3.5">
            {milestones.slice(0, 5).map((ms: any, i: number) => (
              <li key={ms.id} className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                  ms.is_done
                    ? 'bg-emerald-500 text-white'
                    : i === 0
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {ms.is_done ? '✓' : i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-indigo-500 mb-0.5">
                    {new Date(ms.target_date ?? ms.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{ms.title}</p>
                  {ms.description && <p className="text-xs text-slate-400 leading-snug mt-0.5">{ms.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
