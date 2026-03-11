import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '../../_services/auth.service';

export function useRegister() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.register({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email
      });
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; response?: { data?: { message?: string } } };
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    handleRegister
  };
}
