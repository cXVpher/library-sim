'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Book, Loan } from '@/types';
import { BookOpen, Users, Clock } from 'lucide-react';

interface AdminStatsProps {
  books: Book[];
  loans: Loan[];
}

export function AdminStats({ books, loans }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><BookOpen className="w-5 h-5 text-blue-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{books.length}</p>
              <p className="text-sm text-slate-400">Total Books</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg"><BookOpen className="w-5 h-5 text-green-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{books.filter(b => b.availableCopies > 0).length}</p>
              <p className="text-sm text-slate-400">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg"><Clock className="w-5 h-5 text-yellow-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{loans.filter(l => l.status === 'PENDING').length}</p>
              <p className="text-sm text-slate-400">Pending Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Users className="w-5 h-5 text-purple-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{loans.filter(l => l.status === 'APPROVED').length}</p>
              <p className="text-sm text-slate-400">Currently Borrowed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
