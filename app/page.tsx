'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Library, BookOpen, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'ROLE_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/books');
      }
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
              <Library className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LibrarySim</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Your Digital Library
            <span className="block text-slate-400">Management System</span>
          </h1>
          <p className="text-xl text-slate-300">
            Borrow books, manage your loans, and explore our vast collection. 
            Experience a modern way to manage your library activities.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                Start Reading
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mt-24 max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="p-6">
              <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Browse Catalog</h3>
              <p className="text-slate-400">
                Explore our extensive collection of books. Search by title, author, or ISBN to find what you need.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="p-6">
              <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy Borrowing</h3>
              <p className="text-slate-400">
                Request books with just a click. Track your loans and manage returns effortlessly.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">
            © 2026 Spring Library. Built with Next.js & Spring Boot.
          </p>
        </div>
      </footer>
    </div>
  );
}
