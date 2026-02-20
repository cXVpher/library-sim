import { api } from '@/lib/api';
import { ApiResponse, Loan } from '@/types';

export const LoanService = {
  getMyLoans: async () => {
    return api.get<ApiResponse<Loan[]>>('/loans/my-loans');
  },
  
  requestLoan: async (bookId: string) => {
    return api.post<ApiResponse<Loan>>(`/loans/request/${bookId}`, {});
  },

  getPendingLoans: async () => {
    return api.get<ApiResponse<Loan[]>>('/loans/pending');
  },
  
  getAllLoansHistory: async () => {
    return api.get<ApiResponse<Loan[]>>('/loans');
  },

  approveLoan: async (loanId: string, dueDate: string) => {
    return api.put<ApiResponse<null>>(`/loans/${loanId}/approve`, { dueDate });
  },

  returnLoan: async (loanId: string) => {
    return api.put<ApiResponse<null>>(`/loans/${loanId}/return`, {});
  }
};
