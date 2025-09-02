import { SET_INFODEVICE, CLEAR_INFODEVICE } from '../ActionTypes';

interface InfoDeviceState {
  infoDevice?: any; // Puedes reemplazar 'any' con una interfaz más específica para los datos del dispositivo
}

interface SetInfoDeviceAction {
  type: typeof SET_INFODEVICE;
  infoDevice: any; // Puedes reemplazar 'any' con una interfaz más específica
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