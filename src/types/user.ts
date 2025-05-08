// src/types/user.ts

export type UserRole = 'admin' | 'editor' | 'user';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  company?: string;
  createdAt: Date;
  photoURL?: string | null;
}
