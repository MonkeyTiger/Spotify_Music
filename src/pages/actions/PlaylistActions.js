import Dispatcher from '../dispatcher';
import {
  PLAYLIST_ADD_TRACKS,
  PLAYLIST_REMOVE_TRACK,
  PLAYLIST_LOADING,
  PLAYLIST_REMOVE_TRACKS,
  PLAYLIST_CREATED,
  PLAYLIST_SAVING,
  USER_TOKEN_ERROR,
  PLAYLIST_TRACK_NOT_FOUND,
  PLAYLIST_SAVE_FAIL,
  PLAYLIST_LIMIT_429,
  SEARCH_RESET,
  PLAYLIST_FAILED
} from '../constants/constants';
import Spotify from '../core/Spotify';
import { login } from './UserActions';
import ReactGA from 'react-ga';

export const search = (text, country) => {
  if (!localStorage.magic_token) {
    Dispatcher.dispatch({
      type: PLAYLIST_LIMIT_429  
    });
  } else {
    Dispatcher.dispatch({
      type: PLAYLIST_LOADING
    });
    Spotify.search(text, country, (tracks, mainTrack) => {
      if (tracks.length) {
        Dispatcher.dispatch({
          type: PLAYLIST_ADD_TRACKS,
          tracks: tracks,
          mainTrack: mainTrack
        });
        ReactGA.ga('send', 'event', 'event', 'new-playlist', 'new');
      } else {
        Dispatcher.dispatch({
          type: PLAYLIST_TRACK_NOT_FOUND,
          tracks: []
        });
        ReactGA.ga('send', 'event', 'event', 'playlist-search', 'no-result');
      }
    }, (error) => {
      if (error.response.status === 429) {
        Dispatcher.dispatch({
          type: PLAYLIST_LIMIT_429,
          tracks: []
        });
        ReactGA.ga('send', 'event', 'event', 'playlist-search', '429');
      } else if (error.response.status === 401) {
        Dispatcher.dispatch({
          type: PLAYLIST_LIMIT_429,
          tracks: []
        });
        ReactGA.ga('send', 'event', 'event', 'playlist-search', '401');
      } else {
        Dispatcher.dispatch({
          type: PLAYLIST_FAILED
        });
        ReactGA.ga('send', 'event', 'event', 'playlist-search', 'error');
      }
      Dispatcher.dispatch({
        type: SEARCH_RESET
      });
    });
  }
};

export const removeTracks = () => {
  Dispatcher.dispatch({
    type: PLAYLIST_REMOVE_TRACKS
  });
};

export const removeTrack = (index) => {
  Dispatcher.dispatch({
    type: PLAYLIST_REMOVE_TRACK,
    index: index
  });
};

export const save = (userId, name, isPublic, tracks) => {
  Dispatcher.dispatch({
    type: PLAYLIST_SAVING
  });
  Spotify.savePlaylist(userId, name, isPublic, tracks).then((response) => {
    Dispatcher.dispatch({
      type: PLAYLIST_CREATED,
      response: response
    });
    ReactGA.ga('send', 'event', 'event', 'playlist-save', 'saved');
  }).catch((error) => {
    if (error.response.status === 401) {
      ReactGA.ga('send', 'event', 'event', 'playlist-save', 'token error');
      login().then(() => {
        save(userId, name, isPublic, tracks);
      });
    } else {
      Dispatcher.dispatch({
        type: PLAYLIST_SAVE_FAIL
      });
      ReactGA.ga('send', 'event', 'event', 'playlist-save', 'error');
    }
  });
}