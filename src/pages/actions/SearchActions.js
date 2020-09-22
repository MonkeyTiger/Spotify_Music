import Dispatcher from '../dispatcher';
import { SEARCH_ADD, SEARCH_RESET } from '../constants/constants';

export const newSearch = (text) => {
  Dispatcher.dispatch({
    type: SEARCH_ADD,
    text: text
  });
};

export const resetSearch = () => {
  Dispatcher.dispatch({
    type: SEARCH_RESET
  });
};
