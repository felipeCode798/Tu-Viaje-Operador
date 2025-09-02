import { applyMiddleware, compose, createStore, Store } from "redux";
import { persistReducer, PersistConfig } from "redux-persist";
import { createLogger } from "redux-logger";
import reducers from "./reducers";
import thunk from "redux-thunk";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define el tipo del estado raíz basado en tus reducers
type RootState = ReturnType<typeof reducers>;

const loggerMiddleware = createLogger({ predicate: () => false });

// Configuración de persistencia con tipo
const persistConfig: PersistConfig<RootState> = {
  key: "root", 
  storage: AsyncStorage,
  blacklist: ["filter", "modals"] as (keyof RootState)[],
};

const persistedReducer = persistReducer(persistConfig, reducers);

function configureStore(initialState: Partial<RootState>): Store<RootState> {
  const enhancer = compose(applyMiddleware(thunk, loggerMiddleware));
  return createStore(persistedReducer, initialState as any, enhancer);
}

const initialState: Partial<RootState> = {};
export const store = configureStore(initialState);

// Tipo para el store exportado
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;