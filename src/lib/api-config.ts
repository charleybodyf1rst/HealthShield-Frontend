/**
 * API Configuration
 * Provides backend URL configuration for API routes
 */

const DEFAULT_BACKEND_URL = 'https://systemsf1rst-backend-887571186773.us-central1.run.app';
const DEFAULT_APP_URL = 'https://healthshield.ai';

const API_KEY = process.env.SYSTEMSF1RST_API_KEY || '';

export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getBackendUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

export function getServerHeaders(authHeader?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
}
