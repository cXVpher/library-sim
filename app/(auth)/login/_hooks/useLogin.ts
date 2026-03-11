import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthService } from '../../_services/auth.service';

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login({ username, password });
      
      if (response.success && response.data.token) {
        login(response.data.token);
        
        const role = response.data.role || '';
        const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role.toUpperCase().includes('ADMIN');
        
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/books');
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; response?: { data?: { message?: string } } };
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleLogin
  };
}
