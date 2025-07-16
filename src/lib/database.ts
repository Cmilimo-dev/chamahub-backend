// Frontend database helper - uses API endpoints instead of direct MySQL connection
// MySQL2 cannot run in the browser, so all database operations go through the API server

const API_BASE_URL = 'http://localhost:4000/api';

// Test connection through API
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const success = response.ok;
    if (success) {
      console.log('API server connected successfully');
    } else {
      console.error('Failed to connect to API server');
    }
    return success;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};

// Helper function to execute API requests (replaces direct database queries)
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
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Legacy exports for compatibility (these should not be used in frontend)
export const pool = null;
export const query = null;
export const transaction = null;
