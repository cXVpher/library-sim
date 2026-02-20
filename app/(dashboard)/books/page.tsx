'use client';

import { useEffect, useState } from 'react';
import { BookService } from '@/services/book.service';
import { LoanService } from '@/services/loan.service';
import { Book } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, BookOpen, Users, Calendar, ArrowRight } from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await BookService.getAllBooks();
      if (response.success) {
        setBooks(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  };

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setBorrowingId(bookId);
    try {
      await LoanService.requestLoan(bookId);
      toast.success('Borrow request submitted! Check your loans page.');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Stats
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.availableCopies > 0).length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Book Catalog</h1>
          <p className="text-slate-500">Browse and borrow books from our library</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBooks}</p>
                <p className="text-sm text-slate-500">Total Books</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableBooks}</p>
                <p className="text-sm text-slate-500">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCopies}</p>
                <p className="text-sm text-slate-500">Total Copies</p>
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
                <p className="text-2xl font-bold">{availableCopies}</p>
                <p className="text-sm text-slate-500">Available Copies</p>
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
          className="h-10"
        />
        <Button type="submit" variant="secondary">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        {searchQuery && (
          <Button 
            type="button" 
            variant="ghost"
            onClick={() => { setSearchQuery(''); fetchBooks(); }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Books Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead className="text-right">Year</TableHead>
                <TableHead className="text-center">Availability</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                    <TableCell>{book.publisher}</TableCell>
                    <TableCell className="text-right">{book.publicationYear}</TableCell>
                    <TableCell className="text-center">
                      {book.availableCopies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          All borrowed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {book.availableCopies > 0 ? (
                        <Button 
                          size="sm"
                          className="bg-slate-800 hover:bg-slate-700"
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
                      ) : (
                        <span className="text-sm text-slate-400">Unavailable</span>
                      )}
                    </TableCell>
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
