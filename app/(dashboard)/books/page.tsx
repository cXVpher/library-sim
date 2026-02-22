'use client';

import { useEffect, useState, useMemo } from 'react';
import { BookService } from '@/services/book.service';
import { LoanService } from '@/services/loan.service';
import { Book, Loan } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, BookOpen, Users, Calendar, ArrowRight, Library, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, X } from 'lucide-react';

type SortField = 'title' | 'author' | 'publicationYear' | 'availableCopies' | null;
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  
  const { isAuthenticated } = useAuthStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];

  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });

  const getLoanStatusForBook = (bookId: string): Loan | undefined => {
    return userLoans.find(loan => 
      loan.bookId === bookId && 
      (loan.status === 'PENDING' || loan.status === 'APPROVED')
    );
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return { field: null, direction: null };
    });
    setCurrentPage(1);
  };

  const sortedBooks = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return books;
    }
    return [...books].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortConfig.field) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'author':
          aVal = a.author.toLowerCase();
          bVal = b.author.toLowerCase();
          break;
        case 'publicationYear':
          aVal = a.publicationYear;
          bVal = b.publicationYear;
          break;
        case 'availableCopies':
          aVal = a.availableCopies;
          bVal = b.availableCopies;
          break;
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
      const booksResponse = await BookService.getAllBooks();
      
      if (booksResponse.success) {
        setBooks(booksResponse.data);
      }

    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLoans = async () => {
    if (!isAuthenticated) return;
    try {
      const loansResponse = await LoanService.getMyLoans();
      if (loansResponse.success) {
        setUserLoans(loansResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch user loans');
    }
  };

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    setIsLoading(true);
    try {
      const response = await BookService.searchBooks(searchQuery);
      if (response.success) {
        setBooks(response.data);
        toast.success(`Found ${response.data.length} books`);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async (bookId: string) => {
    const existingLoan = getLoanStatusForBook(bookId);
    if (existingLoan) {
      if (existingLoan.status === 'PENDING') {
        toast.warning('You are already sending borrow request to this book!');
      } else if (existingLoan.status === 'APPROVED') {
        toast.warning('You already have this book on loan!');
      }
      return;
    }

    setBorrowingId(bookId);
    try {
      await LoanService.requestLoan(bookId);
      toast.success('Borrow request submitted! Check your loans page.');
      fetchBooks();
      fetchUserLoans();
    } catch (error) {
      toast.error('Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchUserLoans();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.availableCopies > 0).length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);

  const renderSortButton = (field: SortField, label: string) => {
    const isActive = sortConfig.field === field;
    const direction = sortConfig.direction;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(field)}
        className={`h-8 px-2 flex items-center gap-1 ${isActive ? 'text-blue-400 hover:text-blue-300' : 'text-slate-300 hover:text-white'}`}
      >
        {label}
        <div className="flex flex-col ml-1">
          {isActive && direction === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : isActive && direction === 'desc' ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <div className="w-3 flex flex-col items-center">
              <ArrowUp className="w-2 h-2 opacity-30" />
              <ArrowDown className="w-2 h-2 opacity-30 -mt-1" />
            </div>
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Library className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Book Catalog</h1>
            <p className="text-slate-400">Browse and borrow books from our library</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalBooks}</p>
                <p className="text-sm text-slate-400">Total Books</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{availableBooks}</p>
                <p className="text-sm text-slate-400">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCopies}</p>
                <p className="text-sm text-slate-400">Total Copies</p>
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
                <p className="text-2xl font-bold text-white">{availableCopies}</p>
                <p className="text-sm text-slate-400">Available Copies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <form onSubmit={searchBooks} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        />
        <Button type="submit" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-white/10">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        {searchQuery && (
          <Button 
            type="button" 
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => { setSearchQuery(''); fetchBooks(); }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Books Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-300">
                  {renderSortButton('title', 'Title')}
                </TableHead>
                <TableHead className="text-slate-300">
                  {renderSortButton('author', 'Author')}
                </TableHead>
                <TableHead className="text-slate-300">ISBN</TableHead>
                <TableHead className="text-slate-300">Publisher</TableHead>
                <TableHead className="text-right text-slate-300">
                  {renderSortButton('publicationYear', 'Year')}
                </TableHead>
                <TableHead className="text-center text-slate-300">
                  {renderSortButton('availableCopies', 'Availability')}
                </TableHead>
                <TableHead className="text-center text-slate-300">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : currentBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                currentBooks.map((book) => (
                  <TableRow key={book.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{book.title}</TableCell>
                    <TableCell className="text-slate-300">{book.author}</TableCell>
                    <TableCell className="font-mono text-sm text-slate-400">{book.isbn}</TableCell>
                    <TableCell className="text-slate-300">{book.publisher}</TableCell>
                    <TableCell className="text-right text-slate-300">{book.publicationYear}</TableCell>
                    <TableCell className="text-center">
                      {book.availableCopies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          All borrowed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const loanStatus = getLoanStatusForBook(book.id);
                        
                        if (loanStatus?.status === 'PENDING') {
                          return (
                            <span className="inline-flex items-center gap-1 text-yellow-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Pending Request
                            </span>
                          );
                        }
                        
                        if (loanStatus?.status === 'APPROVED') {
                          return (
                            <span className="inline-flex items-center gap-1 text-blue-400">
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                              On Loan
                            </span>
                          );
                        }
                        
                        if (book.availableCopies > 0) {
                          return (
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleBorrow(book.id)}
                              disabled={borrowingId === book.id}
                            >
                              {borrowingId === book.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <ArrowRight className="w-4 h-4 mr-1" />
                                  Borrow
                                </>
                              )}
                            </Button>
                          );
                        }
                        
                        return (
                          <span className="text-sm text-slate-500">Unavailable</span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Show:</span>
            <div className="flex gap-1">
              {itemsPerPageOptions.map((option) => (
                <Button
                  key={option}
                  variant={itemsPerPage === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setItemsPerPage(option)}
                  className={itemsPerPage === option 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-white/20 text-white bg-white/10'}
                >
                  {option}
                </Button>
              ))}
              <Button
                variant={itemsPerPage === -1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setItemsPerPage(-1)}
                className={itemsPerPage === -1 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-white/20 text-white bg-white/10'}
              >
                All
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} books
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-white/20 text-white bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-3 text-white text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-white/20 text-white bg-white/10 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
