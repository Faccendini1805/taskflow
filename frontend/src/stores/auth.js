import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';

// Get stored user from localStorage or set to null
const storedUser = browser ? JSON.parse(localStorage.getItem('user') || 'null') : null;

// Create auth store with initial value
const createAuthStore = () => {
  const { subscribe, set, update } = writable({
    user: storedUser,
    token: browser ? localStorage.getItem('token') : null,
    isAuthenticated: !!storedUser,
    loading: false,
    error: null
  });

  // Helper function to set auth headers
  const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });

  // Login user
  const login = async (email, password) => {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      
      const response = await fetch(`${PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Update store with user data
      const { token, data: { user } } = data;
      
      // Store user data in localStorage
      if (browser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      update(state => ({ ...state, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const token = browser ? localStorage.getItem('token') : null;
      
      // Call logout API if token exists
      if (token) {
        await fetch(`${PUBLIC_API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(token)
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and reset store
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      
      // Redirect to login
      goto('/login');
    }
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = browser ? localStorage.getItem('token') : null;
    
    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      update(state => ({ ...state, loading: true }));
      
      const response = await fetch(`${PUBLIC_API_URL}/api/v1/auth/verify`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Sesión expirada');
      }

      const { data } = await response.json();
      
      // Update store with fresh user data
      if (browser) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      set({
        user: data.user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      return { isAuthenticated: true, user: data.user };
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid session
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: error.message
      });
      
      return { isAuthenticated: false, error: error.message };
    }
  };

  // Update user data in store and localStorage
  const updateUser = (userData) => {
    const updatedUser = { ...storedUser, ...userData };
    
    if (browser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    update(state => ({
      ...state,
      user: updatedUser
    }));
  };

  // Update token in store and localStorage
  const updateToken = (newToken) => {
    if (browser) {
      localStorage.setItem('token', newToken);
    }
    
    update(state => ({
      ...state,
      token: newToken
    }));
  };

  return {
    subscribe,
    login,
    logout,
    checkAuth,
    updateUser,
    updateToken
  };
};

export const auth = createAuthStore();

// Check auth status on store creation
if (browser && storedUser) {
  auth.checkAuth();
}
