import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { clientUrl } from '../constants/Urls';

interface Destination {
  id: string;
  name: string;
}

interface TourismData {
  acomodacion: string;
  alimentacion: boolean;
  banner: string;
  cupos: string;
  dcto: boolean;
  descPaquete: string;
  descAlimentacion: string;
  descEntradas: string;
  descHospedaje: string;
  descTiquetes: string;
  descTraslados: string;
  destino: string;
  dias: string;
  empresa: string;
  entradas: boolean;
  gallery: string[];
  hospedaje: boolean;
  ida: any;
  vuelta: any;
  imagen: string;
  noches: string;
  nombreAuto: string;
  nombreGuia: string;
  nombrePaquete: string;
  places: any[];
  placa: string;
  precio: number;
  precioNino: number;
  precioDcto: number;
  transpote: string;
  tiquetes: boolean;
  traslado: boolean;
  paqueteDiario: boolean;
  cuposPorDiaConfig: any;
}

const createApolloClient = () => {
  const httpLink = createHttpLink({
    uri: clientUrl,
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });
};

export default class TourismServices {
  static async getDestinationsWithoutPaginate(id: string): Promise<Destination[]> {
    const client = createApolloClient();
    
    try {
      console.log("🔍 Obteniendo destinos para ID:", id);

      const response = await client.query({
        query: gql`
          query GetDestinationsWithoutPaginate($id: ID!) {
            getDestinationsWithoutPaginate(id: $id) {
              result {
                id
                name
              }
              message
            }
          }
        `,
        variables: {
          id: id
        },
      });

      console.log("✅ Respuesta de destinos:", response.data);

      const data = response.data.getDestinationsWithoutPaginate;
      if (data.result != null) {
        console.log(data.result);
        return data.result;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Error obteniendo destinos:", error);
      throw error;
    }
  }

static async createTourism(data: TourismData): Promise<any> {
    console.log("<<<<<<<<<<<<<<<<<<<LO QUE ENTRO AL SERVICIO>>>>>>>>>>>>>>>>>>", data);
    
    const client = createApolloClient();
    
    try {
      console.log('✅ Imágenes ya subidas, procediendo con creación del turismo...');
      
      // ✅ CORRECCIÓN: Procesar fechas correctamente
      console.log('📅 Procesando fechas...');
      console.log('  - ida original:', data.ida, 'tipo:', typeof data.ida);
      console.log('  - vuelta original:', data.vuelta, 'tipo:', typeof data.vuelta);

      let idaTimestamp: number;
      let vueltaTimestamp: number;

      if (data.ida && typeof data.ida === 'object' && 'format' in data.ida) {
        // Si es objeto moment
        idaTimestamp = (data.ida as any).valueOf();
      } else if (data.ida instanceof Date) {
        // Si es Date
        idaTimestamp = data.ida.getTime();
      } else {
        // Si ya es timestamp
        idaTimestamp = Number(data.ida);
      }

      if (data.vuelta && typeof data.vuelta === 'object' && 'format' in data.vuelta) {
        vueltaTimestamp = (data.vuelta as any).valueOf();
      } else if (data.vuelta instanceof Date) {
        vueltaTimestamp = data.vuelta.getTime();
      } else {
        vueltaTimestamp = Number(data.vuelta);
      }

      console.log('📅 Timestamps finales:');
      console.log('  - ida:', idaTimestamp);
      console.log('  - vuelta:', vueltaTimestamp);

      // ✅✅✅ CORRECCIÓN CRÍTICA: LIMPIAR LOS OBJETOS DE ORIGEN (REMOVER ADDRESS)
      const origenLimpio = Array.isArray(data.places) ? data.places.map(place => ({
        name: place.name || '',
        latitude: place.latitude || 0,
        longitude: place.longitude || 0
        // ❌ REMOVER: address: place.address (no está en el schema)
      })) : [];

      console.log('📍 Origen limpio (sin address):', origenLimpio);

      const inputData = {
        acomodacion: data.acomodacion,
        alimentacion: data.alimentacion,
        banner: data.banner,
        cupos: parseInt(data.cupos) || 0,
        dcto: data.dcto,
        descripcion: data.descPaquete,
        descripcionAlimentacion: data.descAlimentacion,
        descripcionEntradas: data.descEntradas,
        descripcionHospedaje: data.descHospedaje,
        descripcionTiquetes: data.descTiquetes,
        descripcionTraslado: data.descTraslados,
        destino: data.destino,
        dias: parseInt(data.dias) || 0,
        disponibles: parseInt(data.cupos) || 0,
        empresa: data.empresa,
        entradas: data.entradas,
        gallery: data.gallery,
        hospedaje: data.hospedaje,
        ida: `${idaTimestamp}`,
        vuelta: `${vueltaTimestamp}`,
        imagen: data.imagen,
        noches: parseInt(data.noches) || 0,
        nombre: data.nombreAuto,
        nombreGuia: data.nombreGuia,
        nombrepaq: data.nombrePaquete,
        origen: origenLimpio, // ✅ Usar el origen limpio
        placa: data.placa,
        precio: data.precio,
        precioNino: data.precioNino,
        precioDcto: data.precioDcto,
        tipo: data.transpote,
        tiquetes: data.tiquetes,
        traslado: data.traslado,
        paqueteDiario: data.paqueteDiario,
        cuposPorDiaConfig: data.cuposPorDiaConfig,
      };

      console.log("📤 Datos finales para GraphQL:", JSON.stringify(inputData, null, 2));
      console.log("🐛 Verificación FINAL de tipos:");
      console.log("  - ida:", typeof inputData.ida, "=", inputData.ida);
      console.log("  - vuelta:", typeof inputData.vuelta, "=", inputData.vuelta);
      console.log("  - origen:", Array.isArray(inputData.origen) ? inputData.origen.length : 'no array');

      // ✅ ENVIAR DATOS A GRAPHQL
      const response = await client.mutate({
        mutation: gql`
          mutation createTourism($input: TourismInput) {
            createTourism(input: $input) {
              result {
                _id
              }
              message
            }
          }
        `,
        variables: {
          input: inputData
        },
      });

      console.log("✅ Respuesta del servidor GraphQL:", response.data);

      const responseData = response.data.createTourism;
      if (responseData.message !== "") {
        return responseData;
      } else {
        return null;
      }
    } catch (error: any) {
      console.error("❌ Error en createTourism:", error);
      
      if (error.networkError) {
        console.error("🔌 Error de red:", error.networkError);
        if (error.networkError.result) {
          console.error("🔌 Detalles del error:", JSON.stringify(error.networkError.result, null, 2));
        }
      }
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        console.error("📊 Errores GraphQL:");
        error.graphQLErrors.forEach((graphQLError: any, index: number) => {
          console.error(`📊 Error ${index + 1}:`, graphQLError.message);
          console.error(`📊 Locations:`, graphQLError.locations);
          console.error(`📊 Path:`, graphQLError.path);
        });
      }
      
      throw error;
    }
  }
}