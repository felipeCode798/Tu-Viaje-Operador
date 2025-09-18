import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { InMemoryCache } from '@apollo/client/cache/inmemory/inMemoryCache';
import { gql, HttpLink } from '@apollo/client/core/index.js';
import { clientUrl } from '../constants/Urls';

// Interfaces para tipado
interface Origin {
  id: string;
  name: string;
}

interface Destination {
  id: string;
  name: string;
}

interface Route {
  id: string;
  origin: Origin;
  destination: Destination;
}

interface BusImage {
  id: string;
  url: string;
}

interface Bus {
  id: string;
  name: string;
  images: BusImage[];
  capacity: number;
  placa: string;
  type: string;
}

interface Driver {
  id: string;
  names: string;
  phone: string;
  email: string;
  profile: string;
  deviceId: string;
  status: string;
}

interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

interface ProgrammingData {
  ruta: string;
  vehiculo: string;
  conductor: string;
  documentacion: boolean;
  dcto: boolean;
  precioDcto: string;
  place: Place;
  precio: string;
  start: string;
  end: string;
  disponibles: string;
  id: string;
  places: Place[];
  descripcion: string;
  images: string[];
  banner: string;
}

const httpLink = new HttpLink({
  uri: clientUrl,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default class CreateProgrammingServices {
  static async getRoutesEnabled(): Promise<Route[]> {
    try {
      const response = await client.query({
        query: gql`
          query {
            getToursEnabled {
              result {
                id
                origin {
                  id
                  name
                }
                destination {
                  id
                  name
                }
              }
              message
            }
          }
        `,
      });

      const data = response.data.getToursEnabled;
      if (data.result != null) {
        return data.result;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  }

  static async getBusesEnable(id: string): Promise<Bus[]> {
    try {
      const response = await client.query({
        query: gql`
          query {
            getBusesByEnterpriseWithoutPaginate(id: "${id}") {
              result {
                id
                name
                images {
                  id
                  url
                }
                capacity
                placa
                type
              }
            }
          }
        `,
      });

      const data = response.data.getBusesByEnterpriseWithoutPaginate;
      if (data.result != null) {
        return data.result;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  }

  static async getDriversEnable(id: string): Promise<Driver[]> {
    try {
      const response = await client.query({
        query: gql`
          query {
            getDriversByEnterpriseWithoutPaginate(id: "${id}") {
              pages {
                page
                totalPages
              }
              result {
                id
                names
                phone
                email
                profile
                deviceId
                status
              }
              message
            }
          }
        `,
      });

      const data = response.data.getDriversByEnterpriseWithoutPaginate;
      if (data.result != null) {
        return data.result;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  }

  static async createProgramming(data: ProgrammingData): Promise<any> {
    console.log('Data enviada al servicio:', data);

    let precio = 0;
    if (data.precio && data.precio !== 'null') {
      precio = parseFloat(data.precio);
    }

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation createProgramming($input: ProgrammingInput) {
            createProgramming(input: $input) {
              result {
                id
              }
              message
            }
          }
        `,
        variables: {
          input: {
            tour: data.ruta,
            bus: data.vehiculo,
            driver: data.conductor,
            documentacion: data.documentacion,
            dcto: data.dcto,
            pricedcto: parseFloat(data.precioDcto),
            llegada: data.place.name,
            puntoFin: data.place,
            price: precio,
            start: `${Date.parse(data.start)}`,
            end: `${Date.parse(data.end)}`,
            available: parseInt(data.disponibles, 10),
            capacity: parseInt(data.disponibles, 10),
            enterprise: data.id,
            places: data.places,
            descripcion: data.descripcion,
            images: data.images,
            banner: data.banner,
          },
        },
      });

      console.log('Respuesta del servicio:', response);
      const responseData = response.data.createProgramming;
      if (responseData.result != null) {
        return responseData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error enviando la consulta:', error);
      throw error;
    }
  }
}