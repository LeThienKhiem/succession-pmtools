// lib/layermap.ts
// Maps real TASKS / EPICS data from mock-data.ts into the LayerMap 3D matrix.
// SCREENS = SuccessionOS product epics (X axis)
// LAYERS  = task type / discipline (Y axis)
// Status derived from real task.status field.

import { TASKS, EPICS } from './mock-data'
import type { TaskType, TaskStatus } from './mock-data'

// ─── Types ───────────────────────────────────────────────────────────────────

export type LayerStatus = 'done' | 'wip' | 'todo' | 'blocked' | 'missing'

export interface LayerTask {
  id: string
  screenIndex: number  // 0 … SCREENS.length-1
  layerIndex: number   // 0 … LAYERS.length-1
  label: string
  status: LayerStatus
  assignee: string
  sprint: string
  note: string
  epicCode: string
}

// ─── Axes ────────────────────────────────────────────────────────────────────

export const SCREENS = [
  { code: 'E01', label: 'Nền tảng\n& Auth',       color: '#4F46E5' },
  { code: 'E02', label: 'Dashboard\n& Nhân Tài',  color: '#0EA5E9' },
  { code: 'E03', label: 'HRM360\n& Kế Thừa',      color: '#10B981' },
  { code: 'E04', label: 'IDP &\nPhê duyệt',       color: '#F59E0B' },
  { code: 'E05', label: 'UI\nIntegration',         color: '#8B5CF6' },
  { code: 'E06', label: 'AI &\nBáo cáo',          color: '#EC4899' },
  { code: 'E08', label: 'UAT &\nStaging',          color: '#F43F5E' },
]

export const LAYERS = [
  { id: 'spec',   label: 'BA Spec',   color: '#818CF8' },
  { id: 'design', label: 'Design',    color: '#C084FC' },
  { id: 'dev',    label: 'Dev',       color: '#FB923C' },
  { id: 'test',   label: 'QA / Test', color: '#FACC15' },
  { id: 'doc',    label: 'Doc',       color: '#38BDF8' },
  { id: 'review', label: 'Review',    color: '#94A3B8' },
]

// ─── Mapping helpers ──────────────────────────────────────────────────────────

const SCREEN_INDEX = Object.fromEntries(SCREENS.map((s, i) => [s.code, i]))

function typeToLayerIndex(t: TaskType): number {
  switch (t) {
    case 'spec':   return 0
    case 'story':  return 0
    case 'design': return 1
    case 'dev':    return 2
    case 'test':   return 3
    case 'doc':    return 4
    case 'review': return 5
    default:       return 5
  }
}

function statusToLayer(s: TaskStatus): LayerStatus {
  switch (s) {
    case 'done':        return 'done'
    case 'in-progress': return 'wip'
    case 'blocked':     return 'blocked'
    case 'outline':     return 'missing'
    default:            return 'todo'
  }
}

const ASSIGNEE: Record<string, string> = {
  ba1: 'Tiến', ba2: 'Ngân', ds: 'Đăng', dj: 'Hương',
  tl: 'Lê Duy', dev: 'Dev', lk: 'Khiêm',
}

const SPRINT_LABEL: Record<string, string> = {
  'sp-1': 'Sprint 1', 'sp-2': 'Sprint 2', 'sp-3': 'Sprint 3',
  'sp-4': 'Sprint 4', 'sp-5': 'Sprint 5',
}

// ─── Derived tasks from real data ─────────────────────────────────────────────

export const LAYER_TASKS: LayerTask[] = TASKS
  .filter(t => SCREEN_INDEX[t.epic_code] !== undefined)
  .map(t => ({
    id: t.id,
    screenIndex: SCREEN_INDEX[t.epic_code],
    layerIndex: typeToLayerIndex(t.type),
    label: t.title,
    status: statusToLayer(t.status),
    assignee: ASSIGNEE[t.assignee_code] ?? t.assignee_code,
    sprint: SPRINT_LABEL[t.sprint_id] ?? t.sprint_id,
    note: t.description ? t.description.slice(0, 100) + (t.description.length > 100 ? '…' : '') : '',
    epicCode: t.epic_code,
  }))

// ─── Summary helpers ──────────────────────────────────────────────────────────

export interface ScreenSummary {
  screenIndex: number
  label: string
  color: string
  total: number
  done: number
  wip: number
  blocked: number
  missing: number
  pct: number
  verdict: 'ready' | 'warn' | 'danger'
}

export function getScreenSummaries(): ScreenSummary[] {
  return SCREENS.map((sc, i) => {
    const tasks = LAYER_TASKS.filter(t => t.screenIndex === i)
    const done    = tasks.filter(t => t.status === 'done').length
    const wip     = tasks.filter(t => t.status === 'wip').length
    const blocked = tasks.filter(t => t.status === 'blocked').length
    const missing = tasks.filter(t => t.status === 'missing').length
    const total   = tasks.length
    const pct     = total ? Math.round(done * 100 / total) : 0
    const verdict = blocked > 0 ? 'danger' : missing > 0 ? 'warn' : pct >= 80 ? 'ready' : 'warn'
    return { screenIndex: i, label: sc.label.replace('\n', ' '), color: sc.color, total, done, wip, blocked, missing, pct, verdict }
  })
}
