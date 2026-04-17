export const runtime = 'nodejs'

export async function POST(req: Request) {
  let formData: FormData
  try { formData = await req.formData() }
  catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }

  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'Thiếu file' }, { status: 400 })

  const name = file.name.toLowerCase()
  const buf  = Buffer.from(await file.arrayBuffer())

  try {
    if (name.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default
      const result  = await mammoth.extractRawText({ buffer: buf })
      return Response.json({ text: result.value.trim() })
    }

    if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) {
      return Response.json({ text: buf.toString('utf-8').trim() })
    }

    if (name.endsWith('.pdf')) {
      // Basic PDF text extraction — read raw text streams
      const raw = buf.toString('latin1')
      const chunks: string[] = []
      const re = /BT[\s\S]*?ET/g
      let m: RegExpExecArray | null
      while ((m = re.exec(raw)) !== null) {
        const inner = m[0].replace(/\(([^)]*)\)\s*Tj/g, '$1 ')
                           .replace(/\(([^)]*)\)\s*TJ/g, '$1 ')
                           .replace(/[^\x20-\x7E\n]/g, '')
        chunks.push(inner)
      }
      const text = chunks.join('\n').replace(/\s{3,}/g, '\n').trim()
      if (text.length < 50) {
        return Response.json({ error: 'PDF có thể được scan (ảnh) — không thể extract text. Hãy dùng PDF chứa text thật.' }, { status: 422 })
      }
      return Response.json({ text })
    }

    return Response.json({ error: `Định dạng không hỗ trợ: ${file.name}. Dùng .docx .pdf .txt .md` }, { status: 422 })
  } catch (e: any) {
    return Response.json({ error: `Lỗi đọc file: ${e.message}` }, { status: 500 })
  }
}
