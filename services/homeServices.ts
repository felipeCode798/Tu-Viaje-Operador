import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { clientUrl } from '../constants/Urls';
import { Programming, StatusChangeResponse, Tourism } from '../types';

const createApolloClient = () => {
  return new ApolloClient({
    uri: clientUrl,
    cache: new InMemoryCache(),
  });
};

export default class HomeServices {
  /**
   * Obtiene los turismos asignados a un conductor para una fecha específica
   */
  static async getTourismsDriver(idDriver: string, dateTime: string): Promise<Tourism[]> {
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query getTourismByDriver($input: tourDriver) {
            getTourismByDriver(input: $input) {
              result {
                _id
                empresa {
                  name
                }
                tipo
                nombre
                placa
                descripcion
                alimentacion
                descripcionAlimentacion
                tiquetes
                descripcionTiquetes
                hospedaje
                descripcionHospedaje
                traslado
                descripcionTraslado
                entradas
                descripcionEntradas
                origen {
                  latitude
                  longitude
                  name
                }
                destino {
                  name
                  tour
                  place {
                    latitude
                    longitude
                    name
                  }
                }
                ida
                vuelta
                cupos
                disponibles
                acomodacion
                dias
                noches
                precio
                dcto
                precioDcto
                nombreGuia
                imagen
                gallery
                nombrepaq
                driver
                status
                statusService
              }
              message
            }
          }
        `,
        variables: {
          input: {
            driver: idDriver,
            start: dateTime,
          },
        },
      });

      return result.data.getTourismByDriver?.result || [];
    } catch (error) {
      console.error('Error fetching tourisms for driver:', error);
      return [];
    }
  }

  /**
   * Obtiene las programaciones asignadas a un conductor para una fecha específica
   */
  static async getProgrammingDriver(idDriver: string, dateTime: string): Promise<Programming[]> {
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query getProgrammingByDriver($input: ProgrammingInputSearch) {
            getProgrammingByDriver(input: $input) {
              result {
                _id
                available
                enterprise {
                  name
                  nit
                }
                statusService
                bus {
                  placa
                  name
                  capacity
                }
                tour {
                  origin {
                    name
                  }
                  destination {
                    name
                    place {
                      latitude
                      longitude
                      name
                    }
                  }
                }
                places {
                  latitude
                  longitude
                  name
                }
                puntoFin {
                  latitude
                  longitude
                  name
                }
                start
                end
                price
                pricedcto
                dcto
                status
                fuec
                driver {
                  _id
                }
                driverInfo {
                  names
                  lastName
                  email
                }
              }
            }
          }
        `,
        variables: {
          input: {
            driver: idDriver,
            start: dateTime,
          },
        },
      });

      return result.data.getProgrammingByDriver?.result || [];
    } catch (error) {
      console.error('Error fetching programming for driver:', error);
      return [];
    }
  }

  /**
   * Obtiene las programaciones de una empresa para una fecha específica
   */
  static async getProgrammingsEnterprise(idEnterprise: string, dateTime: string): Promise<Programming[]> {
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query getProgrammingsByEnterprise($input: programmingInputEnterprise) {
            getProgrammingsByEnterprise(input: $input) {
              result {
                _id
                start
                end
                places {
                  latitude
                  longitude
                  name
                }
                puntoFin {
                  latitude
                  longitude
                  name
                }
                status
                statusService
                tour {
                  _id
                  origin {
                    name
                  }
                  destination {
                    name
                    place {
                      longitude
                      latitude
                      name
                    }
                  }
                }
                driver {
                  names
                  _id
                }
                bus {
                  name
                }
              }
            }
          }
        `,
        variables: {
          input: {
            driver: idEnterprise,
            start: dateTime,
          },
        },
      });

      return result.data.getProgrammingsByEnterprise?.result || [];
    } catch (error) {
      console.error('Error fetching enterprise programmings:', error);
      return [];
    }
  }

  /**
   * Obtiene los turismos de una empresa para una fecha específica
   */
  static async getTourismByEnterprises(idEnterprise: string, dateTime: string): Promise<Tourism[]> {
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query getTourismByEnterprises($input: InputgetTourismByEnterprises) {
            getTourismByEnterprises(input: $input) {
              _id
              driver
              status
              nombre
              cupos
              precio
              ida
              vuelta
              destino {
                name
                place {
                  latitude
                  longitude
                  name
                }
                enterprise
                status
              }
              origen {
                latitude
                longitude
                name
              }
              nombrepaq
              status
              statusService
            }
          }
        `,
        variables: {
          input: {
            id: idEnterprise,
            start: dateTime,
          },
        },
      });

      return result.data.getTourismByEnterprises || [];
    } catch (error) {
      console.error('Error fetching enterprise tourisms:', error);
      return [];
    }
  }

  /**
   * Cambia el estado de una programación
   */
  static async changesStatusByProgramming(
    id: string, 
    newStatus: string, 
    type: string
  ): Promise<StatusChangeResponse | null> {
    const client = createApolloClient();
    
    try {
      const result = await client.mutate({
        mutation: gql`
          mutation changesStatusByProgramming($input: ChangeStatusInput!) {
            changesStatusByProgramming(input: $input) {
              status
              message
            }
          }
        `,
        variables: {
          input: {
            id,
            type,
            newStatus,
          },
        },
      });

      return result.data?.changesStatusByProgramming || null;
    } catch (error) {
      console.error('Error changing programming status:', error);
      return null;
    }
  }

  /**
   * Cambia el estado de un turismo
   */
  static async changeStatusTourism(
    id: string, 
    newStatus: string, 
    type: string
  ): Promise<StatusChangeResponse | null> {
    const client = createApolloClient();
    
    try {
      const result = await client.mutate({
        mutation: gql`
          mutation changeStatusTourism($input: ChangeStatusInput!) {
            changeStatusTourism(input: $input) {
              status
              message
            }
          }
        `,
        variables: {
          input: {
            id,
            type,
            newStatus,
          },
        },
      });

      return result.data?.changeStatusTourism || null;
    } catch (error) {
      console.error('Error changing tourism status:', error);
      return null;
    }
  }
}