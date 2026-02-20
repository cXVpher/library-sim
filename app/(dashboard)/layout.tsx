'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Library, BookOpen, Clock, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? "/admin" : "/books"} className="flex items-center gap-2 font-bold text-xl text-slate-800">
              <Library className="w-6 h-6" />
              SpringLib
            </Link>
            
            <nav className="hidden md:flex gap-1 ml-6">
              {!isAdmin && (
                <>
                  <Link 
                    href="/books" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/books' 
                        ? 'bg-slate-100 text-slate-800' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Catalog
                  </Link>
                  <Link 
                    href="/loans" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/loans' 
                        ? 'bg-slate-100 text-slate-800' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    My Loans
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link 
                    href="/admin" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/admin' 
                        ? 'bg-slate-100 text-slate-800' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              {isAdmin ? (
                <Users className="w-4 h-4 text-slate-600" />
              ) : (
                <BookOpen className="w-4 h-4 text-slate-600" />
              )}
              <span className="text-sm font-medium text-slate-700">
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
