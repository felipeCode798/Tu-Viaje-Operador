import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import { clientUrl } from '../constants/Urls';

// Interfaces actualizadas según tu GraphQL schema
export interface DriverResponse {
  _id: string;
  names: string;
  lastName: string;
  email: string;
  phone: string;
  enterprise?: EnterpriseResponse;
  identificacion?: string;
  categorialicencia?: string;
  vigencialicencia?: string;
}

export interface EnterpriseLoginResponse {
  id: string;
  name: string;
  nit: string;
  comision: number;
  correo: string;
  phone: string;
  username: string;
}

export interface EnterpriseResponse {
  id?: string; // Hacemos opcional el id para evitar el error del Buffer
  name: string;
  image?: string;
  nit: string;
  comision: number;
  correo: string;
  phone: string;
}

// Interfaces actualizadas para coincidir con GraphQL
export interface DriverLoginResponse {
  result: DriverResponse | null;
  message: string;
}

export interface EnterpriseLoginResponseQL {
  result: EnterpriseLoginResponse | null;
  message: string;
}

export interface LoginResponse {
  result: DriverResponse | EnterpriseLoginResponse | null;
  message: string;
  // Removemos accessToken y token ya que no están en GraphQL
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'Conductor' | 'Empresa';
}

interface PasswordRecoveryResponse {
  status: string;
  message: string;
}

class AuthService {
  private client: ApolloClient<any>;

  constructor() {
    this.client = new ApolloClient({
      uri: clientUrl,
    });
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('=== INICIANDO LOGIN ===');
      console.log('Credenciales enviadas:', {
        email: credentials.email,
        userType: credentials.userType,
        password: credentials.password ? '[OCULTA]' : 'NO PROPORCIONADA'
      });

      if (credentials.userType === 'Conductor') {
        console.log('Intentando login como Conductor...');
        
        const result = await this.client.mutate({
          mutation: gql`
            mutation LoginDriver($input: LoginDriverInput!) {
              loginDriver(input: $input) {
                result {
                  _id
                  names
                  lastName
                  email
                  phone
                  enterprise {
                    name
                    nit
                    comision
                    correo
                    phone
                  }
                }
                message
              }
            }
          `,
          variables: {
            input: {
              email: credentials.email,
              password: credentials.password
            }
          }
        });

        console.log('=== RESPUESTA COMPLETA DEL SERVIDOR (CONDUCTOR) ===');
        console.log(JSON.stringify(result.data, null, 2));

        const loginData: DriverLoginResponse = result.data.loginDriver;
        
        console.log('loginData extraído:', loginData);
        console.log('loginData.result:', loginData.result);
        console.log('loginData.message:', loginData.message);
        
        // Verificación mejorada
        if (!loginData.result) {
          console.log('❌ Login falló - result es null');
          throw new Error(loginData.message || 'Credenciales incorrectas');
        }

        console.log('✅ Login exitoso para conductor');
        return {
          result: loginData.result,
          message: loginData.message
        };

      } else {
        console.log('Intentando login como Empresa...');
        
        const result = await this.client.mutate({
          mutation: gql`
            mutation LoginEnterprise($input: EnterpriseInput!) {
              loginEnterprise(input: $input) {
                result {
                  id
                  name
                  nit
                  comision
                  correo
                  phone
                  username
                }
                message
              }
            }
          `,
          variables: {
            input: {
              username: credentials.email,
              password: credentials.password
            }
          }
        });

        console.log('=== RESPUESTA COMPLETA DEL SERVIDOR (EMPRESA) ===');
        console.log(JSON.stringify(result.data, null, 2));

        const loginData: EnterpriseLoginResponseQL = result.data.loginEnterprise;
        
        console.log('loginData extraído:', loginData);
        console.log('loginData.result:', loginData.result);
        console.log('loginData.message:', loginData.message);
        
        // Verificación mejorada
        if (!loginData.result) {
          console.log('❌ Login falló - result es null');
          throw new Error(loginData.message || 'Credenciales incorrectas');
        }

        console.log('✅ Login exitoso para empresa');
        return {
          result: loginData.result,
          message: loginData.message
        };
      }

    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Manejar errores de GraphQL
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        console.error('GraphQL Error:', graphQLError);
        throw new Error(graphQLError.message || 'Error al iniciar sesión');
      }
      
      // Manejar errores de red
      if (error.networkError) {
        console.error('Network Error:', error.networkError);
        throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }
      
      // Error personalizado o desconocido
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      console.log('Solicitando recuperación para:', email);
      
      // Intentar con recuperarPasswordDriver
      try {
        const result = await this.client.mutate({
          mutation: gql`
            mutation RecuperarPasswordDriver($input: SmsInput!) {
              recuperarPasswordDriver(input: $input) {
                status
                message
              }
            }
          `,
          variables: { 
            input: { email } 
          }
        });

        if (result.data?.recuperarPasswordDriver) {
          const response: PasswordRecoveryResponse = result.data.recuperarPasswordDriver;
          
          const isSuccess = 
            response.status === 'success' ||
            response.status === 'ok' || 
            response.status === 'true' ||
            response.status === 'SUCCESS' ||
            response.message?.toLowerCase().includes('éxito') ||
            response.message?.toLowerCase().includes('enviado') ||
            response.message?.toLowerCase().includes('success');
          
          if (isSuccess) {
            return true;
          }
        }
      } catch (firstError) {
        console.log('recuperarPasswordDriver falló:', firstError);
      }
      
      // Intentar con recuperarPassword
      try {
        const result = await this.client.mutate({
          mutation: gql`
            mutation RecuperarPassword($input: SmsInput!) {
              recuperarPassword(input: $input) {
                status
                message
              }
            }
          `,
          variables: { 
            input: { email } 
          }
        });

        if (result.data?.recuperarPassword) {
          const response: PasswordRecoveryResponse = result.data.recuperarPassword;
          
          const isSuccess = 
            response.status === 'success' ||
            response.status === 'ok' || 
            response.status === 'true' ||
            response.status === 'SUCCESS' ||
            response.message?.toLowerCase().includes('éxito') ||
            response.message?.toLowerCase().includes('enviado') ||
            response.message?.toLowerCase().includes('success');
          
          if (isSuccess) {
            return true;
          }
        }
      } catch (secondError) {
        console.log('recuperarPassword falló:', secondError);
      }
      
      return false;

    } catch (error: any) {
      console.error('Error general en forgotPassword:', error);
      
      if (!error.message.includes('Network error')) {
        return true;
      }
      
      throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }
  }
}

export default new AuthService();