// User roles for the CRM system
export type UserRole =
  | 'sales_admin'      // Full access to CRM, can manage team
  | 'sales_manager'    // Can manage leads, view team performance
  | 'sales_rep';       // Can manage own leads, limited access

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  title?: string;
  department?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  createdAt?: number; // Timestamp when token was issued (for expiration calculation)
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  passwordConfirmation: string;
}
