import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

// Interfaces para los NUEVOS reducers que necesita CreateProgramming
interface User {
  idUser: string;
  photo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  tipoUser: string;
}

interface SessionState {
  user: User | null;
}

interface NavPagesState {
  current: string;
  previous: string;
}

// Interfaces existentes (las que ya tenías)
interface Passenger {
  id: string;
  names: string;
  phone: string;
  profile?: string;
}

interface Programming {
  id: string;
  route: string;
  company: string;
  vehicle: string;
  confirmation: string;
  status: string;
  departureDate: string;
  departureTime: string;
  pickupLocation: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalLocation: string;
  passengers: Passenger[];
  driverLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface InfoRoutesState {
  currentProgramming: Programming | null;
  idProgrammingSelect: string | null;
  isLoading: boolean;
  error: string | null;
}

interface MapState {
  driverLocation: {
    latitude: number;
    longitude: number;
  } | null;
  passengers: Array<{
    id: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }>;
  routeCoordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
}

// Initial states para los NUEVOS reducers
const initialSessionState: SessionState = {
  user: null
};

const initialNavPagesState: NavPagesState = {
  current: 'HomeScreen',
  previous: 'HomeScreen'
};

// Initial states existentes (los que ya tenías)
const initialInfoRoutesState: InfoRoutesState = {
  currentProgramming: null,
  idProgrammingSelect: null,
  isLoading: false,
  error: null,
};

const initialMapState: MapState = {
  driverLocation: null,
  passengers: [],
  routeCoordinates: [],
};

// ✅ NUEVOS SLICES que necesita CreateProgramming
const sessionSlice = createSlice({
  name: 'session',
  initialState: initialSessionState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

const navPagesSlice = createSlice({
  name: 'navPages',
  initialState: initialNavPagesState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.current = action.payload;
    },
    setPreviousPage: (state, action: PayloadAction<string>) => {
      state.previous = action.payload;
    },
  },
});

const idSlice = createSlice({
  name: 'id',
  initialState: { value: '' } as { value: string },
  reducers: {
    setId: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearId: (state) => {
      state.value = '';
    },
  },
});

// Slices existentes (los que ya tenías)
const infoRoutesSlice = createSlice({
  name: 'infoRoutes',
  initialState: initialInfoRoutesState,
  reducers: {
    setProgramming: (state, action: PayloadAction<Programming>) => {
      state.currentProgramming = action.payload;
    },
    setIdProgrammingSelect: (state, action: PayloadAction<string>) => {
      state.idProgrammingSelect = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateDriverLocation: (state, action: PayloadAction<{ latitude: number; longitude: number; address: string }>) => {
      if (state.currentProgramming) {
        state.currentProgramming.driverLocation = action.payload;
      }
    },
    updateProgrammingStatus: (state, action: PayloadAction<string>) => {
      if (state.currentProgramming) {
        state.currentProgramming.status = action.payload;
      }
    },
    clearInfoRoutes: (state) => {
      state.currentProgramming = null;
      state.idProgrammingSelect = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

const mapSlice = createSlice({
  name: 'map',
  initialState: initialMapState,
  reducers: {
    setDriverLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.driverLocation = action.payload;
    },
    updatePassengersLocations: (state, action: PayloadAction<Array<{ id: string; location: { latitude: number; longitude: number } }>>) => {
      // ✅ Validar que siempre sea un array
      state.passengers = Array.isArray(action.payload) ? action.payload : [];
    },
    setRouteCoordinates: (state, action: PayloadAction<Array<{ latitude: number; longitude: number }>>) => {
      // ✅ Validar que siempre sea un array
      state.routeCoordinates = Array.isArray(action.payload) ? action.payload : [];
    },
    clearMap: (state) => {
      state.driverLocation = null;
      state.passengers = [];
      state.routeCoordinates = [];
    },
  },
});

// ✅ Combinar TODOS los reducers
const rootReducer = combineReducers({
  // Nuevos reducers para CreateProgramming
  session: sessionSlice.reducer,
  navPages: navPagesSlice.reducer,
  id: idSlice.reducer,
  // Reducers existentes
  infoRoutes: infoRoutesSlice.reducer,
  map: mapSlice.reducer,
});

// ✅ CONFIGURACIÓN SEGURA DE PERSISTENCIA
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  blacklist: ["infoRoutes", "map"],
  timeout: 0, // Sin timeout para evitar problemas
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Store configuration CON MEJOR MANEJO DE ERRORES
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignorar ciertos paths si es necesario
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: [],
      },
    }).concat(() => (next: (arg0: any) => any) => (action: any) => {
      try {
        return next(action);
      } catch (error) {
        console.error('Redux middleware error:', error);
        console.error('Action:', action);
        throw error;
      }
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ✅ Exportar TODAS las actions
// Actions para CreateProgramming
export const {
  setUser,
  updateUser,
  clearUser,
} = sessionSlice.actions;

export const {
  setCurrentPage,
  setPreviousPage,
} = navPagesSlice.actions;

export const {
  setId,
  clearId,
} = idSlice.actions;

// Actions existentes
export const {
  setProgramming,
  setIdProgrammingSelect,
  setLoading,
  setError,
  updateDriverLocation,
  updateProgrammingStatus,
  clearInfoRoutes,
} = infoRoutesSlice.actions;

export const {
  setDriverLocation,
  updatePassengersLocations,
  setRouteCoordinates,
  clearMap,
} = mapSlice.actions;