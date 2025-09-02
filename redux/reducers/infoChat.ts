import { SET_INFOCHAT, CLEAR_INFOCHAT } from '../ActionTypes';

interface InfoChatState {
  infoChat?: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface SetInfoChatAction {
  type: typeof SET_INFOCHAT;
  infoChat: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface ClearInfoChatAction {
  type: typeof CLEAR_INFOCHAT;
}

type InfoChatAction = SetInfoChatAction | ClearInfoChatAction;

const initialState: InfoChatState = {};

const infoChat = (state: InfoChatState = initialState, action: InfoChatAction): InfoChatState => {
  switch (action.type) {
    case SET_INFOCHAT: {
      const { infoChat } = action;
      return {
        ...state,
        infoChat: infoChat
      };
    }
    case CLEAR_INFOCHAT: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default infoChat;