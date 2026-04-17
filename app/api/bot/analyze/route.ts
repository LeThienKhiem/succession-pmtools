import Anthropic from '@anthropic-ai/sdk'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

export interface Proposal {
  task_id:        string
  task_title:     string
  current_status: string
  new_status:     string
  note:           string
  confidence:     number
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'sk-ant-') {
    return Response.json({ error: 'ANTHROPIC_API_KEY chưa được cấu hình trong .env.local' }, { status: 500 })
  }

  // ── Parse FormData ──────────────────────────────────────────────────────
  let formData: FormData
  try { formData = await req.formData() }
  catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }

  const type      = formData.get('type') as string
  const url       = formData.get('url')  as string | null
  const file      = formData.get('file') as File   | null
  const tasks     = JSON.parse(formData.get('tasks')     as string ?? '[]')
  const brain     = formData.get('brain')     as string ?? ''
  const decisions = JSON.parse(formData.get('decisions') as string ?? '[]')

  // ── Extract text / rows ──────────────────────────────────────────────────
  let inputText = ''
  let inputLabel = ''

  if (type === 'doc-url') {
    if (!url) return Response.json({ error: 'Thiếu URL' }, { status: 400 })
    const docId = extractGoogleDocId(url)
    if (!docId) return Response.json({ error: 'URL Google Docs không hợp lệ' }, { status: 400 })
    const res = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`)
    if (!res.ok) return Response.json({ error: 'Không thể tải Google Docs — hãy chắc doc được share "Anyone with link"' }, { status: 400 })
    inputText  = await res.text()
    inputLabel = 'Google Docs document'
  }

  else if (type === 'doc-file') {
    if (!file) return Response.json({ error: 'Thiếu file' }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    if (file.name.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default
      const result  = await mammoth.extractRawText({ buffer: buf })
      inputText = result.value
    } else {
      inputText = buf.toString('utf-8')
    }
    inputLabel = `file: ${file.name}`
  }

  else if (type === 'report') {
    if (!file) return Response.json({ error: 'Thiếu file Excel' }, { status: 400 })
    const buf  = Buffer.from(await file.arrayBuffer())
    const wb   = XLSX.read(buf, { type: 'buffer' })
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, unknown>[]
    inputText  = JSON.stringify(rows, null, 2)
    inputLabel = `Excel report: ${file.name}`
  }

  else {
    return Response.json({ error: 'type không hợp lệ' }, { status: 400 })
  }

  // ── Build task summary ───────────────────────────────────────────────────
  const taskSummary = tasks.map((t: any) => ({
    id: t.id, title: t.title, status: t.status,
    epic: t.epic_code, assignee: t.assignee_code, sprint: t.sprint_id,
  }))

  // ── Call Claude with prompt caching ─────────────────────────────────────
  const client = new Anthropic({ apiKey })

  // Append shared decisions to brain
  const decisionsBlock = decisions.length > 0
    ? '\n\n## Quyết định & Định hướng dự án\n' + decisions.map((d: any) =>
        `- [${d.category === 'decision' ? 'Quyết định' : 'Định hướng'}] ${d.title}${d.content ? ': ' + d.content : ''}`
      ).join('\n')
    : ''

  const systemPrompt = `Bạn là PM Bot của dự án SuccessionOS. Nhiệm vụ: phân tích tài liệu đầu vào và đề xuất cập nhật trạng thái các task.

${brain}${decisionsBlock}

Danh sách tasks hiện tại:
${JSON.stringify(taskSummary, null, 2)}

Quy tắc:
- Chỉ đề xuất tasks thực sự có thay đổi trạng thái
- Trả về ĐÚNG task_id từ danh sách trên
- Confidence: 0.9+ nếu chắc chắn, 0.7–0.9 nếu suy luận, dưới 0.7 thì bỏ qua
- Trả về JSON thuần, không markdown, không giải thích thêm`

  const userPrompt = `Phân tích ${inputLabel} sau và đề xuất cập nhật tasks:

${inputText}

Trả về JSON array (chỉ JSON, không gì khác):
[{"task_id":"...","task_title":"...","current_status":"...","new_status":"todo|in-progress|done|blocked","note":"lý do ngắn gọn","confidence":0.95}]`

  let raw = ''
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })
    raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  } catch (e: any) {
    return Response.json({ error: `Claude error: ${e.message}` }, { status: 500 })
  }

  // ── Parse response ───────────────────────────────────────────────────────
  let proposals: Proposal[] = []
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
    proposals = JSON.parse(cleaned)
    if (!Array.isArray(proposals)) proposals = []
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) {
      try { proposals = JSON.parse(match[0]) } catch { proposals = [] }
    }
  }

  return Response.json({ proposals })
}

function extractGoogleDocId(url: string): string | null {
  const m = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}
