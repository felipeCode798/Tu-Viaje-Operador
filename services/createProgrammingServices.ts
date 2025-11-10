import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { clientUrl } from "../constants/Urls";

// Interfaces para los tipos de datos
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

interface Place {
  name: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

interface ProgrammingInput {
  tour: string;
  bus: string;
  driver: string;
  documentacion: boolean;
  dcto: boolean;
  pricedcto: number;
  llegada: string;
  puntoFin: Place;
  price: number;
  start: string;
  end: string;
  available: number;
  capacity: number;
  enterprise: string;
  places: Place[];
  descripcion: string;
  images: any[];
  banner: any;
}

interface ProgrammingResponse {
  id?: string;
  result?: {
    id: string;
  };
  data?: {
    createProgramming: {
      result: {
        id: string;
      };
      message: string;
    };
  };
  createProgramming?: {
    result: {
      id: string;
    };
    message: string;
  };
  message?: string;
  [key: string]: any;
}

interface ToursEnabledResponse {
  getToursEnabled: {
    result: Tour[] | null;
    message: string;
  };
}

interface BusesResponse {
  getBusesByEnterpriseWithoutPaginate: {
    result: Bus[] | null;
    message: string;
  };
}

interface DriversResponse {
  getDriversByEnterpriseWithoutPaginate: {
    pages: {
      page: number;
      totalPages: number;
    };
    result: Driver[] | null;
    message: string;
  };
}

const client = new ApolloClient({
  uri: clientUrl,
});

export default class CreateProgrammingServices {
  static getRoutesEnabled(): Promise<Tour[]> {
    return new Promise((resolve, reject) => {
      client
        .query<ToursEnabledResponse>({
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
          fetchPolicy: 'network-only', // Forzar petición fresca
        })
        .then((res) => {
          const data = res.data.getToursEnabled;
          if (data.result != null) {
            resolve(data.result);
          } else {
            reject(new Error(data.message || "Error al obtener rutas"));
          }
        })
        .catch((error) => {
          console.error("❌ Error en getRoutesEnabled:", error);
          reject(error);
        });
    });
  }

  // ✅ CORREGIDO: Cambiar $id de String! a ID!
  static getBusesEnable(id: string): Promise<Bus[]> {
    console.log("🔍 getBusesEnable llamado con ID:", id);
    return new Promise((resolve, reject) => {
      client
        .query<BusesResponse>({
          query: gql`
            query GetBusesByEnterprise($id: ID!) {
              getBusesByEnterpriseWithoutPaginate(id: $id) {
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
          variables: {
            id: id // Ya no necesita .toString() porque GraphQL lo manejará
          },
          fetchPolicy: 'network-only', // Forzar petición fresca
        })
        .then((res) => {
          console.log("✅ Respuesta getBuses:", res);
          const data = res.data.getBusesByEnterpriseWithoutPaginate;
          if (data.result != null) {
            console.log(`✅ ${data.result.length} buses obtenidos`);
            resolve(data.result);
          } else {
            console.error("❌ No hay resultado en getBuses");
            reject(new Error("No se pudieron obtener los buses"));
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching buses:", error);
          reject(error);
        });
    });
  }

  // ✅ CORREGIDO: Cambiar $id de String! a ID!
  static getDriversEnable(id: string): Promise<Driver[]> {
    console.log("🔍 getDriversEnable llamado con ID:", id);
    return new Promise((resolve, reject) => {
      client
        .query<DriversResponse>({
          query: gql`
            query GetDriversByEnterprise($id: ID!) {
              getDriversByEnterpriseWithoutPaginate(id: $id) {
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
          variables: {
            id: id // Ya no necesita .toString() porque GraphQL lo manejará
          },
          fetchPolicy: 'network-only', // Forzar petición fresca
        })
        .then((res) => {
          console.log("✅ Respuesta getDrivers:", res);
          const data = res.data.getDriversByEnterpriseWithoutPaginate;
          if (data.result != null) {
            console.log(`✅ ${data.result.length} conductores obtenidos`);
            resolve(data.result);
          } else {
            console.error("❌ No hay resultado en getDrivers");
            reject(new Error(data.message || "Error al obtener conductores"));
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching drivers:", error);
          reject(error);
        });
    });
  }

  static createProgramming(data: any): Promise<ProgrammingResponse> {
    console.log("📝 Datos para crear programación:", data);

    // Validar y convertir tipos
    const precio = data.precio ? parseFloat(data.precio) : 0;
    const precioDcto = data.precioDcto ? parseFloat(data.precioDcto) : 0;
    const disponibles = data.disponibles ? parseInt(data.disponibles, 10) : 0;
    
    // Convertir fechas a timestamps
    let startTimestamp: number;
    let endTimestamp: number;

    // Manejar fechas que vienen como string ISO
    if (typeof data.start === 'string') {
      startTimestamp = new Date(data.start).getTime();
    } else if (data.start instanceof Date) {
      startTimestamp = data.start.getTime();
    } else {
      return Promise.reject(new Error("Formato de fecha de inicio inválido"));
    }

    if (typeof data.end === 'string') {
      endTimestamp = new Date(data.end).getTime();
    } else if (data.end instanceof Date) {
      endTimestamp = data.end.getTime();
    } else {
      return Promise.reject(new Error("Formato de fecha de fin inválido"));
    }

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return Promise.reject(new Error("Fechas inválidas"));
    }

    // ✅ CORREGIDO: Preparar places según el schema GraphQL (sin address)
    const placesInput = (data.places || []).map((place: any) => ({
      name: place.name || '',
      latitude: place.latitude || 0,
      longitude: place.longitude || 0,
      // ❌ REMOVER: address no está en el schema
    }));

    // ✅ CORREGIDO: Preparar puntoFin según el schema GraphQL (sin address)
    const puntoFinInput = data.place ? {
      name: data.place.name || '',
      latitude: data.place.latitude || 0,
      longitude: data.place.longitude || 0,
      // ❌ REMOVER: address no está en el schema
    } : {};

    // ✅ CORREGIDO: Manejar imágenes correctamente - deben ser strings, no arrays
    const imagesInput = data.images && data.images !== "" ? data.images : "";
    const bannerInput = data.banner && data.banner !== "" ? data.banner : "";

    const input = {
      tour: data.ruta,
      bus: data.vehiculo,
      driver: data.conductor,
      documentacion: Boolean(data.documentacion),
      dcto: Boolean(data.dcto),
      pricedcto: precioDcto,
      llegada: data.place?.name || "",
      puntoFin: puntoFinInput,
      price: precio,
      start: startTimestamp.toString(),
      end: endTimestamp.toString(),
      available: disponibles,
      capacity: disponibles,
      enterprise: data.id,
      places: placesInput,
      descripcion: data.descripcion || "",
      images: imagesInput, // ✅ Ahora es string, no array
      banner: bannerInput, // ✅ Ahora es string, no null
    };

    console.log("📤 Input CORREGIDO para mutation:", JSON.stringify(input, null, 2));

    return new Promise((resolve, reject) => {
      client
        .mutate<{ createProgramming: ProgrammingResponse }>({
          mutation: gql`
            mutation CreateProgramming($input: ProgrammingInput) {
              createProgramming(input: $input) {
                result {
                  id
                }
                message
              }
            }
          `,
          variables: {
            input
          },
        })
        .then((res) => {
          console.log("✅ Respuesta de la mutación:", res);
          if (res.data && res.data.createProgramming) {
            resolve(res.data.createProgramming);
          } else {
            reject(new Error("No data received from mutation"));
          }
        })
        .catch((error) => {
          console.error("❌ Error en mutation:", error);
          if (error.graphQLErrors) {
            console.error("GraphQL Errors:", error.graphQLErrors);
            error.graphQLErrors.forEach((graphQLError: any, index: number) => {
              console.error(`GraphQL Error ${index + 1}:`, graphQLError.message);
              if (graphQLError.locations) {
                console.error(`Locations:`, graphQLError.locations);
              }
              if (graphQLError.path) {
                console.error(`Path:`, graphQLError.path);
              }
            });
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
          reject(error);
        });
    });
  }
}