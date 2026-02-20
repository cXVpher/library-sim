// src/services/auth.service.ts
import apiClient from '@/lib/axios';
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
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },
};
