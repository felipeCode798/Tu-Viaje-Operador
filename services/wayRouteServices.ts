import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { clientUrl } from '../constants/Urls';
import { store } from '../redux/store';

interface Passenger {
  id: string;
  names: string;
  lastName: string;
  profile: string;
  phone: string;
}

interface ServiceByPlace {
  id: string;
  status: string;
  pickup: boolean;
  passenger: Passenger;
}

interface Place {
  latitude: number;
  longitude: number;
}

export default class WayRouteServices {
  static async setStatusRoute(idProgramming: string, status: string): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation updateStatusService($input: ServicesInput) {
            updateStatusService(input: $input) {
              status
            }
          }
        `,
        variables: {
          input: {
            programming: idProgramming,
            status: status,
          },
        },
      });

      return response.data.updateStatusService.status;
    } catch (error) {
      throw error;
    }
  }

  static async getPassengersByPlaces(idProgramming: string, place: Place): Promise<ServiceByPlace[]> {
    const client = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });

    try {
      const response = await client.query({
        query: gql`
          query getServiceByPlace($input: ServicesInput) {
            getServiceByPlace(input: $input) {
              result {
                id
                status
                pickup
                passenger {
                  id
                  names
                  lastName
                  profile
                  phone
                }
              }
            }
          }
        `,
        variables: {
          input: {
            programming: idProgramming,
            place: {
              latitude: parseFloat(place.latitude.toString()),
              longitude: parseFloat(place.longitude.toString()),
            },
          },
        },
      });

      if (response.data.getServiceByPlace.result !== null) {
        return response.data.getServiceByPlace.result;
      } else {
        throw new Error('HAY UN PROBLEMA AL OBTENER LA INFORMACION');
      }
    } catch (error) {
      throw error;
    }
  }

  static async setStatusUser(idService: string, status: string): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation updateStatusServicePassanger($input: ServicesInput) {
            updateStatusServicePassanger(input: $input) {
              status
            }
          }
        `,
        variables: {
          input: {
            status: status,
            serviceId: idService,
          },
        },
      });

      if (response.data.updateStatusServicePassanger.status === 'SUCCESS') {
        return response.data.updateStatusServicePassanger.status;
      } else {
        throw new Error('HAY UN PROBLEMA AL CAMBIAR EL ESTADO');
      }
    } catch (error) {
      throw error;
    }
  }

  static async sendEvent(idService: string, content: string): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation createObservation($input: observationInput) {
            createObservation(input: $input) {
              status
            }
          }
        `,
        variables: {
          input: {
            content: content,
            service: idService,
          },
        },
      });

      if (response.data.createObservation.status === 'SUCCESS') {
        return response.data.createObservation.status;
      } else {
        throw new Error('HAY UN PROBLEMA AL ENVIAR LA EMERGENCIA');
      }
    } catch (error) {
      throw error;
    }
  }

  static async sendPositionDriver(latitude: number, longitude: number): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation sendPosition($input: positionInput) {
            sendPosition(input: $input) {
              status
            }
          }
        `,
        variables: {
          input: {
            latitude: latitude,
            longitude: longitude,
            programmingId: store.getState().infoRoutes.idProgrammingSelect,
          },
        },
      });

      if (response.data.sendPosition.status === 'SUCCESS') {
        return response.data.sendPosition.status;
      } else {
        throw new Error('HAY UN PROBLEMA AL ENVIAR LA UBICACION');
      }
    } catch (error) {
      throw error;
    }
  }

  static async sendDateRoute(
    id: string,
    campo: string,
    fecha: Date,
    latitude: number,
    longitude: number
  ): Promise<string> {
    console.log('Campos de sendDateRoute');
    console.log(id, campo, fecha);

    const client = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation sendDateRoute($input: dateProgramming) {
            sendDateRoute(input: $input) {
              status
            }
          }
        `,
        variables: {
          input: {
            id: id,
            campo: campo,
            fecha: fecha.toString(),
            latitude: latitude,
            longitude: longitude,
          },
        },
      });

      if (response.data.sendDateRoute.status === 'SUCCESS') {
        return response.data.sendDateRoute.status;
      } else {
        throw new Error('HAY UN PROBLEMA AL ENVIAR LA UBICACION');
      }
    } catch (error) {
      throw error;
    }
  }
}