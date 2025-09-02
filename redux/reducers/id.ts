import { SET_ID, CLEAR_ID } from "../ActionTypes";

interface IdState {
  id?: string | number;
}

interface SetIdAction {
  type: typeof SET_ID;
  id: string | number;
}

interface ClearIdAction {
  type: typeof CLEAR_ID;
}

type IdAction = SetIdAction | ClearIdAction;

const initialState: IdState = {};

const id = (state: IdState = initialState, action: IdAction): IdState => {
  switch (action.type) {
    case SET_ID: {
      const { id } = action;
      return {
        ...state,
        id: id,
      };
    }
    case CLEAR_ID: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default id;