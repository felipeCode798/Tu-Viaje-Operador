import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import { clientUrl } from '../constants/Urls';

// Interfaces para la respuesta del conductor
interface PasswordRecoveryResponse {
  status: string; // Puede ser 'success', 'ok', 'true', etc.
  message: string;
}


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

// Interfaces para la respuesta de empresa
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
  id: string;
  name: string;
  image: string;
  nit: string;
  comision: number;
  correo: string;
  phone: string;
}

export interface LoginResponse {
  accessToken: string | undefined;
  result: DriverResponse | EnterpriseLoginResponse;
  message: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'Conductor' | 'Empresa';
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
        // Login para conductor
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
                  identificacion
                  categorialicencia
                  vigencialicencia
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

        if (result.data.loginDriver) {
          return result.data.loginDriver;
        }
      } else {
        // Login para empresa
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

        if (result.data.loginEnterprise) {
          return result.data.loginEnterprise;
        }
      }

      throw new Error('Credenciales inválidas');

    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.networkError && error.networkError.result) {
        console.error('Detalles del error:', error.networkError.result.errors);
      }
      
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      console.log('Solicitando recuperación para:', email);
      
      // PRIMERO intenta con recuperarPasswordDriver
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

        console.log('Respuesta recuperarPasswordDriver:', result.data);
        
        if (result.data?.recuperarPasswordDriver) {
          const response: PasswordRecoveryResponse = result.data.recuperarPasswordDriver;
          console.log('Status recibido:', response.status);
          console.log('Mensaje recibido:', response.message);
          
          // Verificar diferentes formatos de respuesta exitosa
          const isSuccess = 
            response.status === 'success' ||
            response.status === 'ok' || 
            response.status === 'true' ||
            response.status === 'SUCCESS' ||
            response.message?.toLowerCase().includes('éxito') ||
            response.message?.toLowerCase().includes('enviado') ||
            response.message?.toLowerCase().includes('success');
          
          if (isSuccess) {
            console.log('Recuperación exitosa con recuperarPasswordDriver');
            return true;
          }
        }
      } catch (firstError) {
        console.log('recuperarPasswordDriver falló:', firstError);
      }
      
      // LUEGO intenta con recuperarPassword
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

        console.log('Respuesta recuperarPassword:', result.data);
        
        if (result.data?.recuperarPassword) {
          const response: PasswordRecoveryResponse = result.data.recuperarPassword;
          console.log('Status recibido:', response.status);
          console.log('Mensaje recibido:', response.message);
          
          // Verificar diferentes formatos de respuesta exitosa
          const isSuccess = 
            response.status === 'success' ||
            response.status === 'ok' || 
            response.status === 'true' ||
            response.status === 'SUCCESS' ||
            response.message?.toLowerCase().includes('éxito') ||
            response.message?.toLowerCase().includes('enviado') ||
            response.message?.toLowerCase().includes('success');
          
          if (isSuccess) {
            console.log('Recuperación exitosa con recuperarPassword');
            return true;
          }
        }
      } catch (secondError) {
        console.log('recuperarPassword falló:', secondError);
      }
      
      console.log('Ninguna mutación devolvió éxito');
      return false;

    } catch (error: any) {
      console.error('Error general en forgotPassword:', error);
      
      // A veces el correo se envía pero hay errores en la respuesta
      // En este caso, asumimos que fue exitoso si no hay error de red
      if (!error.message.includes('Network error')) {
        console.log('Error no es de red, posiblemente el correo se envió');
        return true;
      }
      
      throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }
  }

  // Método para descubrir mutaciones disponibles (útil para debugging)
  async discoverMutations(): Promise<string[]> {
    try {
      const result = await this.client.query({
        query: gql`
          {
            __schema {
              mutationType {
                fields {
                  name
                  args {
                    name
                    type {
                      name
                      kind
                      ofType {
                        name
                        kind
                      }
                    }
                  }
                }
              }
            }
          }
        `
      });

      const mutations = result.data.__schema.mutationType.fields.map(
        (field: any) => ({
          name: field.name,
          args: field.args.map((arg: any) => ({
            name: arg.name,
            type: arg.type.name || (arg.type.ofType && arg.type.ofType.name) || arg.type.kind
          }))
        })
      );
      
      console.log('Mutaciones disponibles con argumentos:', mutations);
      
      // Filtrar mutaciones relacionadas con password
      const passwordMutations = mutations.filter((mutation: any) => 
        mutation.name.toLowerCase().includes('password') || 
        mutation.name.toLowerCase().includes('recuperar') ||
        mutation.name.toLowerCase().includes('reset')
      );
      
      console.log('Mutaciones de password:', passwordMutations);
      return mutations.map((m: any) => m.name);

    } catch (error) {
      console.error('Error descubriendo mutaciones:', error);
      return [];
    }
  }
}

export default new AuthService();