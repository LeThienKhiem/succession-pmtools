'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Map, Settings, FileBarChart, Bot } from 'lucide-react'
import { TEAM_MEMBERS } from '@/lib/mock-data'

const NAV = [
  { href: '/',         label: 'Tổng quan',     icon: LayoutDashboard },
  { href: '/team',     label: 'Nhân sự',        icon: Users },
  { href: '/roadmap',  label: 'Lộ trình',       icon: Map },
  { href: '/report',   label: 'Báo cáo',        icon: FileBarChart },
  { href: '/bot',      label: 'PM Bot',          icon: Bot },
  { href: '/settings', label: 'Thiết lập',      icon: Settings },
]

const PM = TEAM_MEMBERS.find(m => m.code === 'lk')!

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] bg-[#0E1117] flex flex-col h-full shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.2" fill="white" opacity="0.95"/>
            <rect x="9" y="1" width="6" height="6" rx="1.2" fill="white" opacity="0.55"/>
            <rect x="1" y="9" width="6" height="6" rx="1.2" fill="white" opacity="0.55"/>
            <rect x="9" y="9" width="6" height="6" rx="1.2" fill="white" opacity="0.25"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">PM Portal</p>
          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">SuccessionOS</p>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 mb-1.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5 my-3" />

      {/* User badge */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] ring-1 ring-white/5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ backgroundColor: PM.color }}
          >
            {PM.code.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate leading-tight">{PM.name}</p>
            <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">{PM.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
