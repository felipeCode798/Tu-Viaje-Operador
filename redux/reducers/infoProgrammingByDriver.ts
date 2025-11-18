import { SET_INFOPROGRAMMINGBYDRIVER, CLEAR_INFOPROGRAMMINGBYDRIVER } from '../ActionTypes';

interface InfoProgrammingByDriverState {
  infoProgrammingByDriver?: any;
}

interface SetInfoProgrammingByDriverAction {
  type: typeof SET_INFOPROGRAMMINGBYDRIVER;
  infoProgrammingByDriver: any; 
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