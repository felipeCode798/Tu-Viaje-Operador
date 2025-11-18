import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import { clientUrl } from '../constants/Urls';


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
  profile?: string;
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
  id?: string;
  name: string;
  image?: string;
  nit: string;
  comision: number;
  correo: string;
  phone: string;
}

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
      if (credentials.userType === 'Conductor') {

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
                  profile
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


        const loginData: DriverLoginResponse = result.data.loginDriver;
      
        
        if (!loginData.result) {
          throw new Error(loginData.message || 'Credenciales incorrectas');
        }

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

        const loginData: EnterpriseLoginResponseQL = result.data.loginEnterprise;
        
        if (!loginData.result) {
          throw new Error(loginData.message || 'Credenciales incorrectas');
        }

        return {
          result: loginData.result,
          message: loginData.message
        };
      }

    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        console.error('GraphQL Error:', graphQLError);
        throw new Error(graphQLError.message || 'Error al iniciar sesión');
      }
      
      if (error.networkError) {
        console.error('Network Error:', error.networkError);
        throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }
      
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try { 
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