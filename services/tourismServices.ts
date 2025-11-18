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

interface TourismResponse {
  _id?: string;
  id?: string;
  result?: {
    _id: string;
    id?: string;
  };
  data?: {
    createTourism: {
      result: {
        _id: string;
        id?: string;
      };
      message: string;
    };
  };
  createTourism?: {
    result: {
      _id: string;
      id?: string;
    };
    message: string;
  };
  message?: string;
  [key: string]: any;
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

      const data = response.data.getDestinationsWithoutPaginate;
      if (data.result != null) {
        return data.result;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error obteniendo destinos:", error);
      throw error;
    }
  }

  static async createTourism(data: TourismData): Promise<TourismResponse> {
      console.log("<<<<<<<<<<<<<<<<<<<LO QUE ENTRO AL SERVICIO>>>>>>>>>>>>>>>>>>", data);
      
      const client = createApolloClient();
      
      try {
        console.log('✅ Imágenes ya subidas, procediendo con creación del turismo...');
        
        // ✅✅✅ CORRECCIÓN CRÍTICA: Procesar fechas correctamente
        console.log('📅 Procesando fechas...');
        console.log('  - ida original:', data.ida, 'tipo:', typeof data.ida);
        console.log('  - vuelta original:', data.vuelta, 'tipo:', typeof data.vuelta);

        let idaTimestamp: number;
        let vueltaTimestamp: number;

        // ✅ CORRECCIÓN: Manejar fechas como strings ISO
        if (typeof data.ida === 'string') {
          // Si es string ISO, convertir a timestamp
          try {
            const fechaIda = new Date(data.ida);
            idaTimestamp = fechaIda.getTime();
            
            if (isNaN(idaTimestamp)) {
              console.error("❌ Fecha ida inválida:", data.ida);
              throw new Error("Fecha de ida inválida: " + data.ida);
            }
            console.log("✅ Fecha ida convertida:", data.ida, "->", idaTimestamp);
          } catch (error) {
            console.error("❌ Error convirtiendo fecha ida:", error);
            throw new Error("Error al procesar fecha de ida");
          }
        } else if (data.ida instanceof Date) {
          // Si es Date
          idaTimestamp = data.ida.getTime();
          console.log("✅ Fecha ida (Date):", idaTimestamp);
        } else if (typeof data.ida === 'number') {
          // Si ya es timestamp
          idaTimestamp = data.ida;
          console.log("✅ Fecha ida (timestamp):", idaTimestamp);
        } else {
          console.error("❌ Tipo de fecha ida no soportado:", typeof data.ida);
          throw new Error("Tipo de fecha de ida no soportado");
        }

        // ✅ CORRECCIÓN: Manejar fecha de vuelta
        if (typeof data.vuelta === 'string') {
          try {
            const fechaVuelta = new Date(data.vuelta);
            vueltaTimestamp = fechaVuelta.getTime();
            
            if (isNaN(vueltaTimestamp)) {
              console.error("❌ Fecha vuelta inválida:", data.vuelta);
              throw new Error("Fecha de vuelta inválida: " + data.vuelta);
            }
            console.log("✅ Fecha vuelta convertida:", data.vuelta, "->", vueltaTimestamp);
          } catch (error) {
            console.error("❌ Error convirtiendo fecha vuelta:", error);
            throw new Error("Error al procesar fecha de vuelta");
          }
        } else if (data.vuelta instanceof Date) {
          vueltaTimestamp = data.vuelta.getTime();
          console.log("✅ Fecha vuelta (Date):", vueltaTimestamp);
        } else if (typeof data.vuelta === 'number') {
          vueltaTimestamp = data.vuelta;
          console.log("✅ Fecha vuelta (timestamp):", vueltaTimestamp);
        } else {
          console.error("❌ Tipo de fecha vuelta no soportado:", typeof data.vuelta);
          throw new Error("Tipo de fecha de vuelta no soportado");
        }

        console.log('📅 Timestamps finales:');
        console.log('  - ida:', idaTimestamp, '(tipo:', typeof idaTimestamp, ')');
        console.log('  - vuelta:', vueltaTimestamp, '(tipo:', typeof vueltaTimestamp, ')');

        // ✅ CORRECCIÓN: LIMPIAR LOS OBJETOS DE ORIGEN (REMOVER ADDRESS)
        const origenLimpio = Array.isArray(data.places) ? data.places.map(place => ({
          name: place.name || '',
          latitude: place.latitude || 0,
          longitude: place.longitude || 0
          // ❌ REMOVER: address: place.address (no está en el schema)
        })) : [];

        console.log('📍 Origen limpio (sin address):', origenLimpio);

        // ✅ CORRECCIÓN: Formatear cuposPorDiaConfig para que coincida con el schema GraphQL
        const cuposPorDiaConfigFormateado: any = {};
        if (data.cuposPorDiaConfig) {
          for (const [dia, cupos] of Object.entries(data.cuposPorDiaConfig)) {
            // Convertir nombres de días al formato que espera el backend
            const diaFormateado = dia
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remover tildes
              .toLowerCase();
            
            cuposPorDiaConfigFormateado[diaFormateado] = parseInt(cupos as string) || 0;
          }
        }

        console.log('🔢 Cupos por día formateados:', cuposPorDiaConfigFormateado);

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
          ida: idaTimestamp.toString(), // ✅ Ya es número válido
          vuelta: vueltaTimestamp.toString(), // ✅ Ya es número válido
          imagen: data.imagen,
          noches: parseInt(data.noches) || 0,
          nombre: data.nombreAuto,
          nombreGuia: data.nombreGuia,
          nombrepaq: data.nombrePaquete,
          origen: origenLimpio,
          placa: data.placa,
          precio: data.precio,
          precioNino: data.precioNino,
          precioDcto: data.precioDcto,
          tipo: data.transpote,
          tiquetes: data.tiquetes,
          traslado: data.traslado,
          paqueteDiario: data.paqueteDiario,
          cuposPorDiaConfig: cuposPorDiaConfigFormateado,
        };

        console.log("📤 Datos finales para GraphQL:", JSON.stringify(inputData, null, 2));
        console.log("🐛 Verificación FINAL de tipos:");
        console.log("  - ida:", typeof inputData.ida, "=", inputData.ida);
        console.log("  - vuelta:", typeof inputData.vuelta, "=", inputData.vuelta);
        console.log("  - origen:", Array.isArray(inputData.origen) ? inputData.origen.length : 'no array');
        console.log("  - cuposPorDiaConfig:", inputData.cuposPorDiaConfig);

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
        
        // ✅ DEVOLVER LA RESPUESTA COMPLETA
        const tourismResponse: TourismResponse = {
          ...responseData,
          data: response.data,
          createTourism: responseData
        };
        
        console.log("📋 Respuesta formateada para el cliente:", tourismResponse);
        
        if (responseData.message !== "") {
          return tourismResponse;
        } else {
          return tourismResponse;
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
            
            // ✅ INFORMACIÓN ADICIONAL PARA DEBUG
            if (graphQLError.extensions) {
              console.error(`📊 Extensions:`, graphQLError.extensions);
            }
          });
        }
        
        throw error;
      }
  }
}