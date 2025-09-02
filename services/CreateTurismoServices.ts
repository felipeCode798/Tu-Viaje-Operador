import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { clientUrl } from "../constants/Urls";

const client = new ApolloClient({
    uri: clientUrl,
});

interface Destination {
    id: string;
    name: string;
}

interface TourismInput {
    acomodacion: any;
    alimentacion: any;
    banner: any;
    cupos: number;
    dcto: any;
    descripcion: string;
    descripcionAlimentacion: string;
    descripcionEntradas: string;
    descripcionHospedaje: string;
    descripcionTiquetes: string;
    descripcionTraslado: string;
    destino: any;
    dias: number;
    disponibles: number;
    empresa: any;
    entradas: any;
    gallery: any[];
    hospedaje: any;
    ida: string;
    vuelta: string;
    imagen: any;
    noches: number;
    nombre: string;
    nombreGuia: string;
    nombrepaq: string;
    origen: any[];
    placa: string;
    precio: number;
    precioNino: number;
    precioDcto: number;
    tipo: any;
    tiquetes: any;
    traslado: any;
    paqueteDiario: any;
    cuposPorDiaConfig: any;
}

interface CreateTourismResponse {
    createTourism: {
        result: {
            _id: string;
        } | null;
        message: string;
    };
}

interface DestinationsResponse {
    getDestinationsWithoutPaginate: {
        result: Destination[] | null;
        message?: string;
    };
}

export default class CreateProgrammingServices {
    static getDestinationsWithoutPaginate(id: string): Promise<Destination[]> {
        return new Promise((resolve, reject) => {
            client
                .query({
                    query: gql`
            query {
              getDestinationsWithoutPaginate(id:"${id.toString()}"){
                result{
                  id
                  name
                }
              }
             }`,
                })
                .then((res) => {
                    const data = res.data as DestinationsResponse;
                    if (data.getDestinationsWithoutPaginate.result != null) {
                        console.log(data.getDestinationsWithoutPaginate.result);
                        resolve(data.getDestinationsWithoutPaginate.result);
                    } else {
                        reject(data.getDestinationsWithoutPaginate.message || "Error fetching destinations");
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });    
    }

    static createTourism(data: TourismInput): Promise<CreateTourismResponse['createTourism']> {
        console.log("<<<<<<<<<<<<<<<<<<<LO QUE ENTRO AL SERVICIO>>>>>>>>>>>>>>>>>>", data);
        
        return new Promise((resolve, reject) => {
            client
                .mutate({
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
                            cupos: parseInt(data.cupos.toString()),
                            dcto: data.dcto,
                            descripcion: data.descripcion,
                            descripcionAlimentacion: data.descripcionAlimentacion,
                            descripcionEntradas: data.descripcionEntradas,
                            descripcionHospedaje: data.descripcionHospedaje,
                            descripcionTiquetes: data.descripcionTiquetes,
                            descripcionTraslado: data.descripcionTraslado,
                            destino: data.destino,
                            dias: parseInt(data.dias.toString()),
                            disponibles: parseInt(data.disponibles.toString()),
                            empresa: data.empresa,
                            entradas: data.entradas,
                            gallery: data.gallery,
                            hospedaje: data.hospedaje,
                            ida: `${Date.parse(data.ida.toString())}`,
                            vuelta: `${Date.parse(data.vuelta.toString())}`,
                            imagen: data.imagen,
                            noches: parseInt(data.noches.toString()),
                            nombre: data.nombre,
                            nombreGuia: data.nombreGuia,
                            nombrepaq: data.nombrepaq,
                            origen: data.origen,
                            placa: data.placa,
                            precio: parseFloat(data.precio.toString()),
                            precioNino: parseFloat(data.precioNino.toString()),
                            precioDcto: parseFloat(data.precioDcto.toString()),
                            tipo: data.tipo,
                            tiquetes: data.tiquetes,
                            traslado: data.traslado,
                            paqueteDiario: data.paqueteDiario,
                            cuposPorDiaConfig: data.cuposPorDiaConfig,
                        },
                    },
                })
                .then((res) => {
                    const responseData = res.data as CreateTourismResponse;
                    if (responseData.createTourism.message !== "") {
                        resolve(responseData.createTourism);
                    } else {
                        resolve(responseData.createTourism);
                    }
                })
                .catch((error) => {
                    reject(error);
                    console.log("there was an error sending the query");
                });
        });
    }
}