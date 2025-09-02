import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { imageUrl, clientUrl } from "../constants/Urls";

const client = new ApolloClient({
  uri: clientUrl,
});

interface Location {
  id: string;
  name: string;
}

interface Tour {
  id: string;
  origin: Location;
  destination: Location;
}

interface Image {
  id: string;
  url: string;
}

interface Bus {
  id: string;
  name: string;
  images: Image[];
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

interface PageInfo {
  page: number;
  totalPages: number;
}

interface ToursResponse {
  getToursEnabled: {
    result: Tour[] | null;
    message: string;
  };
}

interface BusesResponse {
  getBusesByEnterpriseWithoutPaginate: {
    result: Bus[] | null;
    message?: string;
  };
}

interface DriversResponse {
  getDriversByEnterpriseWithoutPaginate: {
    pages: PageInfo;
    result: Driver[] | null;
    message: string;
  };
}

interface CreateProgrammingResponse {
  createProgramming: {
    result: {
      id: string;
    } | null;
    message: string;
  };
}

interface CreateProgrammingData {
  ruta: string;
  vehiculo: string;
  conductor: string;
  documentacion: string;
  dcto: string;
  precioDcto: string;
  place: {
    name: string;
  };
  precio: string;
  start: string;
  end: string;
  disponibles: string;
  id: string;
  places: any[];
  descripcion: string;
  images: any[];
  banner: any;
}

export default class CreateProgrammingServices {
  static getRoutesEnabled(): Promise<Tour[]> {
    return new Promise((resolve, reject) => {
      client
        .query({
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
        })
        .then((res) => {
          const data = res.data as ToursResponse;
          if (data.getToursEnabled.result != null) {
            resolve(data.getToursEnabled.result);
          } else {
            reject(data.getToursEnabled.message);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getBusesEnable(id: string): Promise<Bus[]> {
    return new Promise((resolve, reject) => {
      client
        .query({
          query: gql`
          query {
            getBusesByEnterpriseWithoutPaginate(id:"${id.toString()}"){
              result{
                id
                name
                images{
                  id
                  url
                }
               capacity
               placa
               type
              }
            }
           }`,
        })
        .then((res) => {
          const data = res.data as BusesResponse;
          if (data.getBusesByEnterpriseWithoutPaginate.result != null) {
            resolve(data.getBusesByEnterpriseWithoutPaginate.result);
          } else {
            reject(data.getBusesByEnterpriseWithoutPaginate.message || "Error fetching buses");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getDriversEnable(id: string): Promise<Driver[]> {
    return new Promise((resolve, reject) => {
      client
        .query({
          query: gql`
          query {
            getDriversByEnterpriseWithoutPaginate(id:"${id.toString()}"){
              pages{
                page
                totalPages
              }
              result{
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
          }`,
        })
        .then((res) => {
          const data = res.data as DriversResponse;
          if (data.getDriversByEnterpriseWithoutPaginate.result != null) {
            resolve(data.getDriversByEnterpriseWithoutPaginate.result);
          } else {
            reject(data.getDriversByEnterpriseWithoutPaginate.message);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static createProgramming(data: CreateProgrammingData): Promise<CreateProgrammingResponse['createProgramming']> {
    console.log("ESTA ES LA DATA QUE LLEGA AL CONSUMO DEL SERVICIO", data);

    let precio = 0;
    if (data.precio && data.precio !== "null") {
      precio = parseFloat(data.precio);
    }

    return new Promise((resolve, reject) => {
      client
        .mutate({
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
        })
        .then((res) => {
          console.log("respuesta del subscribe", res);
          const responseData = res.data as CreateProgrammingResponse;
          if (responseData.createProgramming.result != null) {
            resolve(responseData.createProgramming);
          } else {
            resolve(responseData.createProgramming);
          }
        })
        .catch((error) => {
          reject(error);
          console.log("there was an error sending the query");
        });
    });
  }
}