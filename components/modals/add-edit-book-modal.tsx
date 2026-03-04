'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from '@/types';
import { X } from 'lucide-react';

interface AddEditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingBook: Book | null;
  formData: {
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    publicationYear: number;
    totalCopies: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    publicationYear: number;
    totalCopies: number;
  }>>;
}

export function AddEditBookModal({
  isOpen,
  onClose,
  onSubmit,
  editingBook,
  formData,
  setFormData,
}: AddEditBookModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
        </DialogHeader>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <form onSubmit={onSubmit} className="space-y-4">
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
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
