import Dispatcher from '../dispatcher';
import { ALERT_OPEN, ALERT_CLOSE } from '../constants/constants';

export const open = () => {
  Dispatcher.dispatch({
    type: ALERT_OPEN
  });
};

export const close = () => {
  Dispatcher.dispatch({
    type: ALERT_CLOSE
  });
};