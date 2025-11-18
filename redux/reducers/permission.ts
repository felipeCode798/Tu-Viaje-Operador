import { SET_PERMISSION, CLEAR_PERMISSION } from '../ActionTypes';

interface PermissionState {
  status?: string;
}

interface SetPermissionAction {
  type: typeof SET_PERMISSION;
  permission: {
    status: string;
  };
}

interface ClearPermissionAction {
  type: typeof CLEAR_PERMISSION;
}

type PermissionAction = SetPermissionAction | ClearPermissionAction;

const initialState: PermissionState = {};

const permission = (
  state: PermissionState = initialState, 
  action: PermissionAction
): PermissionState => {
  switch (action.type) {
    case SET_PERMISSION: {
      const { permission } = action;
      return {
        ...state,
        status: permission.status
      };
    }
    case CLEAR_PERMISSION: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default permission;