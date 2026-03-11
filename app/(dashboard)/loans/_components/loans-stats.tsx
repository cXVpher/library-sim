'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, CheckCircle, RotateCcw, X } from 'lucide-react';

interface LoansStatsProps {
  stats: { total: number; pending: number; borrowed: number; returned: number; rejected: number };
  isAdmin: boolean;
}

export function LoansStats({ stats, isAdmin }: LoansStatsProps) {
  return (
    <div className={`grid ${isAdmin ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Clock className="w-5 h-5 text-blue-400" /></div>
            <div><p className="text-2xl font-bold text-white">{stats.total}</p><p className="text-sm text-slate-400">Total</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg"><Calendar className="w-5 h-5 text-yellow-400" /></div>
            <div><p className="text-2xl font-bold text-white">{stats.pending}</p><p className="text-sm text-slate-400">Pending</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><CheckCircle className="w-5 h-5 text-blue-400" /></div>
            <div><p className="text-2xl font-bold text-white">{stats.borrowed}</p><p className="text-sm text-slate-400">Borrowed</p></div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg"><RotateCcw className="w-5 h-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold text-white">{stats.returned}</p><p className="text-sm text-slate-400">Returned</p></div>
          </div>
        </CardContent>
      </Card>
      {isAdmin && (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg"><X className="w-5 h-5 text-red-400" /></div>
              <div><p className="text-2xl font-bold text-white">{stats.rejected}</p><p className="text-sm text-slate-400">Rejected</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
