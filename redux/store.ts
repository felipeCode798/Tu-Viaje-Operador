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

// Interfaces
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

// Initial states
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

// Slices
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
      state.passengers = action.payload;
    },
    setRouteCoordinates: (state, action: PayloadAction<Array<{ latitude: number; longitude: number }>>) => {
      state.routeCoordinates = action.payload;
    },
  },
});

// Combinar reducers
const rootReducer = combineReducers({
  infoRoutes: infoRoutesSlice.reducer,
  map: mapSlice.reducer,
});

// Configuración de persistencia
const persistConfig = {
  key: "root", 
  storage: AsyncStorage,
  blacklist: ["filter", "modals"], // Ajusta según tus necesidades reales
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }) as any,
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Actions
export const {
  setProgramming,
  setIdProgrammingSelect,
  setLoading,
  setError,
  updateDriverLocation,
  updateProgrammingStatus,
} = infoRoutesSlice.actions;

export const {
  setDriverLocation,
  updatePassengersLocations,
  setRouteCoordinates,
} = mapSlice.actions;