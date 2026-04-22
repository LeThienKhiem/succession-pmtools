export const dynamic = 'force-dynamic'

import { getProject, getMilestones, getSprints, getTasksByProject, getTeamMembers, computeStats } from '@/lib/queries'
import { PROJECT, MILESTONES, SPRINTS as MOCK_SPRINTS, TASKS, TEAM_MEMBERS, EPICS, TASK_TYPE_STYLES, STATUS_STYLES, PRIORITY_STYLES } from '@/lib/mock-data'
import { CheckCircle2, AlertTriangle, Clock, Users, Target, TrendingUp, Zap, FileBarChart, Circle } from 'lucide-react'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default async function ReportPage() {
  // Load from DB, fall back to mock if unavailable
  let project    = PROJECT as any
  let milestones = MILESTONES as any[]
  let allTasks   = TASKS as any[]
  let members    = TEAM_MEMBERS as any[]

  try {
    const dbProject = await getProject()
    const [dbMilestones, dbTasks, dbMembers] = await Promise.all([
      getMilestones(dbProject.id),
      getTasksByProject(dbProject.id),
      getTeamMembers(),
    ])
    project    = dbProject
    if (dbMilestones.length > 0) milestones = dbMilestones
    if (dbTasks.length    > 0) allTasks   = dbTasks
    if (dbMembers.length  > 0) members    = dbMembers
  } catch {}

  // Always use MOCK_SPRINTS for status/metadata (source of truth)
  const sprints      = MOCK_SPRINTS
  const activeSprint = MOCK_SPRINTS.find(s => s.status === 'active')

  const total = computeStats(allTasks)

  // Per-sprint stats — match tasks by sprint_id (mock IDs like 'sp-1')
  const sprintStats = MOCK_SPRINTS.map(s => ({
    sprint: s,
    stats: computeStats(allTasks.filter((t: any) => t.sprint_id === s.id)),
  }))

  // Per-epic stats
  const epicStats = EPICS.map(ep => {
    const tasks = allTasks.filter(t => t.epic_code === ep.code)
    return { epic: ep, stats: computeStats(tasks) }
  })

  // Per-member stats
  const memberStats = members.map(m => {
    const tasks = allTasks.filter(t => t.assignee_code === m.code)
    return { member: m, stats: computeStats(tasks), tasks }
  })

  // Task breakdown by type
  const byType = Object.keys(TASK_TYPE_STYLES).map(type => ({
    type,
    style: TASK_TYPE_STYLES[type],
    count: allTasks.filter(t => t.type === type).length,
    done:  allTasks.filter(t => t.type === type && t.status === 'done').length,
  })).filter(x => x.count > 0)

  // Task breakdown by priority
  const byPriority = (['critical','priority','normal'] as const).map(p => ({
    priority: p,
    style: PRIORITY_STYLES[p],
    count: allTasks.filter(t => t.priority === p).length,
    done:  allTasks.filter(t => t.priority === p && t.status === 'done').length,
  }))

  const overallPct = total.total ? Math.round(total.done * 100 / total.total) : 0

  const now = new Date()
  const generatedAt = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FileBarChart size={16} className="text-indigo-500" />
          </div>
          <h1 className="text-base font-bold text-slate-900">Báo cáo dự án</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium">Cập nhật lúc {generatedAt}</p>
      </div>

      {/* Project banner */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-[0_4px_24px_-4px_rgba(99,102,241,0.45)]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-1">Dự án</p>
            <h2 className="text-xl font-bold leading-tight">{project.name}</h2>
            <p className="text-indigo-200 text-sm mt-1">{fmt(project.start_date)} → {fmt(project.end_date)}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums leading-none">{overallPct}%</p>
            <p className="text-indigo-200 text-xs mt-1">Hoàn thành tổng thể</p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-indigo-200 text-xs font-medium">{members.length} thành viên</span>
          <span className="w-px h-3 bg-indigo-400/40" />
          <span className="text-indigo-200 text-xs font-medium">{sprints.length} sprints</span>
          {activeSprint && (
            <>
              <span className="w-px h-3 bg-indigo-400/40" />
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-white text-xs font-semibold">
                {activeSprint.name} đang chạy
              </span>
            </>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Tổng tasks',   value: total.total,      icon: Circle,        from: 'from-slate-50',   border: 'border-slate-100',   iconBg: 'bg-slate-100',   iconColor: 'text-slate-500',   shadow: 'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' },
          { label: 'Hoàn thành',   value: total.done,       icon: CheckCircle2,  from: 'from-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', shadow: 'shadow-[0_2px_8px_-2px_rgba(16,185,129,0.15)]' },
          { label: 'Đang làm',     value: total.inProgress, icon: Zap,           from: 'from-blue-50',    border: 'border-blue-100',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-500',    shadow: 'shadow-[0_2px_8px_-2px_rgba(59,130,246,0.15)]' },
          { label: 'Blocked',      value: total.blocked,    icon: AlertTriangle, from: 'from-rose-50',    border: 'border-rose-100',    iconBg: 'bg-rose-100',    iconColor: 'text-rose-500',    shadow: 'shadow-[0_2px_8px_-2px_rgba(244,63,94,0.15)]' },
          { label: 'Critical',     value: total.critical,   icon: Target,        from: 'from-orange-50',  border: 'border-orange-100',  iconBg: 'bg-orange-100',  iconColor: 'text-orange-500',  shadow: 'shadow-[0_2px_8px_-2px_rgba(249,115,22,0.15)]' },
        ].map(({ label, value, icon: Icon, from, border, iconBg, iconColor, shadow }) => (
          <div key={label} className={`bg-gradient-to-br ${from} to-white rounded-2xl border ${border} p-4 ${shadow} text-center`}>
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-2.5`}>
              <Icon size={16} className={iconColor} />
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{value}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Sprint progress */}
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-5 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.10)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <TrendingUp size={14} className="text-indigo-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Tiến độ theo Sprint</h2>
        </div>
        <div className="space-y-3.5">
          {sprintStats.map(({ sprint, stats }) => {
            const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0
            const statusLabel = sprint.status === 'active' ? 'Đang chạy' : sprint.status === 'completed' ? 'Xong' : 'Sắp tới'
            const statusClass = sprint.status === 'active'
              ? 'bg-indigo-100 text-indigo-600'
              : sprint.status === 'completed'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-slate-100 text-slate-400'
            const barClass = sprint.status === 'active'
              ? 'from-indigo-400 to-violet-500'
              : sprint.status === 'completed'
              ? 'from-emerald-400 to-emerald-500'
              : 'from-slate-200 to-slate-300'
            return (
              <div key={sprint.id} className="flex items-center gap-4">
                <div className="w-[72px] shrink-0">
                  <p className="text-sm font-semibold text-slate-800">{sprint.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{fmtShort(sprint.start_date)}→{fmtShort(sprint.end_date)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${statusClass}`}>{statusLabel}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${barClass} transition-all duration-500`}
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-700 w-9 text-right shrink-0 tabular-nums">{pct}%</span>
                <div className="flex items-center gap-3 text-[11px] shrink-0 w-44">
                  <span className="text-slate-400">{stats.total} tasks</span>
                  {stats.done > 0 && <span className="text-emerald-500 font-semibold">{stats.done} xong</span>}
                  {stats.inProgress > 0 && <span className="text-blue-500 font-semibold">{stats.inProgress} làm</span>}
                  {stats.blocked > 0 && <span className="text-rose-500 font-semibold">{stats.blocked} blocked</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Epic + Type breakdown side by side */}
      <div className="grid grid-cols-2 gap-5">

        {/* By epic */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Theo Epic</h2>
          <div className="space-y-3.5">
            {epicStats.map(({ epic, stats }) => {
              const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0
              return (
                <div key={epic.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: epic.color }} />
                      <span className="text-xs font-semibold text-slate-700">{epic.code} · {epic.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">{stats.done}/{stats.total}</span>
                      <span className="font-bold text-slate-600 tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: epic.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By type + priority */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Theo Loại Task</h2>
          <div className="space-y-2.5">
            {byType.map(({ type, style, count, done }) => {
              const pct = count ? Math.round(done * 100 / count) : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold w-16 text-center shrink-0"
                    style={{ backgroundColor: style.bg, color: style.text }}>
                    {style.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: style.text }} />
                  </div>
                  <span className="text-[11px] text-slate-400 w-20 text-right shrink-0 tabular-nums">{done}/{count} ({pct}%)</span>
                </div>
              )
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Theo Độ ưu tiên</h3>
            <div className="space-y-2.5">
              {byPriority.map(({ priority, style, count, done }) => {
                const pct = count ? Math.round(done * 100 / count) : 0
                return (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold w-16 shrink-0" style={{ color: style.text }}>
                      {style.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: style.text }} />
                    </div>
                    <span className="text-[11px] text-slate-400 w-20 text-right shrink-0 tabular-nums">{done}/{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Team workload */}
      <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-100 p-5 shadow-[0_2px_10px_-2px_rgba(139,92,246,0.10)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Users size={14} className="text-violet-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Workload nhân sự</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {memberStats.filter(m => m.stats.total > 0).map(({ member, stats }) => {
            const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-violet-50 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.06)]">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                  style={{ backgroundColor: member.color }}>
                  {member.code.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2 tabular-nums">{stats.done}/{stats.total}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: member.color }} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {stats.inProgress > 0 && <span className="text-[11px] text-blue-500 font-medium">{stats.inProgress} làm</span>}
                    {stats.blocked > 0 && <span className="text-[11px] text-rose-500 font-medium">{stats.blocked} blocked</span>}
                    {stats.critical > 0 && <span className="text-[11px] text-orange-500 font-medium">{stats.critical} critical</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Critical items checklist */}
      {(() => {
        const criticalTasks = allTasks.filter(t => t.priority === 'critical')
        return (
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-5 shadow-[0_2px_10px_-2px_rgba(244,63,94,0.10)]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={14} className="text-rose-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">{criticalTasks.length} Critical Items</h2>
              <span className="text-[11px] text-rose-400/80 font-medium ml-auto">Must-have cho BOD Demo Day</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {criticalTasks.map((task, i) => {
                const sprintName = MOCK_SPRINTS.find(s => s.id === task.sprint_id)?.name ?? task.sprint_id
                const statusStyle = STATUS_STYLES[task.status]
                return (
                  <div key={task.id} className="flex items-start gap-2.5 py-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white'
                    }`}>
                      {task.status === 'done'
                        ? <span className="text-[9px] text-white font-bold">✓</span>
                        : <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-indigo-500 font-semibold">{sprintName}</span>
                        <span className="text-[11px] font-semibold" style={{ color: statusStyle.text }}>{statusStyle.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Milestones */}
      <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-100 p-5 shadow-[0_2px_10px_-2px_rgba(139,92,246,0.10)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Clock size={14} className="text-violet-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Mốc quan trọng</h2>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-violet-100" />
          <div className="space-y-4">
            {milestones.map((ms, i) => (
              <div key={ms.id} className="flex gap-4 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 ${
                  ms.is_done
                    ? 'bg-emerald-500 text-white'
                    : i === 0
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {ms.is_done ? '✓' : i + 1}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{ms.title}</p>
                    {ms.is_done && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[11px] rounded-full font-semibold">Xong</span>
                    )}
                  </div>
                  <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">{fmt(ms.target_date ?? ms.date)}</p>
                  {ms.description && <p className="text-xs text-slate-400 leading-snug mt-0.5">{ms.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
