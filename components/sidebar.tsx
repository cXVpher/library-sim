'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, BookOpen, Clock, LayoutDashboard, LogOut, Users, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role, logout } = useAuthStore();
  
  const isAdmin = role === 'ROLE_ADMIN';

  const navItems = isAdmin 
    ? [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/books', label: 'Books List', icon: BookOpen },
        { href: '/loans', label: 'Loans', icon: Clock },
      ]
    : [
        { href: '/books', label: 'Catalog', icon: BookOpen },
        { href: '/loans', label: 'My Loans', icon: Clock },
      ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link 
              href={isAdmin ? "/admin" : "/books"} 
              className="flex items-center gap-2 font-bold text-xl text-white"
              onClick={onClose}
            >
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Library className="w-5 h-5" />
              </div>
              LibrarySim
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
              {isAdmin ? (
                <Users className="w-4 h-4 text-blue-400" />
              ) : (
                <BookOpen className="w-4 h-4 text-green-400" />
              )}
              <span className="text-sm font-medium text-white">
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
