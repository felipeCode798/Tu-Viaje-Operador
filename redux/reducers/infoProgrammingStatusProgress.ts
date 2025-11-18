import { SET_INFO_PROGRAMMING_STATUS_PROGRESS, CLEAR_INFO_PROGRAMMING_STATUS_PROGRESS } from '../ActionTypes';

interface InfoStatusProgressState {
  infoStatusProgress?: any;
}

interface SetInfoStatusProgressAction {
  type: typeof SET_INFO_PROGRAMMING_STATUS_PROGRESS;
  infoStatusProgress: any;
}

interface ClearInfoStatusProgressAction {
  type: typeof CLEAR_INFO_PROGRAMMING_STATUS_PROGRESS;
}

type InfoStatusProgressAction = SetInfoStatusProgressAction | ClearInfoStatusProgressAction;

const initialState: InfoStatusProgressState = {};

const infoStatusProgress = (
  state: InfoStatusProgressState = initialState, 
  action: InfoStatusProgressAction
): InfoStatusProgressState => {
  switch (action.type) {
    case SET_INFO_PROGRAMMING_STATUS_PROGRESS: {
      const { infoStatusProgress } = action;
      return {
        ...state,
        infoStatusProgress: infoStatusProgress
      };
    }
    case CLEAR_INFO_PROGRAMMING_STATUS_PROGRESS: {
      return {};
    }
    default: {
      return state;
    }
  }
};

export default infoStatusProgress;