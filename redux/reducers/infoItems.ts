import { SET_INFO_ITEMS, CLEAR_INFO_ITEMS } from '../ActionTypes';

interface InfoItemsState {
  infoItems?: any; 
}

interface SetInfoItemsAction {
  type: typeof SET_INFO_ITEMS;
  infoItems: any; 
}

interface ClearInfoItemsAction {
  type: typeof CLEAR_INFO_ITEMS;
}

type InfoItemsAction = SetInfoItemsAction | ClearInfoItemsAction;

const initialState: InfoItemsState = {};

const infoItems = (state: InfoItemsState = initialState, action: InfoItemsAction): InfoItemsState => {
  switch (action.type) {
    case SET_INFO_ITEMS: {
      const { infoItems } = action;
      return {
        ...state,
        infoItems: infoItems
      };
    }
    case CLEAR_INFO_ITEMS: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default infoItems;