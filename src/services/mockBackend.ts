import type { Credentials } from '../types/Credentials';
import type { User } from '../types/User';
import type { Work } from '../types/Work';

const API_BASE = 'http://localhost:3001';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (credentials: Credentials) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const register = async (credentials: Credentials) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const logout = async () => {
  const res = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/users`, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateUser = async (id: User['id'], updates: Partial<User>) => {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getWorks = async (): Promise<Work[]> => {
  const res = await fetch(`${API_BASE}/works`);
  if (!res.ok) throw new Error(await res.text());
  const works = await res.json();
  return Object.keys(works).map(
    key =>
      ({
        ...works[key],
        id: works[key].id || parseInt(key)
      } as Work)
  );
};

export const addWork = async (newWork: Partial<Work>) => {
  const res = await fetch(`${API_BASE}/works`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newWork)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteWork = async (id: Work['id']) => {
  const res = await fetch(`${API_BASE}/works/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateWorkStatus = async (
  id: Work['id'],
  newStatus: Work['status']
) => {
  const res = await fetch(`${API_BASE}/works/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateWork = async (id: Work['id'], updates: Partial<Work>) => {
  const res = await fetch(`${API_BASE}/works/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const approveWork = async (id: Work['id']) => {
  const res = await fetch(`${API_BASE}/works/${id}/approve`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
