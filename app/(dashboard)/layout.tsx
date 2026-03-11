'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Library, LogOut, Users, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, role, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/login');
  }, [mounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex w-full">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          {/* Navbar */}
          <header className="bg-white/5 border-b border-white/10 backdrop-blur-md sticky top-0 z-10">
            <div className="px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Shadcn sidebar trigger */}
                <SidebarTrigger className="text-slate-400 hover:text-white hover:bg-white/10" />

                {/* Logo + name — plain display, not a button */}
                <div className="flex items-center gap-2 font-bold text-xl text-white">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <Library className="w-5 h-5" />
                  </div>
                  LibrarySim
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  {isAdmin
                    ? <Users className="w-4 h-4 text-blue-400" />
                    : <BookOpen className="w-4 h-4 text-green-400" />}
                  <span className="text-sm font-medium text-white">{isAdmin ? 'Admin' : 'Member'}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
