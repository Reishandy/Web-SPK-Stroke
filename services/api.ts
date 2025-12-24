import { AuthResponse, User, PredictionInput, PredictionResponse, HistoryItem, HistoryDetail, ModelType, PersonalDefaults } from '../types';

// Ensure no trailing slash in base URL to prevent double slashes (e.g., //users/me)
const ENV_URL = (import.meta as any).env?.VITE_API_URL || 'https://stroke-backend.reishandy.id';
const API_BASE_URL = ENV_URL.replace(/\/$/, '');

class ApiService {
  private token: string | null = localStorage.getItem('access_token');

  private getHeaders(isFormData = false) {
    const headers: HeadersInit = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.logout();
      window.location.hash = '#/login';
      throw new Error('Session expired');
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      
      if (!response.ok) {
        const message = Array.isArray(data.detail) 
          ? data.detail.map((e: any) => e.msg).join(', ') 
          : data.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }
      return data as T;
    } else {
      // Handle non-JSON responses (like HTML 404s)
      if (!response.ok) {
         const text = await response.text();
         // If text is short, use it, otherwise generic error
         const errorMessage = text.length < 100 ? text : `Request failed with status ${response.status}`;
         throw new Error(errorMessage);
      }
      // Should not happen for successful API calls expecting JSON
      return {} as T; 
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // --- Auth ---

  async register(data: { email: string; password: string; full_name: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(res);
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const res = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    return this.handleResponse<AuthResponse>(res);
  }

  // --- Users ---

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(res);
  }

  async updateDefaults(defaults: PersonalDefaults): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/me/defaults`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(defaults),
    });
    if (res.status === 204) return;
    return this.handleResponse<void>(res);
  }

  // --- Predictions ---

  async predict(model: ModelType, data: PredictionInput): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE_URL}/predict/${model}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<PredictionResponse>(res);
  }

  async getHistory(skip = 0, limit = 100): Promise<HistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/predict/history?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<HistoryItem[]>(res);
  }

  async getHistoryDetail(logId: string): Promise<HistoryDetail> {
    const res = await fetch(`${API_BASE_URL}/predict/history/${logId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<HistoryDetail>(res);
  }
}

export const api = new ApiService();