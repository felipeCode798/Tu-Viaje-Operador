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
    tour?: string; // Añadido desde código JS
    enterprise?: string; // Añadido desde código JS
    status?: string; // Añadido desde código JS
  };
}

export interface Programming {
  startFormatted: any;
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
  tipoProducto?: 'program';
  __typename?: string; // Añadido desde código JS
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
  origen: Place | Place[]; // Modificado para soportar array o objeto único
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
  tipoProducto?: 'tour';
  __typename?: string; // Añadido desde código JS
}

export interface StatusChangeResponse {
  status: boolean;
  message: string;
}

// Nuevas interfaces para los servicios de chat
export interface Passenger {
  _id: string;
  cel: string;
  email: string;
  lastnames: string;
  names: string;
  numberId: string;
  phone: string;
  selectId: string;
  selectOrigen: string;
}

export interface Service {
  id: string;
  passenger: {
    id: string;
    names: string;
    profile: string;
    phone: string;
  };
}

export interface Message {
  id: string;
  msg: string;
  user: string;
  createdAt: string;
}

export interface ChatResponse {
  status: boolean;
  message?: string;
}

// Interfaces para el estado de Redux (basado en tu mapStateToProps)
export interface User {
  idUser: string;
  photo?: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  email: string;
  password?: string;
  tipoUser: string;
  id?: string; // Alias para idUser
  _id?: string; // Alias para idUser
}

export interface NavPages {
  current: string;
  previous: string;
}

export interface Permission {
  status: string;
}

export interface Location {
  location: {
    status: string;
    location: any;
  };
}

export interface InfoItems {
  fechaSalida: string;
  destino: string;
  origen: string;
  fechallegada: string;
  lugarRecogida: string;
  lugarLLegada: string;
  estado: string;
  id: string;
  tipo: string;
  estadoDelProductoPrograma?: string;
  estadoDelProductoTurismo?: string;
  conductor?: string;
}

export interface IdState {
  id: string;
  type: boolean;
}

export interface InfoRoutes {
  idProgrammingSelect: string;
  places: Place[];
  status: string;
  fuec?: string;
  infoProgrammingSelect: {
    origin: string;
    destination: string;
    horaIn: string;
    horaOut: string;
  };
}

// Estado completo de Redux
export interface AppState {
  session: {
    user: User;
  };
  navPages: {
    navPages: NavPages;
  };
  id: IdState;
  permission: Permission;
  location: Location;
  infoItems: InfoItems;
  infoRoutes: InfoRoutes;
}

// Props para componentes
export interface CardComponentProps {
  turism: any; // Esto podría ser más específico basado en tu uso
  programming: Array<Programming | Tourism>;
  infoItems: (item: any) => void;
  currentCoords: (item: any) => void;
  ModalPermissions: () => void;
  cordsFin: (item: any) => void;
  refrescar: () => void;
}

// Para las funciones de formato de fecha
export interface DateFormatFunctions {
  formValidationDateHour12: (hour: string | number) => string;
  formatDate: (timestamp: string | number) => string;
}

export const isProgramming = (item: Programming | Tourism): item is Programming => {
  return (item as Programming).tipoProducto === 'program';
};

export const isTourism = (item: Programming | Tourism): item is Tourism => {
  return (item as Tourism).tipoProducto === 'tour';
};