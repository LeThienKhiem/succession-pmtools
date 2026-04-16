'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { SPRINTS } from '@/lib/mock-data'

const STATIC_BREADCRUMBS: Record<string, { parent: string; parentHref?: string; current: string }> = {
  '/':         { parent: 'Dự án', current: 'Dự án Kế nhiệm (Succession Planning)' },
  '/team':     { parent: 'Dự án', current: 'Nhân sự dự án' },
  '/roadmap':  { parent: 'Dự án', current: 'Lộ trình' },
  '/settings': { parent: 'Dự án', current: 'Thiết lập' },
  '/report':   { parent: 'Dự án', current: 'Báo cáo dự án' },
}

export function Header() {
  const pathname = usePathname()

  const sprintMatch = pathname.match(/^\/sprint\/(.+)$/)
  let bc: { parent: string; parentHref?: string; current: string }

  if (sprintMatch) {
    const sprint = SPRINTS.find(s => s.id === sprintMatch[1])
    bc = { parent: 'Lộ trình', parentHref: '/roadmap', current: sprint ? `${sprint.name} — ${sprint.theme}` : 'Sprint Board' }
  } else {
    bc = STATIC_BREADCRUMBS[pathname] ?? { parent: 'Dự án', current: pathname }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center">
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href={bc.parentHref ?? '/'} className="text-gray-500 hover:text-gray-700 shrink-0">
          {bc.parent}
        </Link>
        <span className="text-gray-300">›</span>
        <span className="font-medium text-gray-800 truncate">{bc.current}</span>
      </nav>
    </header>
  )
}
