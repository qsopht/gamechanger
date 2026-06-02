import api from './api';

export interface User {
  id: string;
  email: string;
  fullName?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function register(email: string, password: string, fullName: string): Promise<LoginResponse> {
  const response = await api.post('/auth/register', {
    email,
    password,
    fullName
  });
  return response.data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}
