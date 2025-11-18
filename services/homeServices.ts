import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { clientUrl } from '../constants/Urls';

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
  newStatus?: string;
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

  static async changesStatusByProgramming(id: string, newStatus: string, type: string, isConfirmation: boolean = false): Promise<StatusChangeResponse | null> {
    
    const client = createApolloClient();
    
    try {
      if (isConfirmation) {
        return await this.changeStatusService(id, "prog", newStatus);
      } else {
        const result = await client.mutate({
          mutation: gql`
            mutation {
              changesStatusByProgramming(
                input: {
                  id: "${id}",
                  type: "${type}", 
                  newStatus: "${newStatus}"
                }
              ) {
                status
                message
              }
            }
          `,
        });

        if (result.data?.changesStatusByProgramming) {
          return result.data.changesStatusByProgramming;
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      }
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      throw new Error(error.message || 'Error al cambiar el estado');
    }
  }

  static async changeStatusTourism(id: string, newStatus: string, type: string, isConfirmation: boolean = false): Promise<StatusChangeResponse | null> {
    const client = createApolloClient();
    
    try {
      if (isConfirmation) {
        return await this.changeStatusService(id, "tour", newStatus);
      } else {
        const result = await client.mutate({
          mutation: gql`
            mutation {
              changeStatusTourism(
                input: {
                  id: "${id}",
                  type: "${type}",
                  newStatus: "${newStatus}"
                }
              ) {
                status
                message
              }
            }
          `,
        });

        if (result.data?.changeStatusTourism) {
          return result.data.changeStatusTourism;
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      }
    } catch (error: any) {
      console.error('Error cambiando estado turismo:', error);
      throw new Error(error.message || 'Error al cambiar el estado');
    }
  }

  private static async changeStatusService(id: string, serviceType: string, newStatus: string): Promise<StatusChangeResponse> {
    const client = createApolloClient();
    
    const result = await client.mutate({
      mutation: gql`
        mutation ChangeStatusService($id: ID!, $type: String!, $newStatus: String!) {
          ChangeStatusService(input: {
            id: $id,
            type: $type,
            newStatus: $newStatus
          }) {
            status
            message
          }
        }
      `,
      variables: {
        id: id,
        type: serviceType,
        newStatus: newStatus
      },
    });

    if (result.data?.ChangeStatusService) {
      return result.data.ChangeStatusService;
    } else {
      throw new Error('No se pudo actualizar el estado del servicio');
    }
  }
}