import { SET_NAVPAGES, CLEAR_NAVPAGES } from '../ActionTypes';

interface NavPagesState {
  navPages?: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface SetNavPagesAction {
  type: typeof SET_NAVPAGES;
  navPages: any; // Puedes reemplazar 'any' con una interfaz más específica
}

interface ClearNavPagesAction {
  type: typeof CLEAR_NAVPAGES;
}

type NavPagesAction = SetNavPagesAction | ClearNavPagesAction;

const initialState: NavPagesState = {};

const navPages = (
  state: NavPagesState = initialState, 
  action: NavPagesAction
): NavPagesState => {
  switch (action.type) {
    case SET_NAVPAGES: {
      const { navPages } = action;
      return {
        ...state,
        navPages: navPages
      };
    }
    case CLEAR_NAVPAGES: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default navPages;