import { getProject, getTeamMembers, getTasksByProject } from '@/lib/queries'
import { TEAM_MEMBERS, TASKS } from '@/lib/mock-data'
import { TeamBoardClient } from './team-board-client'

export default async function TeamPage() {
  let members: any[] = TEAM_MEMBERS
  let tasks: any[]   = TASKS

  try {
    const project = await getProject()
    const [dbMembers, dbTasks] = await Promise.all([
      getTeamMembers(),
      getTasksByProject(project.id),
    ])
    if (dbMembers.length > 0) members = dbMembers
    if (dbTasks.length  > 0) tasks   = dbTasks
  } catch {}

  return <TeamBoardClient initialMembers={members} tasks={tasks} />
}
