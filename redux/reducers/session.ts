import { SET_SESSION, CLEAR_SESION, SET_USER } from '../ActionTypes';

interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface SessionState {
  token?: string;
  user?: User;
}

interface SetUserAction {
  type: typeof SET_USER;
  user: User;
}

interface ClearUserAction {
  type: 'CLEAR_USER';
}

interface ClearSessionAction {
  type: typeof CLEAR_SESION;
}

interface SetSessionAction {
  type: typeof SET_SESSION;
  token: string;
  user: User;
}

type SessionAction = SetUserAction | ClearUserAction | ClearSessionAction | SetSessionAction;

const initialState: SessionState = {};

const session = (
  state: SessionState = initialState, 
  action: SessionAction
): SessionState => {
  switch (action.type) {
    case SET_USER: {
      const { user } = action;
      return {
        ...state,
        user: user
      }; 
    }
    case 'CLEAR_USER': {
      return {
        ...state,
        user: undefined
      };
    }
    case CLEAR_SESION: {
      return {};
    }
    case SET_SESSION: {
      const { token, user } = action;
      return {
        token,
        user
      };
    }
    default: {
      return state;
    }
  }
};

export default session;