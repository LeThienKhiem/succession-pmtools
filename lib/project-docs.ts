export interface ProjectDoc {
  id:          string
  name:        string
  uploaded_at: string   // ISO string
  size:        number   // bytes
  content:     string   // extracted plain text
}

const LS_KEY = 'pm-project-docs'

export function loadDocs(): ProjectDoc[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveDocs(docs: ProjectDoc[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(docs)) } catch {}
}

export function addDoc(doc: ProjectDoc) {
  const docs = loadDocs()
  saveDocs([...docs.filter(d => d.id !== doc.id), doc])
}

export function removeDoc(id: string) {
  saveDocs(loadDocs().filter(d => d.id !== id))
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
