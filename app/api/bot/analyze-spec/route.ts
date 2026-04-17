import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

export interface SpecResult {
  description: string
  key_points:  string[]
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'sk-ant-') {
    return Response.json({ error: 'ANTHROPIC_API_KEY chưa được cấu hình' }, { status: 500 })
  }

  let formData: FormData
  try { formData = await req.formData() }
  catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }

  const type      = formData.get('type') as string
  const url       = formData.get('url')  as string | null
  const file      = formData.get('file') as File   | null
  const taskJson  = formData.get('task') as string ?? '{}'
  const brain     = formData.get('brain') as string ?? ''
  const task      = JSON.parse(taskJson)

  // ── Extract text ─────────────────────────────────────────────────────────────
  let specText = ''

  if (type === 'doc-url') {
    if (!url) return Response.json({ error: 'Thiếu URL' }, { status: 400 })
    const m = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
    if (!m) return Response.json({ error: 'URL Google Docs không hợp lệ' }, { status: 400 })
    const res = await fetch(`https://docs.google.com/document/d/${m[1]}/export?format=txt`)
    if (!res.ok) return Response.json({ error: 'Không thể tải Google Docs — hãy share "Anyone with link"' }, { status: 400 })
    specText = await res.text()
  }

  else if (type === 'doc-file') {
    if (!file) return Response.json({ error: 'Thiếu file' }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    if (file.name.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default
      const result  = await mammoth.extractRawText({ buffer: buf })
      specText = result.value
    } else {
      specText = buf.toString('utf-8')
    }
  }

  else {
    return Response.json({ error: 'type không hợp lệ' }, { status: 400 })
  }

  if (!specText.trim()) {
    return Response.json({ error: 'Tài liệu trống hoặc không đọc được' }, { status: 400 })
  }

  // ── Call Claude ──────────────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey })

  const systemPrompt = `Bạn là PM Bot của dự án SuccessionOS. Nhiệm vụ: phân tích tài liệu spec/story cho một task cụ thể và trích xuất nội dung mô tả.

${brain}

Task đang phân tích:
- ID: ${task.id}
- Tiêu đề: ${task.title}
- Epic: ${task.epic_code ?? ''}
- Type: ${task.type ?? ''}

Quy tắc:
- Viết description bằng tiếng Việt, súc tích, tập trung vào nội dung cốt lõi
- key_points: tối đa 5 điểm quan trọng nhất, mỗi điểm 1 câu ngắn
- Trả về JSON thuần, không markdown, không giải thích thêm`

  const userPrompt = `Tài liệu spec cho task "${task.title}":

${specText.slice(0, 12000)}

Trả về JSON (chỉ JSON, không gì khác):
{"description":"mô tả chi tiết task dựa trên spec (200-400 ký tự)","key_points":["điểm 1","điểm 2","điểm 3"]}`

  let raw = ''
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })
    raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  } catch (e: any) {
    return Response.json({ error: `Claude error: ${e.message}` }, { status: 500 })
  }

  // ── Parse ─────────────────────────────────────────────────────────────────────
  let result: SpecResult = { description: '', key_points: [] }
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
    result = JSON.parse(cleaned)
  } catch {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) {
      try { result = JSON.parse(m[0]) } catch {}
    }
  }

  if (!result.description) {
    return Response.json({ error: 'Bot không trích xuất được nội dung từ tài liệu này' }, { status: 422 })
  }

  return Response.json(result)
}
