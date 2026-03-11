'use client';

import { useAdminDashboard } from './_hooks/useAdminDashboard';
import { AdminStats } from './_components/admin-stats';
import { AdminBooksTable } from './_components/admin-books-table';
import { AddEditBookModal } from './_components/add-edit-book-modal';
import { DeleteConfirmModal } from './_components/delete-confirm-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, LayoutDashboard, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const {
    books, loans,
    searchQuery, setSearchQuery,
    isLoading,
    showAddModal, setShowAddModal,
    editingBook, setEditingBook,
    deleteModalOpen, setDeleteModalOpen,
    bookToDelete, setBookToDelete,
    isDeleting,
    formData, setFormData,
    handleSearch, handleDeleteBook, handleSubmitBook, openEditModal,
  } = useAdminDashboard();

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
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

      <AdminStats books={books} loans={loans} />

      {/* Books Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Books Management</h2>
        </div>
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
            <Plus className="w-4 h-4 mr-2" />Add Book
          </Button>
        </div>
        <AdminBooksTable
          books={books}
          isLoading={isLoading}
          onEdit={openEditModal}
          onDelete={(book) => { setBookToDelete(book); setDeleteModalOpen(true); }}
        />
      </div>

      <AddEditBookModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingBook(null); }}
        onSubmit={handleSubmitBook}
        editingBook={editingBook}
        formData={formData}
        setFormData={setFormData}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setBookToDelete(null); }}
        onConfirm={handleDeleteBook}
        title="Delete Book"
        description="Are you sure you want to delete this book? This action cannot be undone."
        itemName={bookToDelete?.title}
        isLoading={isDeleting}
      />
    </div>
  );
}
