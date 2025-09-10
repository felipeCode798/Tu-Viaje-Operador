import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { clientUrl } from '../constants/Urls';

interface Destination {
  id: string;
  name: string;
}

interface TourismData {
  acomodacion: string;
  alimentacion: string;
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
  entradas: string;
  gallery: string[];
  hospedaje: string;
  ida: string;
  vuelta: string;
  imagen: string;
  noches: string;
  nombreAuto: string;
  nombreGuia: string;
  nombrePaquete: string;
  places: any[];
  placa: string;
  precio: string;
  precioNino: string;
  precioDcto: string;
  transpote: string;
  tiquetes: string;
  traslado: string;
  paqueteDiario: boolean;
  cuposPorDiaConfig: any[];
}

const client = new ApolloClient({
  uri: clientUrl,
  cache: new InMemoryCache(),
});

export default class TourismServices {
  static async getDestinationsWithoutPaginate(id: string): Promise<Destination[]> {
    try {
      const response = await client.query({
        query: gql`
          query {
            getDestinationsWithoutPaginate(id: "${id}") {
              result {
                id
                name
              }
            }
          }
        `,
      });

      const data = response.data.getDestinationsWithoutPaginate;
      if (data.result != null) {
        console.log(data.result);
        return data.result;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  }

  static async createTourism(data: TourismData): Promise<any> {
    console.log('Data que entra al servicio:', data);

    try {
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
          input: {
            acomodacion: data.acomodacion,
            alimentacion: data.alimentacion,
            banner: data.banner,
            cupos: parseInt(data.cupos),
            dcto: data.dcto,
            descripcion: data.descPaquete,
            descripcionAlimentacion: data.descAlimentacion,
            descripcionEntradas: data.descEntradas,
            descripcionHospedaje: data.descHospedaje,
            descripcionTiquetes: data.descTiquetes,
            descripcionTraslado: data.descTraslados,
            destino: data.destino,
            dias: parseInt(data.dias),
            disponibles: parseInt(data.cupos),
            empresa: data.empresa,
            entradas: data.entradas,
            gallery: data.gallery,
            hospedaje: data.hospedaje,
            ida: `${Date.parse(data.ida)}`,
            vuelta: `${Date.parse(data.vuelta)}`,
            imagen: data.imagen,
            noches: parseInt(data.noches),
            nombre: data.nombreAuto,
            nombreGuia: data.nombreGuia,
            nombrepaq: data.nombrePaquete,
            origen: data.places,
            placa: data.placa,
            precio: parseFloat(data.precio),
            precioNino: parseFloat(data.precioNino),
            precioDcto: parseFloat(data.precioDcto),
            tipo: data.transpote,
            tiquetes: data.tiquetes,
            traslado: data.traslado,
            paqueteDiario: data.paqueteDiario,
            cuposPorDiaConfig: data.cuposPorDiaConfig,
          },
        },
      });

      const responseData = response.data.createTourism;
      if (responseData.message !== '') {
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