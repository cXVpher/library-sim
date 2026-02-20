import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  role: string;
  userId: string;
}

export const AuthService = {
  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    return api.post<ApiResponse<AuthResponse>>('/auth/login', data, false);
  },
  
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return api.post<ApiResponse<AuthResponse>>('/auth/register', data, false);
  },
};
