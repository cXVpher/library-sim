'use client';

import { useEffect, useState, useMemo } from 'react';
import { BookService } from '../_services/book.service';
import { LoanService } from '../_services/loan.service';
import { Book, Loan } from '@/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export type SortField = 'title' | 'author' | 'publicationYear' | 'availableCopies' | null;
export type SortDirection = 'asc' | 'desc' | null;
export interface SortConfig { field: SortField; direction: SortDirection; }

export function useBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });

  const { isAuthenticated, role } = useAuthStore();
  const isAdmin = role === 'ROLE_ADMIN';
  const itemsPerPageOptions = [10, 25, 50, 100];

  const getLoanStatusForBook = (bookId: string): Loan | undefined =>
    userLoans.find(loan => loan.bookId === bookId && (loan.status === 'PENDING' || loan.status === 'APPROVED'));

  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field !== field) return { field, direction: 'asc' };
      if (prev.direction === 'asc') return { field, direction: 'desc' };
      return { field: null, direction: null };
    });
    setCurrentPage(1);
  };

  const sortedBooks = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) return books;
    return [...books].sort((a, b) => {
      let aVal: string | number = '', bVal: string | number = '';
      switch (sortConfig.field) {
        case 'title':           aVal = a.title.toLowerCase();           bVal = b.title.toLowerCase();           break;
        case 'author':          aVal = a.author.toLowerCase();          bVal = b.author.toLowerCase();          break;
        case 'publicationYear': aVal = a.publicationYear;               bVal = b.publicationYear;               break;
        case 'availableCopies': aVal = a.availableCopies;               bVal = b.availableCopies;               break;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [books, sortConfig]);

  const totalItems = sortedBooks.length;
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
  const currentBooks = sortedBooks.slice(startIndex, endIndex);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await BookService.getAllBooks();
      if (res.success) setBooks(res.data);
    } catch { toast.error('Failed to fetch books'); }
    finally { setIsLoading(false); }
  };

  const fetchUserLoans = async () => {
    if (!isAuthenticated || isAdmin) return;
    try {
      const res = await LoanService.getMyLoans();
      if (res.success) setUserLoans(res.data);
    } catch { console.error('Failed to fetch user loans'); }
  };

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!searchQuery.trim()) { fetchBooks(); return; }
    setIsLoading(true);
    try {
      const res = await BookService.searchBooks(searchQuery);
      if (res.success) { setBooks(res.data); toast.success(`Found ${res.data.length} books`); }
    } catch { toast.error('Search failed'); }
    finally { setIsLoading(false); }
  };

  const handleBorrow = async (bookId: string) => {
    const existing = getLoanStatusForBook(bookId);
    if (existing) {
      if (existing.status === 'PENDING') toast.warning('You are already sending borrow request to this book!');
      else if (existing.status === 'APPROVED') toast.warning('You already have this book on loan!');
      return;
    }
    setBorrowingId(bookId);
    try {
      await LoanService.requestLoan(bookId);
      toast.success('Borrow request submitted! Check your loans page.');
      fetchBooks(); fetchUserLoans();
    } catch { toast.error('Failed to borrow book'); }
    finally { setBorrowingId(null); }
  };

  useEffect(() => { fetchBooks(); fetchUserLoans(); }, []);
  useEffect(() => { setCurrentPage(1); }, [itemsPerPage]);

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.availableCopies > 0).length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);

  return {
    searchQuery, setSearchQuery,
    isLoading, borrowingId, isAdmin,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    itemsPerPageOptions, sortConfig,
    currentBooks, totalItems, totalPages, startIndex, endIndex,
    totalBooks, availableBooks, totalCopies, availableCopies,
    fetchBooks, searchBooks, handleBorrow, handleSort, getLoanStatusForBook,
  };
}
