'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BooksPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

export function BooksPagination({ currentPage, totalPages, totalItems, startIndex, endIndex, itemsPerPage, itemsPerPageOptions, onPageChange, onItemsPerPageChange }: BooksPaginationProps) {
  if (totalItems === 0) return null;
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Show:</span>
        <div className="flex gap-1">
          {itemsPerPageOptions.map((opt) => (
            <Button key={opt} variant={itemsPerPage === opt ? 'default' : 'outline'} size="sm"
              onClick={() => onItemsPerPageChange(opt)}
              className={itemsPerPage === opt ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/20 text-white bg-white/10'}>
              {opt}
            </Button>
          ))}
          <Button variant={itemsPerPage === -1 ? 'default' : 'outline'} size="sm"
            onClick={() => onItemsPerPageChange(-1)}
            className={itemsPerPage === -1 ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/20 text-white bg-white/10'}>
            All
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems} books</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
            className="border-white/20 text-white bg-white/10 disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="flex items-center px-3 text-white text-sm">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
            className="border-white/20 text-white bg-white/10 disabled:opacity-50">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
