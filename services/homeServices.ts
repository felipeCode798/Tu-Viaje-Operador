import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { clientUrl } from '../constants/Urls';

// Interfaces para tipado
interface Enterprise {
  name: string;
  nit?: string;
  comision?: number;
  correo?: string;
  phone?: string;
}

interface Tourism {
  _id: string;
  empresa: Enterprise;
  tipo: string;
  nombre: string;
  placa: string;
  descripcion: string;
  alimentacion: string;
  descripcionAlimentacion: string;
  tiquetes: string;
  descripcionTiquetes: string;
  hospedaje: string;
  descripcionHospedaje: string;
  traslado: string;
  descripcionTraslado: string;
  entradas: string;
  descripcionEntradas: string;
  origen: {
    latitude: number;
    longitude: number;
    name: string;
  };
  destino: {
    name: string;
    tour?: string;
    place: {
      latitude: number;
      longitude: number;
      name: string;
    };
  };
  ida: string;
  vuelta: string;
  cupos: number;
  disponibles: number;
  acomodacion: string;
  dias: number;
  noches: number;
  precio: number;
  dcto: boolean;
  precioDcto: number;
  nombreGuia: string;
  imagen: string;
  gallery: string[];
  nombrepaq: string;
  driver: string;
  status: string;
  statusService: string;
}

interface Programming {
  _id: string;
  available: number;
  enterprise: Enterprise;
  statusService: string;
  bus: {
    placa: string;
    name: string;
    capacity: number;
  };
  tour: {
    origin: {
      name: string;
    };
    destination: {
      name: string;
      place: {
        latitude: number;
        longitude: number;
        name: string;
      };
    };
  };
  places: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
  puntoFin: {
    latitude: number;
    longitude: number;
    name: string;
  };
  start: string;
  end: string;
  price: number;
  pricedcto: number;
  dcto: boolean;
  status: string;
  fuec: string;
  driver: {
    _id: string;
  };
  driverInfo: {
    names: string;
    lastName: string;
    email: string;
  };
}

interface StatusChangeResponse {
  status: string;
  message: string;
}

const createApolloClient = () => {
  const httpLink = createHttpLink({
    uri: clientUrl,
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Configuración para evitar problemas de cache
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
      query: {
        fetchPolicy: 'network-only',
      },
    }
  });
};

export default class HomeServices {
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

      if (result.data.getTourismByDriver.result !== null) {
        return result.data.getTourismByDriver.result;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching tourisms for driver:', error);
      return [];
    }
  }

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

      if (result.data.getProgrammingByDriver.result !== null) {
        return result.data.getProgrammingByDriver.result;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching programming for driver:', error);
      return [];
    }
  }

  static async getProgrammingsEnterprise(idEnterprise: string, dateTime: string): Promise<Programming[]> {
    const client = createApolloClient();
    
    try {
      const result = await client.query({
        query: gql`
          query {
            getProgrammingsByEnterprise(
              input: {
                driver: "${idEnterprise}"
                start: "${dateTime}"
              }
            ) {
              result {
                _id
                start
                end
                places {
                  latitude
                  longitude
                  name
                }
                puntoFin{
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
      });

      if (result.data.getProgrammingsByEnterprise.result !== null) {
        return result.data.getProgrammingsByEnterprise.result;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching enterprise programmings:', error);
      return [];
    }
  }

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

      if (result != null) {
        return result.data.getTourismByEnterprises;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching enterprise tourisms:', error);
      return [];
    }
  }

  static async changesStatusByProgramming(id: string, newStatus: string, type: string): Promise<StatusChangeResponse | null> {
    console.log('-------------Entro al servicio de cambio de ESTADO con estas props : ', 'ID', id, 'NUEVO ESTADO', newStatus, 'TIPO', type);
    
    const client = createApolloClient();
    
    try {
      const result = await client.mutate({
        mutation: gql`
          mutation{
            changesStatusByProgramming(
              input : {
                id :"${id}",
                type : "${type}",
                newStatus: "${newStatus}"
              } 
            ){
              status
              message
            }
          }
        `,
      });

      console.log('------HOLA ESTA ES LA REPUESTA DEL SERVICIO DE CAMBIO DE ESTADO EN PROGRAMACION!!!!!!!!!', result);
      
      if (result != null) {
        return result.data.changesStatusByProgramming;
      } else {
        return null;
      }
    } catch (error) {
      console.error('ERROR EN EL SERVICIO PURO', error);
      return null;
    }
  }

  static async changeStatusTourism(id: string, newStatus: string, type: string): Promise<StatusChangeResponse | null> {
    console.log('entro al servicio de cambio de status con estas props : ', id, newStatus, type);
    
    const client = createApolloClient();
    
    try {
      const result = await client.mutate({
        mutation: gql`
          mutation{
            changeStatusTourism(
              input : {
                id :"${id}",
                type : "${type}",
                newStatus: "${newStatus}"
              } 
            ){
              status
              message
            }
          }
        `,
      });

      console.log('ESTA ES LA REPUESTA DEL SERVICIO DE CAMBIO DE ESTADO EN TURISMO!!!!!!!!!', result);
      
      if (result != null) {
        return result.data.changeStatusTourism;
      } else {
        return null;
      }
    } catch (error) {
      console.error('ERROR EN EL SERVICIO PURO', error);
      return null;
    }
  }
}