import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import authService, {
  DriverResponse,
  EnterpriseLoginResponse,
  EnterpriseResponse,
  LoginCredentials
} from '../services/authService';

// Interface unificada para el usuario
interface User {
  _id: string;
  id: string;
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
  userType: 'Conductor' | 'Empresa' | null;
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
  const [userType, setUserType] = useState<'Conductor' | 'Empresa' | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');
      const storedUserType = await AsyncStorage.getItem('userType');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setUserType(storedUserType as 'Conductor' | 'Empresa');
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
      
      console.log('Response del login:', response);
      
      // Verificar si el login fue exitoso
      if (!response.result) {
        throw new Error('Credenciales incorrectas');
      }
      
      let user: User;
      setUserType(credentials.userType);

      if (credentials.userType === 'Conductor') {
        const userData = response.result as DriverResponse;
        
        user = {
          _id: userData._id,
          id: userData._id,
          names: userData.names,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          enterprise: userData.enterprise,
          type: 'Conductor'
        };
      } else {
        const userData = response.result as EnterpriseLoginResponse;
        
        user = {
          _id: userData.id,
          id: userData.id,
          names: userData.name,
          lastName: '',
          email: userData.correo,
          phone: userData.phone,
          type: 'Empresa',
          nit: userData.nit,
          comision: userData.comision,
          username: userData.username
        };
      }
      
      console.log('User creado:', user);
      
      // Guardar en estado
      setUser(user);
      // Como no hay token real, usamos un token dummy o el ID del usuario
      const authToken = `user_${user.id}_${Date.now()}`;
      setToken(authToken);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userType', credentials.userType);

      router.replace('/(tabs)/HomeScreen');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error; // Re-lanzar el error sin modificar
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setUserType(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      await AsyncStorage.removeItem('userType');
      router.replace('/login');
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
    userType,
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