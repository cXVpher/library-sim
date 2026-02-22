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
import { Search, Loader2, BookOpen, Users, Calendar, ArrowRight, Library } from 'lucide-react';

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
                <TableHead className="text-slate-300">Title</TableHead>
                <TableHead className="text-slate-300">Author</TableHead>
                <TableHead className="text-slate-300">ISBN</TableHead>
                <TableHead className="text-slate-300">Publisher</TableHead>
                <TableHead className="text-right text-slate-300">Year</TableHead>
                <TableHead className="text-center text-slate-300">Availability</TableHead>
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
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
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
                      {book.availableCopies > 0 ? (
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
                      ) : (
                        <span className="text-sm text-slate-500">Unavailable</span>
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
