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
import { Loader2, Clock, CheckCircle, RotateCcw, Calendar, Library, ArrowRight } from 'lucide-react';

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
        return <Badge variant="warning" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'APPROVED': 
        return <Badge variant="info" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Borrowed</Badge>;
      case 'RETURNED': 
        return <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30">Returned</Badge>;
      case 'REJECTED': 
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
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
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Library className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Loans</h1>
            <p className="text-slate-400">View and manage your book loans</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-sm text-slate-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.borrowed}</p>
                <p className="text-sm text-slate-400">Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <RotateCcw className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.returned}</p>
                <p className="text-sm text-slate-400">Returned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(['all', 'PENDING', 'APPROVED', 'RETURNED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loans Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {isAdmin && <TableHead className="text-slate-300">User ID</TableHead>}
                <TableHead className="text-slate-300">Book ID</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Requested</TableHead>
                <TableHead className="text-slate-300">Due Date</TableHead>
                <TableHead className="text-slate-300">Returned</TableHead>
                {isAdmin && <TableHead className="text-center text-slate-300">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
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
                  <TableRow key={loan.id} className="border-white/5 hover:bg-white/5">
                    {isAdmin && (
                      <TableCell className="font-mono text-xs text-slate-400">
                        {loan.userId.split('-')[0]}...
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs text-slate-400">
                      {loan.bookId.split('-')[0]}...
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell className="text-slate-300">{new Date(loan.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {loan.dueDate ? (
                        <span className={new Date(loan.dueDate) < new Date() ? 'text-red-400' : 'text-slate-300'}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-slate-300">
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
                          <span className="text-sm text-slate-500 italic">Completed</span>
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
