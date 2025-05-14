export interface User {
  id: string;
  username: string;
  shProfileURL: string;
  role: UserRole;
  approved: boolean;
  token?: string;
}

export type UserRole = 'user' | 'admin';
