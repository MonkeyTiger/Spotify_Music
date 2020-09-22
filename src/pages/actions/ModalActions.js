import Dispatcher from '../dispatcher';
import { MODAL_OPEN, MODAL_CLOSE } from '../constants/constants';

export const open = () => {
  Dispatcher.dispatch({
    type: MODAL_OPEN
  });
};

export const close = () => {
  Dispatcher.dispatch({
    type: MODAL_CLOSE
  });
}