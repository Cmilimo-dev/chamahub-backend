import { User } from './api';
import { API_BASE_URL } from './config';

export interface AuthUser extends User {
  password_hash?: string;
  email_verified: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Sign up a new user
  static async signUp(userData: SignUpData): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign up failed');
    }

    return response.json();
  }

  // Sign in user
  static async signIn(credentials: SignInData): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password.trim()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }

    return response.json();
  }

  // Placeholder methods for future implementation
  static async getUserById(id: string): Promise<AuthUser | null> {
    // TODO: Implement with API call
    return null;
  }

  static async updateProfile(id: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    // TODO: Implement with API call
    throw new Error('Not implemented');
  }

  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // TODO: Implement with API call
    throw new Error('Not implemented');
  }

  static async verifyEmail(id: string): Promise<boolean> {
    // TODO: Implement with API call
    return true;
  }

  static async getProfile(id: string): Promise<any> {
    // TODO: Implement with API call
    return null;
  }
}

// Simple session management (in production, use JWT or proper session management)
export class SessionService {
  private static currentUser: AuthUser | null = null;

  static setCurrentUser(user: AuthUser | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  static getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static signOut() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }
}

export default AuthService;
