import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  role: string | null;
  userId: string | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const decodeJWT = (token: string): { role: string; userId: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      role: payload.role || 'ROLE_USER',
      userId: payload.userId || payload.sub || '',
    };
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = Cookies.get('token') ?? null;
  let initialRole: string | null = null;
  let initialUserId: string | null = null;
  
  if (initialToken) {
    const decoded = decodeJWT(initialToken);
    if (decoded) {
      initialRole = decoded.role;
      initialUserId = decoded.userId;
    }
  }

  return {
    isAuthenticated: !!initialToken,
    role: initialRole,
    userId: initialUserId,
    token: initialToken,
    login: (token) => {
      Cookies.set('token', token, { expires: 1, sameSite: 'Lax' });
      const decoded = decodeJWT(token);
      set({ 
        isAuthenticated: true, 
        token,
        role: decoded?.role || 'ROLE_USER',
        userId: decoded?.userId || null
      });
    },
    logout: () => {
      Cookies.remove('token');
      set({ 
        isAuthenticated: false, 
        token: null,
        role: null,
        userId: null
      });
    },
  };
});
