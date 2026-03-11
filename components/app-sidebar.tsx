'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, BookOpen, Clock, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
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
    <Sidebar>
      {/* Header — logo + app name */}
      <SidebarHeader className="px-4 py-5 border-b border-white/10">
        <Link
          href={isAdmin ? '/admin' : '/books'}
          className="flex items-center gap-2.5 font-bold text-xl text-white hover:opacity-80 transition-opacity"
        >
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Library className="w-5 h-5" />
          </div>
          LibrarySim
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="lg"
                      className="h-11 px-4 text-sm font-medium rounded-lg text-sidebar-foreground/70 hover:text-white data-[active=true]:text-white data-[active=true]:bg-white/10 hover:bg-white/5"
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — role badge + logout */}
      <SidebarFooter className="px-4 py-4 border-t border-white/10 gap-2">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-white/10 rounded-lg">
          {isAdmin
            ? <Users className="w-4 h-4 text-blue-400 shrink-0" />
            : <BookOpen className="w-4 h-4 text-green-400 shrink-0" />}
          <span className="text-sm font-medium text-white">{isAdmin ? 'Admin' : 'Member'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
