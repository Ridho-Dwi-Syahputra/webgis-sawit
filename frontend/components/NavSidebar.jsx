'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Info,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  TreePalm,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard Peta', icon: LayoutDashboard },
  { href: '/tentang', label: 'Tentang Sistem', icon: Info },
  { href: '/tim', label: 'Tim Kami', icon: Users },
];

export default function NavSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-[2000] flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a2332] text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <PanelLeftOpen size={20} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[2500] bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-[3000] flex h-full flex-col bg-[#1a2332] text-white
          transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
            <TreePalm size={20} />
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <h1 className="truncate text-sm font-bold leading-tight">WebGIS Sawit</h1>
              <p className="truncate text-[10px] text-gray-400">Kelompok 8</p>
            </div>
          )}

          {/* Close button (mobile only) */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-colors duration-150
                      ${isActive
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }
                    `}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      size={20}
                      className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white'}`}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t border-white/10 p-3 md:block">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Tutup Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
