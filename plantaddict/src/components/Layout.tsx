import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, BookOpen, Home, Heart, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';

const navItems = [
  { to: '/library', icon: BookOpen, labelKey: 'nav.library' },
  { to: '/portfolio', icon: Home, labelKey: 'nav.portfolio' },
  { to: '/wishlist', icon: Heart, labelKey: 'nav.wishlist' },
  { to: '/reminders', icon: Bell, labelKey: 'nav.reminders' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export function Layout() {
  const { t } = useTranslation();
  const { logout, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {isDemo && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-800">
          {t('auth.demoMode')}
        </div>
      )}

      <header className="sticky top-0 z-10 border-b border-leaf-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-leaf-600" />
            <div>
              <h1 className="text-lg font-bold text-leaf-800">{t('app.name')}</h1>
              <p className="hidden text-xs text-soil-500 sm:block">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-soil-600 hover:bg-soil-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 border-t border-leaf-200 bg-white md:hidden">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                  isActive ? 'text-leaf-600' : 'text-soil-500'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {t(labelKey)}
            </NavLink>
          ))}
        </div>
      </nav>

      <aside className="fixed left-0 top-20 hidden h-[calc(100vh-5rem)] w-48 border-r border-leaf-200 bg-white p-4 md:block">
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-leaf-100 text-leaf-700'
                    : 'text-soil-600 hover:bg-soil-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
