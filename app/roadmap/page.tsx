import { SPRINTS, TASKS, TEAM_MEMBERS } from '@/lib/mock-data'
import { getTeamMembers } from '@/lib/queries'
import { RoadmapClient } from './roadmap-client'

export default async function RoadmapPage() {
  // Fetch real names from Supabase; fall back to mock if DB not seeded
  let members = TEAM_MEMBERS
  try {
    const dbMembers = await getTeamMembers()
    if (dbMembers.length > 0) members = dbMembers
  } catch {}

  return (
    <RoadmapClient
      sprints={SPRINTS}
      tasks={TASKS}
      members={members}
    />
  )
}
