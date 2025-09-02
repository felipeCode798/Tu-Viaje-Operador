import { SET_TRAVEL, CLEAR_TRAVEL } from '../ActionTypes';

interface TravelState {
  travel?: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface SetTravelAction {
  type: typeof SET_TRAVEL;
  travel: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface ClearTravelAction {
  type: typeof CLEAR_TRAVEL;
}

type TravelAction = SetTravelAction | ClearTravelAction;

const initialState: TravelState = {};

const travel = (
  state: TravelState = initialState, 
  action: TravelAction
): TravelState => {
  switch (action.type) {
    case SET_TRAVEL: {
      const { travel } = action;
      return {
        ...state,
        travel: travel
      };
    }
    case CLEAR_TRAVEL: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default travel;