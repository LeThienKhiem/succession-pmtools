import { getProject, getTasksByProject, getTeamMembers } from '@/lib/queries'
import { TASKS, TEAM_MEMBERS } from '@/lib/mock-data'
import { BotClient } from './bot-client'

export default async function BotPage() {
  let tasks: any[]   = TASKS
  let members: any[] = TEAM_MEMBERS

  try {
    const project = await getProject()
    const [dbTasks, dbMembers] = await Promise.all([
      getTasksByProject(project.id),
      getTeamMembers(),
    ])
    if (dbTasks.length   > 0) tasks   = dbTasks
    if (dbMembers.length > 0) members = dbMembers
  } catch {}

  return <BotClient tasks={tasks} members={members} />
}
