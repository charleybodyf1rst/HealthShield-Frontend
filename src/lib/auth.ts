import { AUTH_TOKEN_KEY, USER_KEY } from './constants';
import type { AuthTokens, User, UserRole } from '@/types/auth';

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_TOKEN_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(tokens));
}

export function removeStoredTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

export function clearAuth(): void {
  removeStoredTokens();
  removeStoredUser();
}

export function isTokenExpired(tokens: AuthTokens): boolean {
  if (!tokens.expiresIn) return false; // If no expiresIn, assume token is valid
  if (!tokens.createdAt) return false; // If no createdAt, assume token is valid (server will reject if invalid)

  // Calculate when token expires: createdAt + expiresIn (in seconds)
  const expirationTime = tokens.createdAt + (tokens.expiresIn * 1000);
  // Consider expired 1 minute before actual expiration
  return Date.now() >= expirationTime - 60000;
}

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function canAccessRoute(user: User | null, allowedRoles: UserRole[]): boolean {
  return hasRole(user, allowedRoles);
}

export function isSalesAdmin(user: User | null): boolean {
  return hasRole(user, ['sales_admin']);
}

export function isSalesManager(user: User | null): boolean {
  return hasRole(user, ['sales_admin', 'sales_manager']);
}

export function isSalesRep(user: User | null): boolean {
  return hasRole(user, ['sales_admin', 'sales_manager', 'sales_rep']);
}

export function canManageTeam(user: User | null): boolean {
  return hasRole(user, ['sales_admin']);
}

export function canAccessAnalytics(user: User | null): boolean {
  return hasRole(user, ['sales_admin', 'sales_manager']);
}

export function canAccessAIFeatures(user: User | null): boolean {
  return hasRole(user, ['sales_admin', 'sales_manager']);
}

export function canEditLead(user: User | null, leadAssignedTo?: string): boolean {
  if (!user) return false;
  // Admins and managers can edit any lead
  if (hasRole(user, ['sales_admin', 'sales_manager'])) return true;
  // Sales reps can only edit their assigned leads
  return leadAssignedTo === user.id;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getFullName(user: User | null): string {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
}

const DASHBOARD_TITLES: Record<UserRole, string> = {
  sales_admin: 'Sales Admin Dashboard',
  sales_manager: 'Sales Manager Dashboard',
  sales_rep: 'My Dashboard',
};

export function getDashboardTitle(role?: UserRole): string {
  if (!role) return 'Dashboard';
  return DASHBOARD_TITLES[role] || 'Dashboard';
}
