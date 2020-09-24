import Dispatcher from '../dispatcher';
import {
  USER_LOGED,
  USER_TOKEN,
  USER_COUNTRY
} from '../constants/constants';
import Spotify from '../core/Spotify';
import ReactGA from 'react-ga';

export const login = () => {
  ReactGA.ga('send', 'event', 'event', 'login', 'init');
  return new Promise((resolve, reject) => {
    Spotify.login().then((data) => {
      Dispatcher.dispatch({
        type: USER_TOKEN,
        data: data
      });
      ReactGA.ga('send', 'event', 'event', 'login', 'fin');
      
    });
  });
};

export const getUser = () => {
  const token = localStorage.magic_token;
  if(token) {
    Spotify.getUser().then((data) => {
      Dispatcher.dispatch({
        type: USER_LOGED,
        data: data
      });
    });
  }
}

export const getCountry = () => {
  if (localStorage.magic_country) {
    Dispatcher.dispatch({
      type: USER_COUNTRY,
      data: localStorage.magic_country
    });
  } else {
    let checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    };

    let parseJSON = (response) => {
      return response.json();
    };
  }
};