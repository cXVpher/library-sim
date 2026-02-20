'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
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
        setErrorMsg(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; response?: { data?: { message?: string } } };
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setErrorMsg('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-[420px] shadow-2xl border-slate-700 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-slate-800 rounded-full">
              <Library className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="John Doe"
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="john@example.com"
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="johndoe"
                value={formData.username} 
                onChange={handleChange} 
                required 
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                className="h-10"
              />
            </div>
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center">{errorMsg}</p>
              </div>
            )}
            
            <Button type="submit" className="w-full h-10 bg-slate-800 hover:bg-slate-700" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-800 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
