// src/app/(dashboard)/loans/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { LoanService } from '@/services/loan.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Loan } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Clock, CheckCircle, RotateCcw, Calendar } from 'lucide-react';

export default function LoansPage() {
  const { role } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'PENDING' | 'APPROVED' | 'RETURNED'>('all');

  const isAdmin = role === 'ROLE_ADMIN';

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = await LoanService.getAllLoansHistory();
      } else {
        response = await LoanService.getMyLoans();
      }
      if (response.success) {
        setLoans(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [isAdmin]);

  const handleApprove = async (loanId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    try {
      await LoanService.approveLoan(loanId, dueDateStr);
      toast.success('Loan approved');
      fetchLoans();
    } catch (error) {
      toast.error('Failed to approve loan');
    }
  };

  const handleReturn = async (loanId: string) => {
    try {
      await LoanService.returnLoan(loanId);
      toast.success('Book returned');
      fetchLoans();
    } catch (error) {
      toast.error('Failed to process return');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED': 
        return <Badge variant="info">Borrowed</Badge>;
      case 'RETURNED': 
        return <Badge variant="success">Returned</Badge>;
      case 'REJECTED': 
        return <Badge variant="destructive">Rejected</Badge>;
      default: 
        return <Badge>{status}</Badge>;
    }
  };

  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === activeTab);

  // Stats
  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    borrowed: loans.filter(l => l.status === 'APPROVED').length,
    returned: loans.filter(l => l.status === 'RETURNED').length,
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Loans</h1>
          <p className="text-slate-500">View and manage your book loans</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.borrowed}</p>
                <p className="text-sm text-slate-500">Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.returned}</p>
                <p className="text-sm text-slate-500">Returned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(['all', 'PENDING', 'APPROVED', 'RETURNED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'all' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loans Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>User ID</TableHead>}
                <TableHead>Book ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Returned</TableHead>
                {isAdmin && <TableHead className="text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center text-slate-500">
                    No loans found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    {isAdmin && (
                      <TableCell className="font-mono text-xs">
                        {loan.userId.split('-')[0]}...
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs">
                      {loan.bookId.split('-')[0]}...
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>{new Date(loan.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {loan.dueDate ? (
                        <span className={new Date(loan.dueDate) < new Date() ? 'text-red-600' : ''}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {loan.returnDate 
                        ? new Date(loan.returnDate).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-center">
                        {loan.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApprove(loan.id)}
                          >
                            Approve
                          </Button>
                        )}
                        {loan.status === 'APPROVED' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleReturn(loan.id)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Return
                          </Button>
                        )}
                        {loan.status === 'RETURNED' && (
                          <span className="text-sm text-slate-400 italic">Completed</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
