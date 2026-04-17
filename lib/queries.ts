import { supabase } from './supabase'
import type { Task, TeamMember } from './mock-data'
import type { PmProject, PmMilestone, PmSprint, PmEpic } from '@/types/database'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapTask(row: any): Task {
  return {
    id:               row.id,
    sprint_id:        row.sprint_id,
    epic_id:          row.epic_id,
    epic_code:        row.epic?.code ?? '',
    title:            row.title,
    description:      row.description ?? undefined,
    assignee_id:      row.assignee_id,
    assignee_code:    row.assignee?.code ?? '',
    day_label:        row.day_label ?? '',
    type:             row.type,
    status:           row.status,
    priority:         row.priority,
    estimated_hours:  row.estimated_hours ?? undefined,
    documents:        row.documents ?? undefined,
    sort_order:       row.sort_order ?? undefined,
  }
}

// ─── Project ─────────────────────────────────────────────────────────────────

export async function getProject(): Promise<PmProject> {
  const { data, error } = await supabase
    .from('pm_projects')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  if (error) throw error
  return data as PmProject
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function getMilestones(projectId: string): Promise<PmMilestone[]> {
  const { data, error } = await supabase
    .from('pm_milestones')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('target_date', { ascending: true })
  if (error) throw error
  return (data ?? []) as PmMilestone[]
}

// ─── Sprints ──────────────────────────────────────────────────────────────────

export async function getSprints(projectId: string): Promise<PmSprint[]> {
  const { data, error } = await supabase
    .from('pm_sprints')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('start_date', { ascending: true })
  if (error) throw error
  return (data ?? []) as PmSprint[]
}

export async function getSprint(sprintId: string): Promise<PmSprint> {
  const { data, error } = await supabase
    .from('pm_sprints')
    .select('*')
    .eq('id', sprintId)
    .single()
  if (error) throw error
  return data as PmSprint
}

// ─── Epics ────────────────────────────────────────────────────────────────────

export async function getEpics(projectId: string): Promise<PmEpic[]> {
  const { data, error } = await supabase
    .from('pm_epics')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('code', { ascending: true })
  if (error) throw error
  return (data ?? []) as PmEpic[]
}

export async function getEpicsBySprint(sprintId: string): Promise<PmEpic[]> {
  const { data, error } = await supabase
    .from('pm_epics')
    .select('*')
    .eq('sprint_id', sprintId)
    .eq('is_active', true)
  if (error) throw error
  return (data ?? []) as PmEpic[]
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('pm_team_members')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as TeamMember[]
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

const TASK_SELECT = `
  *,
  assignee:pm_team_members(id, code, name, color, role),
  epic:pm_epics(id, code, name, color)
`

export async function getTasksBySprint(sprintId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('pm_tasks')
    .select(TASK_SELECT)
    .eq('sprint_id', sprintId)
    .eq('is_active', true)
    .order('day_label', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapTask)
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('pm_tasks')
    .select(TASK_SELECT)
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('sprint_id', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapTask)
}

// Sprint stats helper (computed client-side from tasks)
export function computeStats(tasks: Task[]) {
  return {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    blocked:    tasks.filter(t => t.status === 'blocked').length,
    critical:   tasks.filter(t => t.priority === 'critical').length,
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function updateTask(id: string, patch: Partial<Task>) {
  // Mock IDs (e.g. "s1-03") are not valid UUIDs — skip DB, localStorage handles persistence
  if (!UUID_RE.test(id)) return

  // Map UI fields back to DB columns
  const dbPatch: Record<string, unknown> = {}
  if (patch.title           !== undefined) dbPatch.title           = patch.title
  if (patch.description     !== undefined) dbPatch.description     = patch.description ?? null
  if (patch.status          !== undefined) dbPatch.status          = patch.status
  if (patch.type            !== undefined) dbPatch.type            = patch.type
  if (patch.priority        !== undefined) dbPatch.priority        = patch.priority
  if (patch.estimated_hours !== undefined) dbPatch.estimated_hours = patch.estimated_hours ?? null
  if (patch.documents       !== undefined) dbPatch.documents       = patch.documents ?? null
  if (patch.assignee_id     !== undefined) dbPatch.assignee_id     = patch.assignee_id ?? null
  if (patch.day_label       !== undefined) dbPatch.day_label       = patch.day_label
  if (patch.sort_order      !== undefined) dbPatch.sort_order      = patch.sort_order

  if (Object.keys(dbPatch).length === 0) return
  const { error } = await supabase.from('pm_tasks').update(dbPatch).eq('id', id)
  if (error) console.error('updateTask error:', error.message)
}

export async function updateTeamMember(id: string, patch: { name?: string; role?: string }) {
  if (!UUID_RE.test(id)) return
  const { error } = await supabase.from('pm_team_members').update(patch as Record<string, unknown>).eq('id', id)
  if (error) console.error('updateTeamMember error:', error.message)
}

export async function addTeamMember(m: Omit<TeamMember, 'id'>): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('pm_team_members')
    .insert({ code: m.code, name: m.name, role: m.role, color: m.color, is_active: true })
    .select()
    .single()
  if (error) { console.error('addTeamMember error:', error.message); return null }
  return data as TeamMember
}

export async function deleteTeamMember(id: string) {
  if (!UUID_RE.test(id)) return
  const { error } = await supabase.from('pm_team_members').update({ is_active: false }).eq('id', id)
  if (error) console.error('deleteTeamMember error:', error.message)
}

// ─── Decisions & Direction ────────────────────────────────────────────────────

export interface Decision {
  id:          string
  project_id:  string
  category:    'decision' | 'direction'
  title:       string
  content:     string
  author_name: string
  created_at:  string
  updated_at:  string
}

export async function getDecisions(projectId: string): Promise<Decision[]> {
  const { data, error } = await supabase
    .from('pm_decisions')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Decision[]
}

export async function addDecision(d: Omit<Decision, 'id' | 'created_at' | 'updated_at'>): Promise<Decision> {
  const { data, error } = await supabase
    .from('pm_decisions')
    .insert({ ...d, is_active: true })
    .select()
    .single()
  if (error) throw error
  return data as Decision
}

export async function updateDecision(id: string, patch: Partial<Pick<Decision, 'title' | 'content' | 'category'>>) {
  const { error } = await supabase.from('pm_decisions').update(patch).eq('id', id)
  if (error) console.error('updateDecision error:', error.message)
}

export async function deleteDecision(id: string) {
  const { error } = await supabase.from('pm_decisions').update({ is_active: false }).eq('id', id)
  if (error) console.error('deleteDecision error:', error.message)
}
