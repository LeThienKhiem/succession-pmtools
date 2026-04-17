'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SPRINTS } from '@/lib/mock-data'
import { ChevronRight } from 'lucide-react'

const STATIC_BREADCRUMBS: Record<string, { parent: string; parentHref?: string; current: string }> = {
  '/':         { parent: 'Dự án', current: 'Tổng quan' },
  '/team':     { parent: 'Dự án', current: 'Nhân sự dự án' },
  '/roadmap':  { parent: 'Dự án', current: 'Lộ trình' },
  '/settings': { parent: 'Dự án', current: 'Thiết lập' },
  '/report':   { parent: 'Dự án', current: 'Báo cáo dự án' },
  '/bot':      { parent: 'Dự án', current: 'PM Bot' },
}

export function Header() {
  const pathname = usePathname()

  const sprintMatch = pathname.match(/^\/sprint\/(.+)$/)
  let bc: { parent: string; parentHref?: string; current: string }

  if (sprintMatch) {
    const sprint = SPRINTS.find(s => s.id === sprintMatch[1])
    bc = {
      parent: 'Lộ trình',
      parentHref: '/roadmap',
      current: sprint ? `${sprint.name} — ${sprint.theme}` : 'Sprint Board',
    }
  } else {
    bc = STATIC_BREADCRUMBS[pathname] ?? { parent: 'Dự án', current: pathname }
  }

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center sticky top-0 z-10">
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href={bc.parentHref ?? '/'}
          className="text-slate-400 hover:text-slate-600 transition-colors font-medium shrink-0"
        >
          {bc.parent}
        </Link>
        <ChevronRight size={13} className="text-slate-300 shrink-0" />
        <span className="font-semibold text-slate-700 truncate">{bc.current}</span>
      </nav>
    </header>
  )
}
