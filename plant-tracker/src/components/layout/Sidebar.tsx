import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Sprout,
  Heart,
  FlaskConical,
  Settings,
  Leaf,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface SidebarProps {
  profile: UserProfile | null
  onLogout: () => void
  mobile?: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/library', label: 'Bibliothèque', icon: BookOpen },
  { to: '/portfolio', label: 'Ma collection', icon: Sprout },
  { to: '/wishlist', label: 'Ma wishlist', icon: Heart },
  { to: '/fertilizer', label: 'Fertilisation', icon: FlaskConical },
  { to: '/settings', label: 'Paramètres', icon: Settings },
]

export function Sidebar({ profile, onLogout, mobile, onClose }: SidebarProps) {
  return (
    <aside className={cn(
      'flex flex-col h-full bg-white border-r border-gray-100',
      mobile ? 'w-full' : 'w-64',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
        <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-xl">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-none">PlantAddict</h1>
          <p className="text-xs text-gray-400 mt-0.5">Votre jardin intérieur</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-green-50 text-green-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
              {profile?.displayName?.[0]?.toUpperCase() ?? 'P'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.displayName ?? 'Plant Addict'}</p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
