import { SET_LOCATION, CLEAR_LOCATION } from "../ActionTypes";

interface LocationData {
  status: string;
  location: any; // Puedes reemplazar 'any' con una interfaz más específica para la ubicación
}

interface LocationState {
  location?: LocationData;
}

interface SetLocationAction {
  type: typeof SET_LOCATION;
  location: LocationData;
}

interface ClearLocationAction {
  type: typeof CLEAR_LOCATION;
}

type LocationAction = SetLocationAction | ClearLocationAction;

const initialState: LocationState = {};

const location = (
  state: LocationState = initialState, 
  action: LocationAction
): LocationState => {
  switch (action.type) {
    case SET_LOCATION: {
      const { location } = action;
      return {
        ...state,
        location: {
          status: location.status,
          location: location.location
        },
      };
    }
    case CLEAR_LOCATION: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default location;