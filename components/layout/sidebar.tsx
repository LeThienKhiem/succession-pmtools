'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Map, Settings, FileBarChart } from 'lucide-react'
import { TEAM_MEMBERS } from '@/lib/mock-data'

const NAV = [
  { href: '/',        label: 'Tổng quan',       icon: LayoutDashboard },
  { href: '/team',    label: 'Nhân sự dự án',   icon: Users },
  { href: '/roadmap', label: 'Lộ trình',         icon: Map },
  { href: '/report',  label: 'Báo cáo',          icon: FileBarChart },
  { href: '/settings',label: 'Thiết lập',        icon: Settings },
]

const PM = TEAM_MEMBERS.find(m => m.code === 'lk')!

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
            <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
            <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
            <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <span className="font-semibold text-gray-900 text-sm">PM Portal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User badge */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: PM.color }}
          >
            {PM.code.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{PM.name}</p>
            <p className="text-xs text-gray-500 truncate">{PM.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
