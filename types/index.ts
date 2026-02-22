export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
}

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  status: 'PENDING' | 'APPROVED' | 'RETURNED';
  requestedAt: string;
  loanDate?: string;
  dueDate?: string;
  returnDate?: string;
  approvedBy?: string;
  bookTitle?: string;
  bookAuthor?: string;
}
