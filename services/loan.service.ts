// src/services/loan.service.ts
import apiClient from '@/lib/axios';
import { ApiResponse, Loan } from '@/types';

export const LoanService = {
  // --- Akses User ---
  getMyLoans: async () => {
    const response = await apiClient.get<ApiResponse<Loan[]>>('/loans/my-loans');
    return response.data;
  },
  
  requestLoan: async (bookId: string) => {
    const response = await apiClient.post<ApiResponse<Loan>>(`/loans/request/${bookId}`);
    return response.data;
  },

  // --- Akses Admin ---
  getPendingLoans: async () => {
    const response = await apiClient.get<ApiResponse<Loan[]>>('/loans/pending');
    return response.data;
  },
  
  getAllLoansHistory: async () => {
    const response = await apiClient.get<ApiResponse<Loan[]>>('/loans');
    return response.data;
  },

  approveLoan: async (loanId: string, dueDate: string) => {
    // Body request butuh {"dueDate": "YYYY-MM-DD"}
    const response = await apiClient.put<ApiResponse<null>>(`/loans/${loanId}/approve`, { dueDate });
    return response.data;
  },

  returnLoan: async (loanId: string) => {
    const response = await apiClient.put<ApiResponse<null>>(`/loans/${loanId}/return`);
    return response.data;
  }
};