// src/services/book.service.ts
import apiClient from '@/lib/axios';
import { ApiResponse, Book } from '@/types';

export const BookService = {
  // Get all books
  getAllBooks: async () => {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books');
    return response.data;
  },
  
  // Get book by ID
  getBookById: async (bookId: string) => {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/${bookId}`);
    return response.data;
  },
  
  // Get book by ISBN
  getBookByIsbn: async (isbn: string) => {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/isbn/${isbn}`);
    return response.data;
  },
  
  // Search books by query
  searchBooks: async (query: string) => {
    const response = await apiClient.get<ApiResponse<Book[]>>(`/books/search?query=${query}`);
    return response.data;
  },
  
  // Create book (Admin only)
  createBook: async (bookData: Partial<Book>) => {
    const response = await apiClient.post<ApiResponse<Book>>('/books', bookData);
    return response.data;
  },
  
  // Update book (Admin only)
  updateBook: async (bookId: string, bookData: Partial<Book>) => {
    const response = await apiClient.put<ApiResponse<Book>>(`/books/${bookId}`, bookData);
    return response.data;
  },
  
  // Delete book (Admin only)
  deleteBook: async (bookId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/books/${bookId}`);
    return response.data;
  },
};
