import { getProject, getMilestones, getSprints, getTasksByProject, getTeamMembers, computeStats } from '@/lib/queries'
import { EPICS, CRITICAL_ITEMS, TASK_TYPE_STYLES, STATUS_STYLES, PRIORITY_STYLES } from '@/lib/mock-data'
import { CheckCircle2, AlertTriangle, Clock, Users, Target, TrendingUp, Zap, FileBarChart, Circle } from 'lucide-react'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default async function ReportPage() {
  const project    = await getProject()
  const milestones = await getMilestones(project.id)
  const sprints    = await getSprints(project.id)
  const allTasks   = await getTasksByProject(project.id)
  const members    = await getTeamMembers()

  const total    = computeStats(allTasks)
  const activeSprint = sprints.find(s => s.status === 'active')

  // Per-sprint stats
  const sprintStats = sprints.map(s => ({
    sprint: s,
    stats: computeStats(allTasks.filter(t => t.sprint_id === s.id)),
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
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart size={20} className="text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">Báo cáo dự án</h1>
        </div>
        <p className="text-xs text-gray-400">Cập nhật lúc {generatedAt}</p>
      </div>

      {/* Project banner */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{project.name}</h2>
            <p className="text-indigo-200 text-sm">{fmt(project.start_date)} → {fmt(project.end_date)}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{overallPct}%</p>
            <p className="text-indigo-200 text-xs mt-0.5">Hoàn thành tổng thể</p>
          </div>
        </div>
        <div className="h-2 bg-indigo-500 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="text-indigo-200">{members.length} thành viên</span>
          <span className="text-indigo-200">{sprints.length} sprints</span>
          {activeSprint && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-white text-xs font-medium">
              {activeSprint.name} đang chạy
            </span>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Tổng tasks',   value: total.total,      icon: Circle,        color: 'text-gray-600',  bg: 'bg-gray-50' },
          { label: 'Hoàn thành',   value: total.done,       icon: CheckCircle2,  color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Đang làm',     value: total.inProgress, icon: Zap,           color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Blocked',      value: total.blocked,    icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50' },
          { label: 'Critical',     value: total.critical,   icon: Target,        color: 'text-orange-600',bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Sprint progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Tiến độ theo Sprint</h2>
        </div>
        <div className="space-y-3">
          {sprintStats.map(({ sprint, stats }) => {
            const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0
            const statusLabel = sprint.status === 'active' ? 'Đang chạy' : sprint.status === 'completed' ? 'Xong' : 'Sắp tới'
            const statusClass = sprint.status === 'active' ? 'bg-indigo-100 text-indigo-700' : sprint.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            return (
              <div key={sprint.id} className="flex items-center gap-4">
                <div className="w-20 shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{sprint.name}</p>
                  <p className="text-xs text-gray-400">{fmtShort(sprint.start_date)}→{fmtShort(sprint.end_date)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusClass}`}>{statusLabel}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${sprint.status === 'active' ? 'bg-indigo-500' : sprint.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-9 text-right shrink-0">{pct}%</span>
                <div className="flex items-center gap-3 text-xs shrink-0 w-48">
                  <span className="text-gray-400">{stats.total} tasks</span>
                  {stats.done > 0 && <span className="text-green-600 font-medium">{stats.done} xong</span>}
                  {stats.inProgress > 0 && <span className="text-blue-600 font-medium">{stats.inProgress} làm</span>}
                  {stats.blocked > 0 && <span className="text-red-600 font-medium">{stats.blocked} blocked</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Epic + Type breakdown side by side */}
      <div className="grid grid-cols-2 gap-5">

        {/* By epic */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Theo Epic</h2>
          <div className="space-y-3">
            {epicStats.map(({ epic, stats }) => {
              const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0
              return (
                <div key={epic.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: epic.color }} />
                      <span className="text-xs font-medium text-gray-700">{epic.code} · {epic.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{stats.done}/{stats.total}</span>
                      <span className="font-semibold text-gray-700">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: epic.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Theo Loại Task</h2>
          <div className="space-y-2">
            {byType.map(({ type, style, count, done }) => {
              const pct = count ? Math.round(done * 100 / count) : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium w-16 text-center shrink-0"
                    style={{ backgroundColor: style.bg, color: style.text }}>
                    {style.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: style.text }} />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right shrink-0">{done}/{count} ({pct}%)</span>
                </div>
              )
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-600 mb-3">Theo Độ ưu tiên</h3>
            <div className="space-y-2">
              {byPriority.map(({ priority, style, count, done }) => {
                const pct = count ? Math.round(done * 100 / count) : 0
                return (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-16 shrink-0 capitalize" style={{ color: style.text }}>
                      {style.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: style.text }} />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right shrink-0">{done}/{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Team workload */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Workload nhân sự</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {memberStats.filter(m => m.stats.total > 0).map(({ member, stats }) => {
            const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: member.color }}>
                  {member.code.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                    <span className="text-xs text-gray-500 shrink-0 ml-2">{stats.done}/{stats.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: member.color }} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {stats.inProgress > 0 && <span className="text-xs text-blue-500">{stats.inProgress} làm</span>}
                    {stats.blocked > 0 && <span className="text-xs text-red-500">{stats.blocked} blocked</span>}
                    {stats.critical > 0 && <span className="text-xs text-orange-500">{stats.critical} critical</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Critical items checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold text-gray-900">17 Critical Items</h2>
          <span className="text-xs text-gray-400 ml-auto">Must-have cho BOD Demo Day</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {CRITICAL_ITEMS.map(item => (
            <div key={item.n} className="flex items-start gap-2.5 py-1">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-gray-400">{item.n}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">{item.item}</p>
                <span className="text-xs text-indigo-500 font-medium">{item.sprint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Mốc quan trọng</h2>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
          <div className="space-y-4">
            {milestones.map((ms, i) => (
              <div key={ms.id} className="flex gap-4 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                  ms.is_done ? 'bg-green-500 text-white' : i === 0 ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {ms.is_done ? '✓' : i + 1}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{ms.title}</p>
                    {ms.is_done && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Xong</span>}
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{fmt(ms.target_date)}</p>
                  {ms.description && <p className="text-xs text-gray-500 mt-0.5">{ms.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
