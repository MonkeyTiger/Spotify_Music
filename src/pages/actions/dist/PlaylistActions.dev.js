"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.removeTrack = exports.removeTracks = exports.search = void 0;

var _dispatcher = _interopRequireDefault(require("../dispatcher"));

var _constants = require("../constants/constants");

var _Spotify = _interopRequireDefault(require("../core/Spotify"));

var _UserActions = require("./UserActions");

var _reactGa = _interopRequireDefault(require("react-ga"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var search = function search(text, country) {
  if (!localStorage.magic_token) {
    _dispatcher["default"].dispatch({
      type: _constants.PLAYLIST_LIMIT_429
    });
  } else {
    _dispatcher["default"].dispatch({
      type: _constants.PLAYLIST_LOADING
    });

    _Spotify["default"].search(text, country, function (tracks, mainTrack) {
      if (tracks.length) {
        _dispatcher["default"].dispatch({
          type: _constants.PLAYLIST_ADD_TRACKS,
          tracks: tracks,
          mainTrack: mainTrack
        });

        _reactGa["default"].ga('send', 'event', 'event', 'new-playlist', 'new');
      } else {
        _dispatcher["default"].dispatch({
          type: _constants.PLAYLIST_TRACK_NOT_FOUND,
          tracks: []
        });

        _reactGa["default"].ga('send', 'event', 'event', 'playlist-search', 'no-result');
      }
    }, function (error) {
      console.log(error);
      return;

      if (error.response.status === 429) {
        _dispatcher["default"].dispatch({
          type: _constants.PLAYLIST_LIMIT_429,
          tracks: []
        });

        _reactGa["default"].ga('send', 'event', 'event', 'playlist-search', '429');
      } else if (error.response.status === 401) {
        _dispatcher["default"].dispatch({
          type: _constants.PLAYLIST_LIMIT_429,
          tracks: []
        });

        _reactGa["default"].ga('send', 'event', 'event', 'playlist-search', '401');
      } else {
        _dispatcher["default"].dispatch({
          type: _constants.PLAYLIST_FAILED
        });

        _reactGa["default"].ga('send', 'event', 'event', 'playlist-search', 'error');
      }

      _dispatcher["default"].dispatch({
        type: _constants.SEARCH_RESET
      });
    });
  }
};

exports.search = search;

var removeTracks = function removeTracks() {
  _dispatcher["default"].dispatch({
    type: _constants.PLAYLIST_REMOVE_TRACKS
  });
};

exports.removeTracks = removeTracks;

var removeTrack = function removeTrack(index) {
  _dispatcher["default"].dispatch({
    type: _constants.PLAYLIST_REMOVE_TRACK,
    index: index
  });
};

exports.removeTrack = removeTrack;

var save = function save(userId, name, isPublic, tracks) {
  _dispatcher["default"].dispatch({
    type: _constants.PLAYLIST_SAVING
  });

  _Spotify["default"].savePlaylist(userId, name, isPublic, tracks).then(function (response) {
    _dispatcher["default"].dispatch({
      type: _constants.PLAYLIST_CREATED,
      response: response
    });

    _reactGa["default"].ga('send', 'event', 'event', 'playlist-save', 'saved');
  })["catch"](function (error) {
    if (error.response.status === 401) {
      _reactGa["default"].ga('send', 'event', 'event', 'playlist-save', 'token error');

      (0, _UserActions.login)().then(function () {
        save(userId, name, isPublic, tracks);
      });
    } else {
      _dispatcher["default"].dispatch({
        type: _constants.PLAYLIST_SAVE_FAIL
      });

      _reactGa["default"].ga('send', 'event', 'event', 'playlist-save', 'error');
    }
  });
};

exports.save = save;