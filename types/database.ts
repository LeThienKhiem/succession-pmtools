export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked'
export type TaskType = 'spec' | 'story' | 'design' | 'dev' | 'test' | 'review' | 'doc'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type SprintStatus = 'upcoming' | 'active' | 'completed'
export type ProjectStatus = 'active' | 'completed' | 'on-hold'
export type EpicStatus = 'upcoming' | 'active' | 'completed'

export interface PmProject {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: ProjectStatus
  progress_percent: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PmTeamMember {
  id: string
  code: string
  name: string
  role: string
  color: string
  is_active: boolean
  created_at: string
}

export interface PmMilestone {
  id: string
  project_id: string
  title: string
  description: string | null
  target_date: string
  is_done: boolean
  done_at: string | null
  is_active: boolean
  created_at: string
}

export interface PmSprint {
  id: string
  project_id: string
  name: string
  theme: string | null
  start_date: string
  end_date: string
  status: SprintStatus
  progress_percent: number
  is_active: boolean
  created_at: string
}

export interface PmEpic {
  id: string
  project_id: string
  sprint_id: string | null
  code: string
  name: string
  status: EpicStatus
  color: string
  is_active: boolean
  created_at: string
}

export interface PmTask {
  id: string
  project_id: string
  sprint_id: string | null
  epic_id: string | null
  title: string
  description: string | null
  assignee_id: string | null
  day_label: string | null
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  estimated_hours: number | null
  actual_hours: number | null
  documents: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PmComment {
  id: string
  task_id: string
  author_id: string | null
  content: string
  is_active: boolean
  created_at: string
}

export interface PmBlocker {
  id: string
  task_id: string
  description: string
  raised_by: string | null
  raised_at: string
  resolved_at: string | null
  resolved_by: string | null
  is_active: boolean
}

// Joined types for UI
export interface PmTaskWithRelations extends PmTask {
  assignee?: PmTeamMember | null
  epic?: PmEpic | null
  sprint?: PmSprint | null
  comments?: PmComment[]
  blockers?: PmBlocker[]
}

export interface PmSprintWithEpics extends PmSprint {
  epics?: PmEpic[]
  tasks?: PmTask[]
}

// Supabase Database type for createClient generic
export interface Database {
  public: {
    Tables: {
      pm_projects:     { Row: PmProject;    Insert: Omit<PmProject,    'id' | 'created_at' | 'updated_at'>; Update: Partial<PmProject> }
      pm_team_members: { Row: PmTeamMember; Insert: Omit<PmTeamMember, 'id' | 'created_at'>;                Update: Partial<PmTeamMember> }
      pm_milestones:   { Row: PmMilestone;  Insert: Omit<PmMilestone,  'id' | 'created_at'>;                Update: Partial<PmMilestone> }
      pm_sprints:      { Row: PmSprint;     Insert: Omit<PmSprint,     'id' | 'created_at'>;                Update: Partial<PmSprint> }
      pm_epics:        { Row: PmEpic;       Insert: Omit<PmEpic,       'id' | 'created_at'>;                Update: Partial<PmEpic> }
      pm_tasks:        { Row: PmTask;       Insert: Omit<PmTask,       'id' | 'created_at' | 'updated_at'>; Update: Partial<PmTask> }
      pm_comments:     { Row: PmComment;    Insert: Omit<PmComment,    'id' | 'created_at'>;                Update: Partial<PmComment> }
      pm_blockers:     { Row: PmBlocker;    Insert: Omit<PmBlocker,    'id'>;                               Update: Partial<PmBlocker> }
    }
    Views: {
      pm_sprint_progress: {
        Row: { sprint_id: string; name: string; total_tasks: number; done_tasks: number; progress_percent: number }
      }
      pm_member_workload: {
        Row: { member_id: string; code: string; name: string; role: string; color: string; sprint_id: string | null; total_tasks: number; done_tasks: number; in_progress_tasks: number; blocked_tasks: number }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
