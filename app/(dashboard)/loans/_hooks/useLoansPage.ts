'use client';

import { useEffect, useState } from 'react';
import { LoanService } from '../_services/loan.service';
import { BookService } from '../_services/book.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Loan, Book } from '@/types';
import { toast } from 'sonner';

export type LoanTabFilter = 'all' | 'PENDING' | 'APPROVED' | 'RETURNED' | 'REJECTED';

export function useLoansPage() {
  const { role } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LoanTabFilter>('all');

  const isAdmin = role === 'ROLE_ADMIN';

  const fetchBooks = async () => {
    try {
      const res = await BookService.getAllBooks();
      if (res.success) setBooks(res.data);
    } catch (err) { console.error('Failed to fetch books', err); }
  };

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const res = isAdmin ? await LoanService.getAllLoansHistory() : await LoanService.getMyLoans();
      if (res.success) {
        const enriched = res.data.map((loan: Loan) => {
          const book = books.find(b => b.id === loan.bookId);
          return { ...loan, bookTitle: book?.title || 'Unknown Book', bookAuthor: book?.author || 'Unknown Author' };
        });
        setLoans(enriched);
      }
    } catch { toast.error('Failed to fetch loans'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);
  useEffect(() => { if (books.length > 0) fetchLoans(); }, [isAdmin, books]);

  const handleApprove = async (loanId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    try {
      await LoanService.approveLoan(loanId, dueDate.toISOString().split('T')[0]);
      toast.success('Loan approved');
      fetchLoans();
    } catch { toast.error('Failed to approve loan'); }
  };

  const handleReturn = async (loanId: string) => {
    try { await LoanService.returnLoan(loanId); toast.success('Book returned'); fetchLoans(); }
    catch { toast.error('Failed to process return'); }
  };

  const handleReject = async (loanId: string) => {
    try { await LoanService.rejectLoan(loanId); toast.success('Loan rejected'); fetchLoans(); }
    catch { toast.error('Failed to reject loan'); }
  };

  const filteredLoans = activeTab === 'all' ? loans : loans.filter(l => l.status === activeTab);

  const stats = {
    total:    loans.length,
    pending:  loans.filter(l => l.status === 'PENDING').length,
    borrowed: loans.filter(l => l.status === 'APPROVED').length,
    returned: loans.filter(l => l.status === 'RETURNED').length,
    rejected: loans.filter(l => l.status === 'REJECTED').length,
  };

  return { isAdmin, isLoading, activeTab, setActiveTab, filteredLoans, stats, handleApprove, handleReturn, handleReject };
}
