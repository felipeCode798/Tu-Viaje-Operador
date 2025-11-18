import { SET_INFODEVICE, CLEAR_INFODEVICE } from '../ActionTypes';

interface InfoDeviceState {
  infoDevice?: any;
}

interface SetInfoDeviceAction {
  type: typeof SET_INFODEVICE;
  infoDevice: any; 
}

interface ClearInfoDeviceAction {
  type: typeof CLEAR_INFODEVICE;
}

type InfoDeviceAction = SetInfoDeviceAction | ClearInfoDeviceAction;

const initialState: InfoDeviceState = {};

const infoDevice = (state: InfoDeviceState = initialState, action: InfoDeviceAction): InfoDeviceState => {
  switch (action.type) {
    case SET_INFODEVICE: {
      const { infoDevice } = action;
      return {
        ...state,
        infoDevice: infoDevice
      };
    }
    case CLEAR_INFODEVICE: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default infoDevice;