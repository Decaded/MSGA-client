export interface User {
  id: string;
  username: string;
  role: UserRole;
  approved: boolean;
}

export type UserRole = 'user' | 'admin';
