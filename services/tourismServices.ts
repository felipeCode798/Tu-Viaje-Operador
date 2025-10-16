import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { clientUrl } from '../constants/Urls';
import { helpers } from '../utils/helpers';

interface Destination {
  id: string;
  name: string;
}

interface ImageOption {
  name: string;
  file: string;
  fileF: any;
  base64: string;
}

interface TourismData {
  acomodacion: string;
  alimentacion: boolean;
  banner: any;
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
  gallery: any[];
  hospedaje: boolean;
  ida: any;
  vuelta: any;
  imagen: any;
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
      // Función interna para subir imágenes
      const sendUpload = async (): Promise<{imgPrincipal: string, imgBanner: string, imgGallery: string[]}> => {
        return new Promise(async (resolve, reject) => {
          try {
            console.log('🔄 Subiendo imágenes al servidor...');

            let imgPrincipal = '';
            let imgBanner = '';
            let imgGallery: string[] = [];

            // ✅ Subir imagen principal
            if (data.imagen && data.imagen.file) {
              console.log('📤 Subiendo imagen principal...');
              imgPrincipal = await helpers.uploadImages(
                data.imagen,
                data.empresa,
                'turismo',
                data.nombrePaquete,
                'principal'
              );
              console.log('✅ Imagen principal subida:', imgPrincipal);
            }

            // ✅ Subir imagen banner
            if (data.banner && data.banner.file) {
              console.log('📤 Subiendo imagen banner...');
              imgBanner = await helpers.uploadImages(
                data.banner,
                data.empresa,
                'turismo',
                data.nombrePaquete,
                'banner'
              );
              console.log('✅ Imagen banner subida:', imgBanner);
            }

            // ✅ Subir galería de imágenes
            if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
              console.log(`📤 Subiendo ${data.gallery.length} imágenes de galería...`);
              
              for (let i = 0; i < data.gallery.length; i++) {
                const galleryItem = data.gallery[i];
                
                if (galleryItem && galleryItem.file) {
                  const galleryImage = await helpers.uploadImages(
                    galleryItem,
                    data.empresa,
                    'turismo',
                    data.nombrePaquete,
                    'gallery'
                  );
                  
                  imgGallery.push(galleryImage);
                  console.log(`✅ Imagen ${i + 1} de galería subida:`, galleryImage);
                }
              }
            }

            const result = {
              imgPrincipal,
              imgBanner,
              imgGallery
            };

            console.log('✅ Todas las imágenes subidas:', result);
            resolve(result);
            
          } catch (error) {
            console.error('❌ Error subiendo imágenes:', error);
            reject(error);
          }
        });
      };

      // Subir imágenes primero
      console.log('📤 Iniciando subida de imágenes...');
      const uploadedImages = await sendUpload();
      
      console.log('✅ URLs de imágenes subidas:', uploadedImages);

      // ✅✅✅ CRÍTICO: USAR Date.parse() COMO EN EL CÓDIGO ANTERIOR ✅✅✅
      console.log('📅 Procesando fechas...');
      console.log('  - ida original:', data.ida, 'tipo:', typeof data.ida);
      console.log('  - vuelta original:', data.vuelta, 'tipo:', typeof data.vuelta);

      // ✅ CORREGIDO: Usar Date.parse() exactamente como en el código anterior
      const idaTimestamp = Date.parse(data.ida);
      const vueltaTimestamp = Date.parse(data.vuelta);

      console.log('📅 Fechas después de conversión a timestamp:');
      console.log('  - ida timestamp:', idaTimestamp);
      console.log('  - vuelta timestamp:', vueltaTimestamp);

      // ✅ Asegurar que los precios sean números
      const precioNumero = data.precio;
      const precioNinoNumero = data.precioNino;
      const precioDctoNumero = data.precioDcto;

      console.log('💰 Precios convertidos:');
      console.log('  - precio:', precioNumero);
      console.log('  - precioNino:', precioNinoNumero);
      console.log('  - precioDcto:', precioDctoNumero);

      // ✅ CONSTRUIR OBJETO PARA GRAPHQL (EXACTO COMO CÓDIGO ANTERIOR)
      const inputData = {
        acomodacion: data.acomodacion,
        alimentacion: data.alimentacion,
        banner: uploadedImages.imgBanner,
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
        gallery: uploadedImages.imgGallery,
        hospedaje: data.hospedaje,
        // ✅✅✅ LÍNEAS CRÍTICAS - USAR TIMESTAMPS COMO EN CÓDIGO ANTERIOR ✅✅✅
        ida: `${idaTimestamp}`,        // ← DEBE ser string del timestamp
        vuelta: `${vueltaTimestamp}`,  // ← DEBE ser string del timestamp
        imagen: uploadedImages.imgPrincipal,
        noches: parseInt(data.noches) || 0,
        nombre: data.nombreAuto,
        nombreGuia: data.nombreGuia,
        nombrepaq: data.nombrePaquete,
        origen: data.places,
        placa: data.placa,
        precio: precioNumero,
        precioNino: precioNinoNumero,
        precioDcto: precioDctoNumero,
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
      console.log("  - precio:", typeof inputData.precio, "=", inputData.precio);

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
      }
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        console.error("📊 Errores GraphQL:", error.graphQLErrors);
      }
      
      throw error;
    }
  }
}