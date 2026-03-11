import { api } from '@/lib/api';
import { ApiResponse, Book } from '@/types';

export const BookService = {
  getAllBooks: async () => {
    return api.get<ApiResponse<Book[]>>('/books');
  },
  
  getBookById: async (bookId: string) => {
    return api.get<ApiResponse<Book>>(`/books/${bookId}`);
  },
  
  getBookByIsbn: async (isbn: string) => {
    return api.get<ApiResponse<Book>>(`/books/isbn/${isbn}`);
  },
  
  searchBooks: async (query: string) => {
    return api.get<ApiResponse<Book[]>>(`/books/search?query=${query}`);
  },
  
  createBook: async (bookData: Partial<Book>) => {
    return api.post<ApiResponse<Book>>('/books', bookData);
  },
  
  updateBook: async (bookId: string, bookData: Partial<Book>) => {
    return api.put<ApiResponse<Book>>(`/books/${bookId}`, bookData);
  },
  
  deleteBook: async (bookId: string) => {
    return api.delete<ApiResponse<null>>(`/books/${bookId}`);
  },
};
