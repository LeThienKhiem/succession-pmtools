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
  description?:   string   // new: extracted from BA doc
}

export interface TimelineRisk {
  sprint:   string
  risk:     string
  severity: 'low' | 'medium' | 'high'
}

export interface AnalyzeResult {
  proposals:       Proposal[]
  suggestions:     string[]
  timeline_risks:  TimelineRisk[]
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

  const type        = formData.get('type') as string
  const url         = formData.get('url')  as string | null
  const file        = formData.get('file') as File   | null
  const tasks       = JSON.parse(formData.get('tasks')     as string ?? '[]')
  const brain       = formData.get('brain')     as string ?? ''
  const decisions   = JSON.parse(formData.get('decisions') as string ?? '[]')
  const sprints     = JSON.parse(formData.get('sprints')   as string ?? '[]')
  const currentDate = formData.get('currentDate') as string ?? new Date().toISOString().slice(0, 10)

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

  else if (type === 'project-doc') {
    // Doc already extracted client-side, content passed directly
    const docText = formData.get('doc_text') as string ?? ''
    const docName = formData.get('doc_name') as string ?? 'tài liệu'
    if (!docText.trim()) return Response.json({ error: 'Nội dung tài liệu trống' }, { status: 400 })
    inputText  = docText.slice(0, 40000)
    inputLabel = `tài liệu dự án: ${docName}`
  }

  else {
    return Response.json({ error: 'type không hợp lệ' }, { status: 400 })
  }

  // ── Build task summary ───────────────────────────────────────────────────
  const taskSummary = tasks.map((t: any) => ({
    id: t.id, title: t.title, status: t.status,
    epic: t.epic_code, assignee: t.assignee_code, sprint: t.sprint_id,
  }))

  // ── Build sprint / timeline context ──────────────────────────────────────
  const sprintBlock = sprints.length > 0
    ? '\n\n## Timeline & Sprints\nNgày hiện tại: ' + currentDate + '\n' +
      sprints.map((s: any) => {
        const daysLeft = s.end_date
          ? Math.ceil((new Date(s.end_date).getTime() - new Date(currentDate).getTime()) / 86400000)
          : null
        const sprintTasks = tasks.filter((t: any) => t.sprint_id === s.id)
        const done  = sprintTasks.filter((t: any) => t.status === 'done').length
        const total = sprintTasks.length
        const pct   = total ? Math.round(done * 100 / total) : 0
        const suffix = s.status === 'active'
          ? ` ← ĐANG CHẠY | còn ${daysLeft !== null ? daysLeft : '?'} ngày | ${done}/${total} tasks done (${pct}%)`
          : ` [${s.status}]`
        return `- ${s.name} (${s.start_date} → ${s.end_date})${suffix}`
      }).join('\n')
    : ''

  // ── Call Claude with prompt caching ─────────────────────────────────────
  const client = new Anthropic({ apiKey })

  // Append shared decisions to brain
  const decisionsBlock = decisions.length > 0
    ? '\n\n## Quyết định & Định hướng dự án\n' + decisions.map((d: any) =>
        `- [${d.category === 'decision' ? 'Quyết định' : 'Định hướng'}] ${d.title}${d.content ? ': ' + d.content : ''}`
      ).join('\n')
    : ''

  const isReport = type === 'report'
  const isDoc    = type === 'doc-url' || type === 'doc-file'

  const systemPrompt = `Bạn là PM Bot của dự án SuccessionOS. Nhiệm vụ: phân tích tài liệu đầu vào, đề xuất cập nhật trạng thái task, điền mô tả, đưa ra gợi ý và cảnh báo timeline.

${brain}${decisionsBlock}${sprintBlock}

Danh sách tasks hiện tại (id, title, status hiện tại):
${JSON.stringify(taskSummary, null, 2)}

Quy tắc chung:
- Trả về ĐÚNG task_id từ danh sách trên
- Confidence: 0.9+ nếu chắc chắn, 0.7–0.9 nếu suy luận, dưới 0.7 thì bỏ qua
- Trả về JSON thuần, không markdown, không giải thích thêm
${isDoc ? `
Quy tắc với BA document:
- Đề xuất task khi: (1) có thay đổi status, HOẶC (2) tìm thấy nội dung mô tả đủ để điền description
- Nếu chỉ có mô tả (không đổi status): new_status = current_status
- description: trích xuất nội dung cụ thể từ tài liệu cho task đó, viết tiếng Việt, 100–350 ký tự, súc tích
- Nếu tài liệu không đề cập đến task: bỏ qua (đừng bịa description)` : ''}
${isReport ? `
Quy tắc với daily report:
- Phân tích tiến độ dev, đề xuất cập nhật status
- Đưa gợi ý hành động cụ thể
- timeline_risks: cảnh báo nếu sprint hiện tại có nguy cơ trễ` : ''}`

  const userPrompt = `Phân tích ${inputLabel} sau:

${inputText}

Trả về JSON object (chỉ JSON, không gì khác):
{
  "proposals": [{"task_id":"...","task_title":"...","current_status":"...","new_status":"todo|in-progress|done|blocked","note":"lý do ngắn gọn","confidence":0.95,"description":"mô tả trích từ tài liệu (bỏ qua nếu không có)"}],
  "suggestions": ["gợi ý hành động 1"],
  "timeline_risks": [{"sprint":"Sprint X","risk":"mô tả rủi ro","severity":"low|medium|high"}]
}`

  let raw = ''
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })
    raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  } catch (e: any) {
    return Response.json({ error: `Claude error: ${e.message}` }, { status: 500 })
  }

  // ── Parse response ───────────────────────────────────────────────────────
  let result: AnalyzeResult = { proposals: [], suggestions: [], timeline_risks: [] }
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      // Backwards compat: if Claude returned bare array
      result.proposals = parsed
    } else {
      result.proposals      = Array.isArray(parsed.proposals)      ? parsed.proposals      : []
      result.suggestions    = Array.isArray(parsed.suggestions)    ? parsed.suggestions    : []
      result.timeline_risks = Array.isArray(parsed.timeline_risks) ? parsed.timeline_risks : []
    }
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        result.proposals      = Array.isArray(parsed.proposals)      ? parsed.proposals      : []
        result.suggestions    = Array.isArray(parsed.suggestions)    ? parsed.suggestions    : []
        result.timeline_risks = Array.isArray(parsed.timeline_risks) ? parsed.timeline_risks : []
      } catch {}
    } else {
      const arrMatch = raw.match(/\[[\s\S]*\]/)
      if (arrMatch) {
        try { result.proposals = JSON.parse(arrMatch[0]) } catch {}
      }
    }
  }

  return Response.json(result)
}

function extractGoogleDocId(url: string): string | null {
  const m = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}
