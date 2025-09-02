import { SET_INFOPROGRAMMINGBYDRIVER, CLEAR_INFOPROGRAMMINGBYDRIVER } from '../ActionTypes';

interface InfoProgrammingByDriverState {
  infoProgrammingByDriver?: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface SetInfoProgrammingByDriverAction {
  type: typeof SET_INFOPROGRAMMINGBYDRIVER;
  infoProgrammingByDriver: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface ClearInfoProgrammingByDriverAction {
  type: typeof CLEAR_INFOPROGRAMMINGBYDRIVER;
}

type InfoProgrammingByDriverAction = SetInfoProgrammingByDriverAction | ClearInfoProgrammingByDriverAction;

const initialState: InfoProgrammingByDriverState = {};

const infoProgrammingByDriver = (
  state: InfoProgrammingByDriverState = initialState, 
  action: InfoProgrammingByDriverAction
): InfoProgrammingByDriverState => {
  switch (action.type) {
    case SET_INFOPROGRAMMINGBYDRIVER: {
      const { infoProgrammingByDriver } = action;
      return {
        ...state,
        infoProgrammingByDriver: infoProgrammingByDriver
      };
    }
    case CLEAR_INFOPROGRAMMINGBYDRIVER: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default infoProgrammingByDriver;