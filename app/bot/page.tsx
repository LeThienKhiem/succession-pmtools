import { getProject, getTasksByProject, getTeamMembers, getSprints } from '@/lib/queries'
import { TASKS, TEAM_MEMBERS, PROJECT, SPRINTS as MOCK_SPRINTS } from '@/lib/mock-data'
import { BotClient } from './bot-client'

export default async function BotPage() {
  let tasks: any[]   = TASKS
  let members: any[] = TEAM_MEMBERS
  let sprints: any[] = MOCK_SPRINTS
  let projectId      = PROJECT.id

  try {
    const project = await getProject()
    const [dbTasks, dbMembers, dbSprints] = await Promise.all([
      getTasksByProject(project.id),
      getTeamMembers(),
      getSprints(project.id),
    ])
    projectId = project.id
    if (dbTasks.length   > 0) tasks   = dbTasks
    if (dbMembers.length > 0) members = dbMembers
    if (dbSprints.length > 0) sprints = dbSprints
  } catch {}

  return <BotClient tasks={tasks} members={members} sprints={sprints} projectId={projectId} />
}
