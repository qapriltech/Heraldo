import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

class ApiClient {
  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('heraldo_access_token');
    } catch {
      return null;
    }
  }

  async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: `Erreur ${res.status}` }));
      throw new Error(data.message || `Erreur API ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T = any>(path: string) { return this.request<T>(path); }
  post<T = any>(path: string, body?: any) { return this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }); }
  patch<T = any>(path: string, body?: any) { return this.request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }); }
  del<T = any>(path: string) { return this.request<T>(path, { method: 'DELETE' }); }
}

export const api = new ApiClient();
