'use client';

import { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

interface AdminBooksTableProps {
  books: Book[];
  isLoading: boolean;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function AdminBooksTable({ books, isLoading, onEdit, onDelete }: AdminBooksTableProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-300 w-12">#</TableHead>
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
              <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></TableCell></TableRow>
            ) : books.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-slate-500">No books found</TableCell></TableRow>
            ) : (
              books.map((book, index) => (
                <TableRow key={book.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-slate-400 text-sm">{index + 1}</TableCell>
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
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10" onClick={() => onEdit(book)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => onDelete(book)}>
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
  );
}
