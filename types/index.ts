// types/index.ts
export interface ProgrammingItem {
  _id: string;
  tipoProducto: 'program' | 'tour';
  statusService: string;
  status: string;
  start?: string;  // Hacer opcional
  ida?: string;    // Hacer opcional
  end?: string;    // Agregar si falta
  vuelta?: string; // Agregar si falta
  tour?: {
    origin: {
      name: string;
    };
    destination: {
      name: string;
    };
  };
  destino?: {
    name: string;
  };
  __typename?: string;
  driver?: {
    names: string;
  };
  places?: any[];
}

export interface TurismItem {
  estadoDelProductoTurismo: string;
}

export interface TurismHandler {
  (item: any): void;
}