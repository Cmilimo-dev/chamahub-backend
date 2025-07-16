import { API_BASE_URL, getApiUrls } from './config';

// Types for the API
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ChamaGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  contribution_amount: number;
  contribution_frequency: string;
  member_count: number;
  total_savings: number;
  status: string;
  meeting_day?: string;
  meeting_time?: string;
  min_contribution_amount: number;
  max_contribution_amount?: number;
  loan_interest_rate: number;
  max_loan_multiplier: number;
  allow_partial_contributions: boolean;
  contribution_grace_period_days: number;
  group_rules: any;
  created_at: string;
  updated_at: string;
}

// API Class
export class ChamaHubAPI {
  // User methods
  static async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Group methods
  static async getGroups(): Promise<ChamaGroup[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`);
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }
}

// General API request helper
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request error:', error);
    return { data: null, error };
  }
};

// Mock query builder for Supabase compatibility
export const createMockQueryBuilder = () => {
  const mockBuilder = {
    select: () => mockBuilder,
    insert: () => mockBuilder,
    update: () => mockBuilder,
    delete: () => mockBuilder,
    eq: () => mockBuilder,
    neq: () => mockBuilder,
    gt: () => mockBuilder,
    gte: () => mockBuilder,
    lt: () => mockBuilder,
    lte: () => mockBuilder,
    like: () => mockBuilder,
    ilike: () => mockBuilder,
    in: () => mockBuilder,
    is: () => mockBuilder,
    order: () => mockBuilder,
    limit: () => mockBuilder,
    range: () => mockBuilder,
    single: () => mockBuilder,
    maybeSingle: () => mockBuilder,
    then: (resolve: (value: any) => void) => {
      // Return empty data for all queries
      resolve({ data: [], error: null });
    },
    catch: (reject: (error: any) => void) => {
      // Handle promise rejection
      return mockBuilder;
    }
  };
  
  return mockBuilder;
};

// Supabase has been completely removed - using MySQL backend exclusively

// Helper function to try multiple API URLs
const tryApiUrls = async (endpoint: string, options: RequestInit = {}) => {
  const { primary, fallbacks } = getApiUrls();
  const urls = [primary, ...fallbacks];
  
  console.log('Trying API URLs:', urls);
  
  for (const baseUrl of urls) {
    try {
      console.log(`Attempting API call to: ${baseUrl}${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        console.log(`API call failed with status ${response.status} for ${baseUrl}`);
        continue;
      }
      
      console.log(`API call successful to: ${baseUrl}${endpoint}`);
      return response;
    } catch (error) {
      console.log(`API call error for ${baseUrl}:`, error);
      continue;
    }
  }
  
  throw new Error('All API endpoints failed');
};

// API Client for HTTP requests with fallback support
export const apiClient = {
  async get(endpoint: string) {
    const response = await tryApiUrls(endpoint);
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await tryApiUrls(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      // Try to parse error response as JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      } catch (jsonError) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await tryApiUrls(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await tryApiUrls(endpoint, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default ChamaHubAPI;
