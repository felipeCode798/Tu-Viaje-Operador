import { SET_INFOROUTES, CLEAR_INFOROUTES } from '../ActionTypes';

interface InfoRoutesState {
  infoRoutes?: any; 
}

interface SetInfoRoutesAction {
  type: typeof SET_INFOROUTES;
  infoRoutes: any; 
}

interface ClearInfoRoutesAction {
  type: typeof CLEAR_INFOROUTES;
}

type InfoRoutesAction = SetInfoRoutesAction | ClearInfoRoutesAction;

const initialState: InfoRoutesState = {};

const infoRoutes = (
  state: InfoRoutesState = initialState, 
  action: InfoRoutesAction
): InfoRoutesState => {
  switch (action.type) {
    case SET_INFOROUTES: {
      const { infoRoutes } = action;
      return {
        ...state,
        infoRoutes: infoRoutes
      };
    }
    case CLEAR_INFOROUTES: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default infoRoutes;