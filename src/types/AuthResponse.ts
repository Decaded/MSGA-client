import type { User } from './User';

export interface AuthResponse extends User {
  token: string;
}
