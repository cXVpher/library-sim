'use client';

import { useEffect, useState } from 'react';
import { BookService } from '../_services/book.service';
import { LoanService } from '../_services/loan.service';
import { Book, Loan } from '@/types';
import { toast } from 'sonner';

export type BookFormData = {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
};

const defaultFormData: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publicationYear: new Date().getFullYear(),
  totalCopies: 1,
};

export function useAdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<BookFormData>(defaultFormData);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await BookService.getAllBooks();
      if (response.success) setBooks(response.data);
    } catch {
      toast.error('Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoans = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await LoanService.getAllLoansHistory();
      if (response.success) {
        const loansWithBooks = response.data.map((loan: Loan) => {
          const book = books.find(b => b.id === loan.bookId);
          return { ...loan, bookTitle: book?.title || 'Unknown Book', bookAuthor: book?.author || 'Unknown Author' };
        });
        setLoans(loansWithBooks);
      }
    } catch {
      toast.error('Failed to fetch loans');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchLoans();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { fetchBooks(); return; }
    setIsLoading(true);
    try {
      const response = await BookService.searchBooks(searchQuery);
      if (response.success) setBooks(response.data);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await BookService.deleteBook(bookToDelete.id);
      toast.success('Book deleted successfully');
      fetchBooks();
      setDeleteModalOpen(false);
      setBookToDelete(null);
    } catch {
      toast.error('Failed to delete book');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await BookService.updateBook(editingBook.id, formData);
        toast.success('Book updated successfully');
      } else {
        await BookService.createBook(formData);
        toast.success('Book created successfully');
      }
      setShowAddModal(false);
      setEditingBook(null);
      setFormData(defaultFormData);
      fetchBooks();
    } catch {
      toast.error(editingBook ? 'Failed to update book' : 'Failed to create book');
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    try {
      const loanToApprove = loans.find(l => l.id === loanId);
      if (!loanToApprove) { toast.error('Loan not found'); return; }
      await LoanService.approveLoan(loanId, dueDateStr);
      const otherPending = loans.filter(l => l.bookId === loanToApprove.bookId && l.status === 'PENDING' && l.id !== loanId);
      for (const other of otherPending) {
        try { await LoanService.rejectLoan(other.id); } catch (err) { console.error(err); }
      }
      toast.success(otherPending.length > 0 ? `Loan approved. ${otherPending.length} other request(s) automatically rejected.` : 'Loan approved');
      fetchLoans();
    } catch {
      toast.error('Failed to approve loan');
    }
  };

  const handleReturnLoan = async (loanId: string) => {
    try {
      await LoanService.returnLoan(loanId);
      toast.success('Book returned');
      fetchLoans();
    } catch {
      toast.error('Failed to process return');
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author, isbn: book.isbn, publisher: book.publisher, publicationYear: book.publicationYear, totalCopies: book.totalCopies });
    setShowAddModal(true);
  };

  return {
    books, loans,
    searchQuery, setSearchQuery,
    isLoading,
    showAddModal, setShowAddModal,
    editingBook, setEditingBook,
    deleteModalOpen, setDeleteModalOpen,
    bookToDelete, setBookToDelete,
    isDeleting,
    formData, setFormData,
    handleSearch, handleDeleteBook, handleSubmitBook,
    handleApproveLoan, handleReturnLoan, openEditModal,
  };
}
