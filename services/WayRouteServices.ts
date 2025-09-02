import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { clientUrl } from "../constants/Urls";
import { store } from "./../redux/store";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Passenger {
  id: string;
  names: string;
  lastName: string;
  profile: string;
  phone: string;
}

interface ServiceResult {
  id: string;
  status: string;
  pickup: any;
  passenger: Passenger;
}

interface UpdateStatusResponse {
  updateStatusService: {
    status: string;
  };
}

interface GetServiceByPlaceResponse {
  getServiceByPlace: {
    result: ServiceResult[] | null;
  };
}

interface UpdateStatusPassengerResponse {
  updateStatusServicePassanger: {
    status: string;
  };
}

interface CreateObservationResponse {
  createObservation: {
    status: string;
  };
}

interface SendPositionResponse {
  sendPosition: {
    status: string;
  };
}

interface SendDateRouteResponse {
  sendDateRoute: {
    status: string;
  };
}

interface RootState {
  infoRoutes: {
    infoRoutes: {
      idProgrammingSelect: string;
    };
  };
}

export default class WayRouteServices {
  static setStatusRoute(idProgramming: string, status: string): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    return new Promise((resolve, reject) => {
      client
        .mutate({
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
        })
        .then((result) => {
          const data = result.data as UpdateStatusResponse;
          if (data.updateStatusService.status === "SUCCESS") {
            resolve(data.updateStatusService.status);
          } else {
            resolve(data.updateStatusService.status);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getPassengersByPlaces(idProgramming: string, place: Coordinate): Promise<ServiceResult[]> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    return new Promise((resolve, reject) => {
      client
        .query({
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
        })
        .then((result) => {
          const data = result.data as GetServiceByPlaceResponse;
          if (data.getServiceByPlace.result !== null) {
            resolve(data.getServiceByPlace.result);
          } else {
            reject("HAY UN PROBLEMA AL OBTENER LA INFORMACION");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static setStatusUser(idService: string, status: string): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    return new Promise((resolve, reject) => {
      client
        .mutate({
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
        })
        .then((result) => {
          const data = result.data as UpdateStatusPassengerResponse;
          if (data.updateStatusServicePassanger.status === "SUCCESS") {
            resolve(data.updateStatusServicePassanger.status);
          } else {
            reject("HAY UN PROBLEMA AL CAMBIAR EL ESTADO");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static sendEvent(idService: string, content: string): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    return new Promise((resolve, reject) => {
      client
        .mutate({
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
        })
        .then((result) => {
          const data = result.data as CreateObservationResponse;
          if (data.createObservation.status === "SUCCESS") {
            resolve(data.createObservation.status);
          } else {
            reject("HAY UN PROBLEMA AL ENVIAR LA EMERGENCIA");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static sendPositionDriver(latitude: number, longitude: number): Promise<string> {
    const client = new ApolloClient({
      uri: clientUrl,
    });
    
    const state = store.getState() as RootState;
    const programmingId = state.infoRoutes.infoRoutes.idProgrammingSelect;

    return new Promise((resolve, reject) => {
      client
        .mutate({
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
              programmingId: programmingId,
            },
          },
        })
        .then((result) => {
          const data = result.data as SendPositionResponse;
          if (data.sendPosition.status === "SUCCESS") {
            resolve(data.sendPosition.status);
          } else {
            reject("HAY UN PROBLEMA AL ENVIAR LA UBICACION");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static sendDateRoute(id: string, campo: string, fecha: Date | string, latitude: number, longitude: number): Promise<string> {
    console.log("Campos de sendDateRoute");
    console.log(id, campo, fecha);
    
    const client = new ApolloClient({
      uri: clientUrl,
    });
    
    return new Promise((resolve, reject) => {
      client
        .mutate({
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
        })
        .then((result) => {
          const data = result.data as SendDateRouteResponse;
          if (data.sendDateRoute.status === "SUCCESS") {
            resolve(data.sendDateRoute.status);
          } else {
            reject("HAY UN PROBLEMA AL ENVIAR LA UBICACION");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}