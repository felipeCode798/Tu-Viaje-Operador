import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LoginResponse, 
  LoginCredentials, 
  EnterpriseResponse,
  DriverResponse,
  EnterpriseLoginResponse 
} from '../services/authService';
import authService from '../services/authService';
import { router } from 'expo-router';

// Interface unificada para el usuario
interface User {
  _id: string;
  names: string;
  lastName: string;
  email: string;
  phone: string;
  enterprise?: EnterpriseResponse;
  type: 'Conductor' | 'Empresa';
  // Campos específicos de empresa
  nit?: string;
  comision?: number;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      let user: User;

      if (credentials.userType === 'Conductor') {
        // Para conductor
        const userData = response.result as DriverResponse;
        user = {
          _id: userData._id,
          names: userData.names,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          enterprise: userData.enterprise,
          type: 'Conductor'
        };
      } else {
        // Para empresa
        const userData = response.result as EnterpriseLoginResponse;
        user = {
          _id: userData.id,
          names: userData.name,
          lastName: '', // Las empresas no tienen lastName
          email: userData.correo,
          phone: userData.phone,
          type: 'Empresa',
          nit: userData.nit,
          comision: userData.comision,
          username: userData.username
        };
      }
      
      // Guardar en estado
      setUser(user);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('authUser', JSON.stringify(user));

      router.replace('/(tabs)/home');
      
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};