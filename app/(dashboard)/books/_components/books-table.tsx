'use client';

import { Book, Loan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { SortConfig, SortField } from '../_hooks/useBooksPage';

interface BooksTableProps {
  currentBooks: Book[];
  isLoading: boolean;
  isAdmin: boolean;
  borrowingId: string | null;
  sortConfig: SortConfig;
  startIndex: number;
  onSort: (field: SortField) => void;
  getLoanStatus: (bookId: string) => Loan | undefined;
  onBorrow: (bookId: string) => void;
}

function SortButton({ field, label, sortConfig, onSort }: { field: SortField; label: string; sortConfig: SortConfig; onSort: (f: SortField) => void }) {
  const isActive = sortConfig.field === field;
  return (
    <Button variant="ghost" size="sm" onClick={() => onSort(field)}
      className={`h-8 px-2 flex items-center gap-1 transition-colors ${isActive ? 'text-blue-400 hover:text-black hover:bg-white/90' : 'text-slate-300 hover:text-black hover:bg-white/90'}`}>
      {label}
      <div className="flex flex-col ml-1">
        {isActive && sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" />
          : isActive && sortConfig.direction === 'desc' ? <ArrowDown className="w-3 h-3" />
          : <div className="w-3 flex flex-col items-center"><ArrowUp className="w-2 h-2 opacity-30" /><ArrowDown className="w-2 h-2 opacity-30 -mt-1" /></div>}
      </div>
    </Button>
  );
}

export function BooksTable({ currentBooks, isLoading, isAdmin, borrowingId, sortConfig, startIndex, onSort, getLoanStatus, onBorrow }: BooksTableProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-300 w-12">#</TableHead>
              <TableHead className="text-slate-300"><SortButton field="title" label="Title" sortConfig={sortConfig} onSort={onSort} /></TableHead>
              <TableHead className="text-slate-300"><SortButton field="author" label="Author" sortConfig={sortConfig} onSort={onSort} /></TableHead>
              <TableHead className="text-slate-300">ISBN</TableHead>
              <TableHead className="text-slate-300">Publisher</TableHead>
              <TableHead className="text-right text-slate-300"><SortButton field="publicationYear" label="Year" sortConfig={sortConfig} onSort={onSort} /></TableHead>
              <TableHead className="text-center text-slate-300"><SortButton field="availableCopies" label="Availability" sortConfig={sortConfig} onSort={onSort} /></TableHead>
              <TableHead className="text-center text-slate-300">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></TableCell></TableRow>
            ) : currentBooks.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-slate-500">No books found</TableCell></TableRow>
            ) : currentBooks.map((book, index) => (
              <TableRow key={book.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="text-slate-400 text-sm">{startIndex + index + 1}</TableCell>
                <TableCell className="font-medium text-white">{book.title}</TableCell>
                <TableCell className="text-slate-300">{book.author}</TableCell>
                <TableCell className="font-mono text-sm text-slate-400">{book.isbn}</TableCell>
                <TableCell className="text-slate-300">{book.publisher}</TableCell>
                <TableCell className="text-right text-slate-300">{book.publicationYear}</TableCell>
                <TableCell className="text-center">
                  {book.availableCopies > 0
                    ? <span className="inline-flex items-center gap-1 text-green-400"><span className="w-2 h-2 bg-green-400 rounded-full" />{book.availableCopies} / {book.totalCopies}</span>
                    : <span className="inline-flex items-center gap-1 text-red-400"><span className="w-2 h-2 bg-red-400 rounded-full" />All borrowed</span>}
                </TableCell>
                <TableCell className="text-center">
                  {isAdmin ? <span className="text-sm text-slate-500">Admin Access</span> : (() => {
                    const ls = getLoanStatus(book.id);
                    if (ls?.status === 'PENDING') return <span className="inline-flex items-center gap-1 text-yellow-400"><Loader2 className="w-3 h-3 animate-spin" />Pending Request</span>;
                    if (ls?.status === 'APPROVED') return <span className="inline-flex items-center gap-1 text-blue-400"><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />On Loan</span>;
                    if (book.availableCopies > 0) return (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onBorrow(book.id)} disabled={borrowingId === book.id}>
                        {borrowingId === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4 mr-1" />Borrow</>}
                      </Button>
                    );
                    return <span className="text-sm text-slate-500">Unavailable</span>;
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
