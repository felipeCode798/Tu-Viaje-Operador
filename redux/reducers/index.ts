import { combineReducers } from "redux";
import session from "./session";
import navPages from "./navPages";
import infoRoutes from "./infoRoutes";
import travel from "./travel";
import infoDevice from "./infoDevice";
import infoChat from "./infoChat";
import location from "./location";
import id from "./id";
import permission from "./permission";
import infoProgrammingByDriver from "./infoProgrammingByDriver";
import infoItems from "./infoItems";
import infoStatusProgress from "./infoProgrammingStatusProgress";

// Importa los tipos de cada reducer si los tienes definidos
// import { SessionState } from "./session";
// import { NavPagesState } from "./navPages";
// ... y así para cada reducer

// Si no tienes tipos definidos para cada reducer, puedes inferirlos:
// type InferReducerType<T> = T extends (state: infer S, action: any) => S ? S : never;

// Define el tipo del estado raíz basado en los reducers
export interface RootState {
  session: ReturnType<typeof session>;
  navPages: ReturnType<typeof navPages>;
  infoRoutes: ReturnType<typeof infoRoutes>;
  travel: ReturnType<typeof travel>;
  infoDevice: ReturnType<typeof infoDevice>;
  infoChat: ReturnType<typeof infoChat>;
  location: ReturnType<typeof location>;
  id: ReturnType<typeof id>;
  permission: ReturnType<typeof permission>;
  infoProgrammingByDriver: ReturnType<typeof infoProgrammingByDriver>;
  infoItems: ReturnType<typeof infoItems>;
  infoStatusProgress: ReturnType<typeof infoStatusProgress>;
}

const reducers = combineReducers({
  session,
  navPages,
  infoRoutes,
  travel,
  infoDevice,
  infoChat,
  location,
  id,
  permission,
  infoProgrammingByDriver, 
  infoItems,
  infoStatusProgress,
});

export default reducers;