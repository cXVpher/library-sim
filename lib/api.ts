import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spring-lib-api.zeabur.app/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  requiresAuth?: boolean;
}

async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requiresAuth = true } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth) {
    const token = Cookies.get('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw { response: { data: error } };
  }
  
  return response.json();
}

export const api = {
  get: <T>(endpoint: string, requiresAuth = true) => 
    fetchApi<T>(endpoint, { method: 'GET', requiresAuth }),
  
  post: <T>(endpoint: string, body: unknown, requiresAuth = true) => 
    fetchApi<T>(endpoint, { method: 'POST', body, requiresAuth }),
  
  put: <T>(endpoint: string, body: unknown, requiresAuth = true) => 
    fetchApi<T>(endpoint, { method: 'PUT', body, requiresAuth }),
  
  delete: <T>(endpoint: string, requiresAuth = true) => 
    fetchApi<T>(endpoint, { method: 'DELETE', requiresAuth }),
};
