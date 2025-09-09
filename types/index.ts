// types/index.ts
export interface Place {
  latitude: number;
  longitude: number;
  name: string;
}

export interface Enterprise {
  name: string;
  nit?: string;
}

export interface Bus {
  placa?: string;
  name: string;
  capacity?: number;
}

export interface Driver {
  _id: string;
  names: string;
  lastName?: string;
  email?: string;
}

export interface Tour {
  _id?: string;
  origin: {
    name: string;
  };
  destination: {
    name: string;
    place: Place;
  };
}

export interface Programming {
  _id: string;
  available?: boolean;
  enterprise?: Enterprise;
  statusService: string;
  bus?: Bus;
  tour: Tour;
  places: Place[];
  puntoFin?: Place;
  start: string;
  end: string;
  price?: number;
  pricedcto?: number;
  dcto?: number;
  status: string;
  fuec?: string;
  driver: Driver;
  driverInfo?: Driver;
  tipoProducto?: string;
}

export interface TourismDestination {
  name: string;
  tour?: string;
  place: Place;
  enterprise?: string;
  status?: string;
}

export interface Tourism {
  _id: string;
  empresa?: Enterprise;
  tipo?: string;
  nombre: string;
  placa?: string;
  descripcion?: string;
  alimentacion?: boolean;
  descripcionAlimentacion?: string;
  tiquetes?: boolean;
  descripcionTiquetes?: string;
  hospedaje?: boolean;
  descripcionHospedaje?: string;
  traslado?: boolean;
  descripcionTraslado?: string;
  entradas?: boolean;
  descripcionEntradas?: string;
  origen: Place[];
  destino: TourismDestination;
  ida: string;
  vuelta: string;
  cupos: number;
  disponibles?: number;
  acomodacion?: string;
  dias?: number;
  noches?: number;
  precio: number;
  dcto?: number;
  precioDcto?: number;
  nombreGuia?: string;
  imagen?: string;
  gallery?: string[];
  nombrepaq: string;
  driver?: string;
  status: string;
  statusService: string;
  tipoProducto?: string;
}

export interface StatusChangeResponse {
  status: boolean;
  message: string;
}