import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
  nit?: string;
  comision?: number;
  username?: string;
  profile?: string; // Añadido este campo
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
  const router = useRouter();

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
          lastName: userData.lastName || '',
          email: userData.email,
          phone: userData.phone,
          enterprise: userData.enterprise,
          type: 'Conductor',
          profile: userData.profile || '' // Añadido profile
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
          username: userData.username,
          profile: '' // Añadido profile vacío para empresa
        };
      }
      
      const authToken = `user_${user.id}_${Date.now()}`;
      setUser(user);
      setToken(authToken);
      
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userType', credentials.userType);

      // Usar setTimeout para evitar problemas de navegación durante el renderizado
      setTimeout(() => {
        router.replace('/(tabs)/HomeScreen');
      }, 100);
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Mensajes de error más específicos
      let errorMessage = error.message || 'Error al iniciar sesión';
      
      if (errorMessage.includes('incorrectas') || errorMessage.includes('incorrectos')) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (errorMessage.includes('conexión') || errorMessage.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      } else if (errorMessage.includes('GraphQL') || errorMessage.includes('query')) {
        errorMessage = 'Error del servidor. Intenta nuevamente.';
      }
      
      throw new Error(errorMessage);
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
      
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
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