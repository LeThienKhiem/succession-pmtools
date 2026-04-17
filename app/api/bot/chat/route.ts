import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'sk-ant-') {
    return Response.json({ error: 'ANTHROPIC_API_KEY chưa được cấu hình' }, { status: 500 })
  }

  let body: any
  try { body = await req.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const messages:    ChatMessage[] = body.messages    ?? []
  const tasks:       any[]         = body.tasks       ?? []
  const sprints:     any[]         = body.sprints     ?? []
  const brain:       string        = body.brain       ?? ''
  const decisions:   any[]         = body.decisions   ?? []
  const currentDate: string        = body.currentDate ?? new Date().toISOString().slice(0, 10)

  if (!messages.length) {
    return Response.json({ error: 'Chưa có tin nhắn' }, { status: 400 })
  }

  // ── Build project context ─────────────────────────────────────────────────
  const taskSummary = tasks.map((t: any) => ({
    id: t.id, title: t.title, status: t.status,
    epic: t.epic_code, assignee: t.assignee_code,
    sprint: t.sprint_id, priority: t.priority,
    type: t.type,
  }))

  const sprintBlock = sprints.length > 0
    ? '\n\n## Sprint Timeline\nNgày hiện tại: ' + currentDate + '\n' +
      sprints.map((s: any) => {
        const daysLeft = s.end_date
          ? Math.ceil((new Date(s.end_date).getTime() - new Date(currentDate).getTime()) / 86400000)
          : null
        const sprintTasks = tasks.filter((t: any) => t.sprint_id === s.id)
        const done  = sprintTasks.filter((t: any) => t.status === 'done').length
        const inProg = sprintTasks.filter((t: any) => t.status === 'in-progress').length
        const blocked = sprintTasks.filter((t: any) => t.status === 'blocked').length
        const total = sprintTasks.length
        const pct   = total ? Math.round(done * 100 / total) : 0
        if (s.status === 'active') {
          return `- **${s.name}** (${s.start_date} → ${s.end_date}) ← ĐANG CHẠY\n  còn ${daysLeft ?? '?'} ngày | done: ${done}/${total} (${pct}%) | in-progress: ${inProg} | blocked: ${blocked}`
        }
        return `- ${s.name} (${s.start_date} → ${s.end_date}) [${s.status}] — ${done}/${total} done`
      }).join('\n')
    : ''

  const decisionsBlock = decisions.length > 0
    ? '\n\n## Quyết định & Định hướng\n' + decisions.map((d: any) =>
        `- [${d.category === 'decision' ? 'Quyết định' : 'Định hướng'}] ${d.title}${d.content ? ': ' + d.content : ''}`
      ).join('\n')
    : ''

  const systemPrompt = `Bạn là PM Bot của dự án SuccessionOS — trợ lý quản lý dự án thông minh. Trả lời bằng tiếng Việt, súc tích và hữu ích.

${brain}${decisionsBlock}${sprintBlock}

## Toàn bộ Tasks
${JSON.stringify(taskSummary, null, 2)}

Hướng dẫn:
- Trả lời trực tiếp, không rườm rà
- Khi liệt kê tasks: dùng dấu đầu dòng, nhóm theo logic
- Khi phân tích tiến độ: đưa ra nhận xét cụ thể và đề xuất nếu cần
- Không thêm markdown heading (##) trong câu trả lời ngắn
- Nếu không biết chắc: nói rõ là suy luận từ dữ liệu hiện có`

  // ── Call Claude ───────────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey })

  let reply = ''
  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })
    reply = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  } catch (e: any) {
    // Fallback to sonnet if haiku not available
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      })
      reply = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    } catch (e2: any) {
      return Response.json({ error: `Claude error: ${e2.message}` }, { status: 500 })
    }
  }

  return Response.json({ message: reply })
}
