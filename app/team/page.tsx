import { getProject, getTeamMembers, getTasksByProject } from '@/lib/queries'
import { TeamBoardClient } from './team-board-client'

export default async function TeamPage() {
  const project = await getProject()
  const [members, tasks] = await Promise.all([
    getTeamMembers(),
    getTasksByProject(project.id),
  ])
  return <TeamBoardClient initialMembers={members} tasks={tasks} />
}
