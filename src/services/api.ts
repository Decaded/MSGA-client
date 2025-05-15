import type {
  LoginCredentials,
  RegisterCredentials
} from '../types/Credentials';
import type { User } from '../types/User';
import type { Work } from '../types/Work';

const API_BASE = 'http://localhost:3001';

const getAuthToken = () => localStorage.getItem('token');

const fetchWrapper = async (
  endpoint: string,
  options: RequestInit = {},
  auth: boolean = false
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request to ${endpoint} failed`);
  }

  return res.json();
};

// ─── Auth ────────────────────────────────────────────

export const login = (data: LoginCredentials) =>
  fetchWrapper('/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const register = (data: RegisterCredentials) =>
  fetchWrapper('/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const logout = () => fetchWrapper('/logout', { method: 'POST' }, true);

// ─── Users ───────────────────────────────────────────

export const getUsers = () => fetchWrapper('/users', {}, true);

export const updateUser = (id: User['id'], updates: Partial<User>) =>
  fetchWrapper(
    `/users/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates)
    },
    true
  );

export const deleteUser = (id: User['id']) =>
  fetchWrapper(
    `/users/${id}`,
    {
      method: 'DELETE'
    },
    true
  );

// ─── Works ───────────────────────────────────────────

export const getWorks = async (): Promise<Work[]> => {
  const raw = await fetchWrapper('/works');
  return Object.keys(raw).map(key => ({
    ...raw[key],
    id: raw[key].id || parseInt(key)
  }));
};

export const addWork = (newWork: Partial<Work>) =>
  fetchWrapper(
    '/works',
    {
      method: 'POST',
      body: JSON.stringify(newWork)
    },
    true
  );

export const updateWork = (id: Work['id'], updates: Partial<Work>) =>
  fetchWrapper(
    `/works/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates)
    },
    true
  );

export const updateWorkStatus = (id: Work['id'], status: Work['status']) =>
  fetchWrapper(
    `/works/${id}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status })
    },
    true
  );

export const approveWork = (id: Work['id']) =>
  fetchWrapper(
    `/works/${id}/approve`,
    {
      method: 'PUT'
    },
    true
  );

export const deleteWork = (id: Work['id']) =>
  fetchWrapper(
    `/works/${id}`,
    {
      method: 'DELETE'
    },
    true
  );
