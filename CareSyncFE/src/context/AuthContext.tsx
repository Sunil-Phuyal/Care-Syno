import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api';
import { storage } from '../utils/storage';
import type { AuthContextType, User, RegisterRequest } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check if user is authenticated on app load
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    setIsLoading(true);
    
    try {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser();

      if (savedToken && savedUser) {
        // Verify token is still valid by calling /auth/me
        const currentUser = await authApi.getCurrentUser();
        
        setTokenState(savedToken);
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        // No saved credentials
        setTokenState(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Token invalid or expired
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({ email, password });
      
      // Save token and user
      storage.setToken(response.token);
      const userInfo: User = {
        userId: response.userId,
        email: response.email,
        fullName: response.fullName,
        roles: response.roles,
        isEmailVerified: false,
      };
      storage.setUser(userInfo);
      
      // Update state
      setTokenState(response.token);
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      await authApi.register(data);
      
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    storage.clear();
    setTokenState(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}