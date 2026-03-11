'use client';

import { useBooksPage } from './_hooks/useBooksPage';
import { BooksStats } from './_components/books-stats';
import { BooksTable } from './_components/books-table';
import { BooksPagination } from './_components/books-pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Library } from 'lucide-react';

export default function BooksPage() {
  const {
    searchQuery, setSearchQuery,
    isLoading, borrowingId, isAdmin,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    itemsPerPageOptions, sortConfig,
    currentBooks, totalItems, totalPages, startIndex, endIndex,
    totalBooks, availableBooks, totalCopies, availableCopies,
    fetchBooks, searchBooks, handleBorrow, handleSort, getLoanStatusForBook,
  } = useBooksPage();

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg"><Library className="w-6 h-6 text-blue-400" /></div>
          <div>
            <h1 className="text-3xl font-bold text-white">Book Catalog</h1>
            <p className="text-slate-400">Browse and borrow books from our library</p>
          </div>
        </div>
      </div>

      <BooksStats totalBooks={totalBooks} availableBooks={availableBooks} totalCopies={totalCopies} availableCopies={availableCopies} />

      {/* Search */}
      <form onSubmit={searchBooks} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        />
        <Button type="submit" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-white/10">
          <Search className="w-4 h-4 mr-2" />Search
        </Button>
        {searchQuery && (
          <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => { setSearchQuery(''); fetchBooks(); }}>
            Clear
          </Button>
        )}
      </form>

      <BooksTable
        currentBooks={currentBooks}
        isLoading={isLoading}
        isAdmin={isAdmin}
        borrowingId={borrowingId}
        sortConfig={sortConfig}
        startIndex={startIndex}
        onSort={handleSort}
        getLoanStatus={getLoanStatusForBook}
        onBorrow={handleBorrow}
      />

      <BooksPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
