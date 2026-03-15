// src/components/layout/DashboardLayout.tsx
//
// Uses your existing components:
// - LogoutConfirmDialog  from '../ui/ConfirmDialog'
// - ThemeToggle          from '../ui/ThemeToggle'
// - useAuth              from '../../context/AuthContext'

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotificationScheduler } from '../../hooks/useNotificationScheduler';
import { LogoutConfirmDialog } from '../ui/ConfirmDialog';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

// ─────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────
const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/medications',
    label: 'Medication',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    path: '/activity-log',
    label: 'Activity Log',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    path: '/schedule',
    label: 'Schedule',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/alerts',
    label: 'Alerts',
    badge: 3,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    path: '/caregivers',
    label: 'Family',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ─── Page info — title + subtitle per route ───────────────────────────────────
const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':        { title: 'Family Caregiver',    subtitle: 'Coordinate care for your loved ones' },
  '/medications':      { title: 'Medications',          subtitle: 'Manage medication schedules' },
  '/activity-log':     { title: 'Activity Log',         subtitle: 'Full history of care activities' },
  '/schedule':         { title: 'Schedule',             subtitle: 'Plan and track upcoming events' },
  '/alerts':           { title: 'Alerts',               subtitle: 'Stay on top of important notices' },
  '/caregivers':       { title: 'Care Team',            subtitle: 'Manage your family care team' },
  '/settings':         { title: 'Settings',             subtitle: 'Manage your account & preferences' },
  '/patients':         { title: 'Patients',             subtitle: 'View and manage your patients' },
  '/reports':          { title: 'Reports',              subtitle: 'Insights and adherence data' },
};

function getPageInfo(pathname: string) {
  // Match longest prefix first
  const match = Object.keys(PAGE_INFO)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return PAGE_INFO[match] ?? { title: 'CareSync', subtitle: 'Your care coordination platform' };
}

// ─────────────────────────────────────────
// LOGO ICON — teal square matching Figma
// ─────────────────────────────────────────
function LogoIcon({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={cn(
      'bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0',
      size === 'lg' ? 'w-14 h-14' : 'w-8 h-8'
    )}>
      <svg
        className={cn('text-white', size === 'lg' ? 'w-8 h-8' : 'w-4 h-4')}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// SIDEBAR CONTENT
// Shared by both desktop sidebar + mobile drawer
// ─────────────────────────────────────────
function SidebarContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full">

      {/* Brand logo + name */}
      <div className="px-5 py-4 border-b border-primary-100 dark:border-primary-900/40">
        <Link
          to="/dashboard"
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-3"
        >
          <LogoIcon size="sm" />
          <span className="text-base font-bold text-gray-900 dark:text-gray-50">
            CareSync
          </span>
        </Link>
      </div>

      {/* Page context block — same design as original, dynamic per page */}
      <div className="px-5 py-5 border-b border-primary-100 dark:border-gray-700">
        <div className="flex flex-col items-center text-center gap-3">
          <LogoIcon size="lg" />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-tight">
              {getPageInfo(location.pathname).title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              {getPageInfo(location.pathname).subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              'nav-item',
              isActive(item.path) && 'nav-item-active'
            )}
          >
            <span className={cn(
              'flex-shrink-0',
              isActive(item.path)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500'
            )}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* HIPAA badge — bottom of sidebar */}
      <div className="px-4 py-4 border-t border-primary-100 dark:border-primary-900/40">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-primary-100 dark:border-primary-900/40">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-50">
              HIPAA Compliant
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your data is secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN LAYOUT — exported
// ─────────────────────────────────────────
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogout, setShowLogout]     = useState(false);

  // Schedule medication reminder notifications app-wide
  useNotificationScheduler();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false); // close drawer on mobile after clicking
  };

  const handleLogoutConfirm = () => {
    setShowLogout(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

      {/* ══════════════════════════════
          DESKTOP SIDEBAR
          Always visible on lg and above
          Fixed on the left side
      ══════════════════════════════ */}
      <aside className="
        hidden lg:flex flex-col
        fixed top-0 left-0 h-full w-64
        bg-primary-50 dark:bg-gray-950
        border-r border-primary-100 dark:border-gray-700
        z-30
      ">
        <SidebarContent onNavigate={handleNavigate} />
      </aside>

      {/* ══════════════════════════════
          MOBILE DRAWER
          Slides in on small screens
      ══════════════════════════════ */}

      {/* Dark backdrop — tap to close */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 z-50 flex flex-col lg:hidden',
        'bg-primary-50 dark:bg-gray-950',
        'border-r border-primary-100 dark:border-gray-700',
        'transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent onNavigate={handleNavigate} />
      </aside>

      {/* ══════════════════════════════
          MAIN CONTENT AREA
          lg:ml-64 offsets for sidebar on desktop
      ══════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">

        {/* TOP NAVBAR */}
        <header className="
          sticky top-0 z-20
          bg-white dark:bg-gray-900
          border-b border-gray-200 dark:border-gray-700
          h-16 flex items-center px-4 gap-3
        ">
          {/* Hamburger — mobile/tablet only */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand — only shows on mobile (desktop sees sidebar) */}
          <div className="flex items-center gap-2 lg:hidden">
            <LogoIcon size="sm" />
            <span className="font-bold text-sm text-gray-900 dark:text-gray-50">
              CareSync
            </span>
          </div>

          {/* Push right side actions to the right */}
          <div className="flex-1" />

          {/* Right side: theme toggle, bell, user, logout */}
          <div className="flex items-center gap-1">

            {/* Theme toggle — uses your existing ThemeToggle component */}
            <ThemeToggle />

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Red dot for alerts */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Vertical divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* User avatar + name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full
                              flex items-center justify-center">
                <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                </span>
              </div>
              {/* Name — hidden on very small screens */}
              <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-gray-50
                               max-w-[8rem] truncate">
                {user?.fullName ?? 'User'}
              </span>
            </div>

            {/* Logout — opens confirmation dialog */}
            <button
              onClick={() => setShowLogout(true)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {/* p-4 on mobile, p-6 on md+ */}
        <main className="flex-1 p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>

      {/* LOGOUT CONFIRMATION — uses your existing LogoutConfirmDialog */}
      <LogoutConfirmDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}