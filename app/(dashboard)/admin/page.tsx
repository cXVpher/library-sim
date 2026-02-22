'use client';

import { useEffect, useState } from 'react';
import { BookService } from '@/services/book.service';
import { LoanService } from '@/services/loan.service';
import { Book, Loan } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  RotateCcw,
  LayoutDashboard,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'books' | 'loans'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    totalCopies: 1
  });

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

  const fetchLoans = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await LoanService.getAllLoansHistory();
      if (response.success) {
        const loansWithBooks = response.data.map((loan: Loan) => {
          const book = books.find(b => b.id === loan.bookId);
          return {
            ...loan,
            bookTitle: book?.title || 'Unknown Book',
            bookAuthor: book?.author || 'Unknown Author'
          };
        });
        setLoans(loansWithBooks);
      }
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else {
      fetchLoans(true);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'loans') {
      const interval = setInterval(() => {
        fetchLoans(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
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
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await BookService.deleteBook(bookId);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
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
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        totalCopies: 1
      });
      fetchBooks();
    } catch (error) {
      toast.error(editingBook ? 'Failed to update book' : 'Failed to create book');
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    try {
      const loanToApprove = loans.find(l => l.id === loanId);
      if (!loanToApprove) {
        toast.error('Loan not found');
        return;
      }

      await LoanService.approveLoan(loanId, dueDateStr);

      const otherPendingLoans = loans.filter(
        l => l.bookId === loanToApprove.bookId && l.status === 'PENDING' && l.id !== loanId
      );

      for (const otherLoan of otherPendingLoans) {
        try {
          await LoanService.rejectLoan(otherLoan.id);
        } catch (error) {
          console.error(`Failed to reject loan ${otherLoan.id}`, error);
        }
      }

      if (otherPendingLoans.length > 0) {
        toast.success(`Loan approved. ${otherPendingLoans.length} other request(s) automatically rejected.`);
      } else {
        toast.success('Loan approved');
      }
      fetchLoans();
    } catch (error) {
      toast.error('Failed to approve loan');
    }
  };

  const handleReturnLoan = async (loanId: string) => {
    try {
      await LoanService.returnLoan(loanId);
      toast.success('Book returned');
      fetchLoans();
    } catch (error) {
      toast.error('Failed to process return');
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      totalCopies: book.totalCopies
    });
    setShowAddModal(true);
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

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage your library</p>
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
                <p className="text-2xl font-bold text-white">{books.length}</p>
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
                <p className="text-2xl font-bold text-white">{books.filter(b => b.availableCopies > 0).length}</p>
                <p className="text-sm text-slate-400">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loans.filter(l => l.status === 'PENDING').length}</p>
                <p className="text-sm text-slate-400">Pending Requests</p>
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
                <p className="text-2xl font-bold text-white">{loans.filter(l => l.status === 'APPROVED').length}</p>
                <p className="text-sm text-slate-400">Currently Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'books' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Books
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'loans' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Loans
        </button>
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <>
          <div className="flex justify-between items-center gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <Button type="submit" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-white/10">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            <Button onClick={() => { setEditingBook(null); setShowAddModal(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300">Title</TableHead>
                    <TableHead className="text-slate-300">Author</TableHead>
                    <TableHead className="text-slate-300">ISBN</TableHead>
                    <TableHead className="text-slate-300">Publisher</TableHead>
                    <TableHead className="text-slate-300">Year</TableHead>
                    <TableHead className="text-slate-300">Available</TableHead>
                    <TableHead className="text-right text-slate-300">Actions</TableHead>
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
                        <TableCell className="text-slate-300">{book.publicationYear}</TableCell>
                        <TableCell>
                          <span className={book.availableCopies > 0 ? 'text-green-400' : 'text-red-400'}>
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-white/10"
                              onClick={() => openEditModal(book)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => handleDeleteBook(book.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-300">Loan ID</TableHead>
                  <TableHead className="text-slate-300">User ID</TableHead>
                  <TableHead className="text-slate-300">Book</TableHead>
                  <TableHead className="text-slate-300">Author</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Requested</TableHead>
                  <TableHead className="text-slate-300">Due Date</TableHead>
                  <TableHead className="text-center text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                      No loans found
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-mono text-xs text-slate-400">{loan.id.split('-')[0]}...</TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">{loan.userId.split('-')[0]}...</TableCell>
                      <TableCell className="font-medium text-white">{'bookTitle' in loan ? (loan as Loan & { bookTitle?: string }).bookTitle : 'Unknown Book'}</TableCell>
                      <TableCell className="text-slate-300">{'bookAuthor' in loan ? (loan as Loan & { bookAuthor?: string }).bookAuthor : 'Unknown Author'}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell className="text-slate-300">{new Date(loan.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-slate-300">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-center">
                        {loan.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApproveLoan(loan.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {loan.status === 'APPROVED' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleReturnLoan(loan.id)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Return
                          </Button>
                        )}
                        {loan.status === 'RETURNED' && (
                          <span className="text-sm text-slate-500 italic">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={() => { setShowAddModal(false); setEditingBook(null); }}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-slate-300">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn" className="text-slate-300">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher" className="text-slate-300">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publicationYear" className="text-slate-300">Year</Label>
                    <Input
                      id="publicationYear"
                      type="number"
                      value={formData.publicationYear}
                      onChange={(e) => setFormData({...formData, publicationYear: parseInt(e.target.value)})}
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCopies" className="text-slate-300">Total Copies</Label>
                    <Input
                      id="totalCopies"
                      type="number"
                      min="1"
                      value={formData.totalCopies}
                      onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingBook ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-white/10"
                    onClick={() => { setShowAddModal(false); setEditingBook(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
