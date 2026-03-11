'use client';

import { Loan } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RotateCcw, X } from 'lucide-react';

interface LoansTableProps {
  filteredLoans: Loan[];
  isLoading: boolean;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onReturn: (id: string) => void;
  onReject: (id: string) => void;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':  return <Badge variant="warning"     className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    case 'APPROVED': return <Badge variant="info"        className="bg-blue-500/20 text-blue-400 border-blue-500/30">Borrowed</Badge>;
    case 'RETURNED': return <Badge variant="success"     className="bg-green-500/20 text-green-400 border-green-500/30">Returned</Badge>;
    case 'REJECTED': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
    default:         return <Badge>{status}</Badge>;
  }
}

export function LoansTable({ filteredLoans, isLoading, isAdmin, onApprove, onReturn, onReject }: LoansTableProps) {
  const colSpan = isAdmin ? 9 : 7;
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-300 w-12">#</TableHead>
              {isAdmin && <TableHead className="text-slate-300">User ID</TableHead>}
              <TableHead className="text-slate-300">Book</TableHead>
              <TableHead className="text-slate-300">Author</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Requested</TableHead>
              <TableHead className="text-slate-300">Due Date</TableHead>
              <TableHead className="text-slate-300">Returned</TableHead>
              {isAdmin && <TableHead className="text-center text-slate-300">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={colSpan} className="h-24 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></TableCell></TableRow>
            ) : filteredLoans.length === 0 ? (
              <TableRow><TableCell colSpan={colSpan} className="h-24 text-center text-slate-500">No loans found</TableCell></TableRow>
            ) : filteredLoans.map((loan, index) => (
              <TableRow key={loan.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="text-slate-400 text-sm">{index + 1}</TableCell>
                {isAdmin && <TableCell className="font-mono text-xs text-slate-400">{loan.userId.split('-')[0]}...</TableCell>}
                <TableCell className="font-medium text-white">{loan.bookTitle || 'Unknown Book'}</TableCell>
                <TableCell className="text-slate-300">{loan.bookAuthor || 'Unknown Author'}</TableCell>
                <TableCell><StatusBadge status={loan.status} /></TableCell>
                <TableCell className="text-slate-300">{new Date(loan.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {loan.dueDate
                    ? <span className={new Date(loan.dueDate) < new Date() ? 'text-red-400' : 'text-slate-300'}>{new Date(loan.dueDate).toLocaleDateString()}</span>
                    : '-'}
                </TableCell>
                <TableCell className="text-slate-300">{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}</TableCell>
                {isAdmin && (
                  <TableCell className="text-center">
                    {loan.status === 'PENDING' && (
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onApprove(loan.id)}>Approve</Button>
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20" onClick={() => onReject(loan.id)}>
                          <X className="w-4 h-4 mr-1" />Reject
                        </Button>
                      </div>
                    )}
                    {loan.status === 'APPROVED' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onReturn(loan.id)}>
                        <RotateCcw className="w-4 h-4 mr-1" />Return
                      </Button>
                    )}
                    {loan.status === 'RETURNED' && <span className="text-sm text-slate-500 italic">Completed</span>}
                    {loan.status === 'REJECTED' && <span className="text-sm text-slate-500 italic">Rejected</span>}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
