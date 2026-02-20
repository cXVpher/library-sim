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
  RotateCcw
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

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const response = await LoanService.getAllLoansHistory();
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
    if (activeTab === 'books') {
      fetchBooks();
    } else {
      fetchLoans();
    }
  }, [activeTab]);

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
      await LoanService.approveLoan(loanId, dueDateStr);
      toast.success('Loan approved');
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your library</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'books' 
              ? 'bg-slate-800 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Books
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'loans' 
              ? 'bg-slate-800 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
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
                className="h-10"
              />
              <Button type="submit" variant="secondary">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            <Button onClick={() => { setEditingBook(null); setShowAddModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell>{book.publicationYear}</TableCell>
                        <TableCell>
                          <span className={book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}>
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditModal(book)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Book ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
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
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono text-xs">{loan.id.split('-')[0]}...</TableCell>
                      <TableCell className="font-mono text-xs">{loan.userId.split('-')[0]}...</TableCell>
                      <TableCell className="font-mono text-xs">{loan.bookId.split('-')[0]}...</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>{new Date(loan.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '-'}</TableCell>
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
                          <span className="text-sm text-slate-400 italic">Completed</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publicationYear">Year</Label>
                    <Input
                      id="publicationYear"
                      type="number"
                      value={formData.publicationYear}
                      onChange={(e) => setFormData({...formData, publicationYear: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCopies">Total Copies</Label>
                    <Input
                      id="totalCopies"
                      type="number"
                      min="1"
                      value={formData.totalCopies}
                      onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingBook ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
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
