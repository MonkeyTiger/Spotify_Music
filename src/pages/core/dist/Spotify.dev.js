"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _spotifySdk = require("spotify-sdk");

var _Magic = require("./Magic");

var client = _spotifySdk.Client.instance;
client.settings = {
  clientId: 'cf03cd01c3024ca386358fede47683d4',
  secretId: '210a6eb970654718b5996020465b577f',
  scopes: 'user-read-playback-state, playlist-modify-public playlist-modify-private, streaming, user-read-email, user-read-private',
  redirect_uri: 'http://localhost:3000/'
};
var settings = {
  tracks: 20,
  artists: 20
};
var track = new _spotifySdk.TrackHandler();
var user = new _spotifySdk.UserHandler();
var playlist = new _spotifySdk.PlaylistHandler();
var total = 0;
var Spotify = {
  trackList: [],
  autocomplete: function autocomplete(text, country) {
    return track.search(text, {
      limit: 5,
      market: country
    });
  },
  search: function search(text, country, callback, fail) {
    if (!client.token) {
      Spotify.getUser();
    } else {
      if (text.id) {
        return Spotify.getTracks(text, country, callback, fail);
      } else {
        if (localStorage.magic_token) {
          track.search(text.value, {
            limit: 1,
            market: country
          }).then(function (trackCollection) {
            if (trackCollection.length) {
              Spotify.getTracks(trackCollection.first(), country, callback, fail);
            } else {
              callback([]);
            }
          })["catch"](fail);
        }
      }
    }
  },
  getTracks: function getTracks(track, country, callback, fail) {
    Spotify.trackList = [];
    track.artists.first().relatedArtists().then(function (relatedArtists) {
      relatedArtists = relatedArtists.slice(0, settings.artists - 1);

      if (relatedArtists.length) {
        relatedArtists.push(track.artists.first());

        for (var i = relatedArtists.length - 1; i >= 0; i--) {
          total = relatedArtists.length - 1;
          relatedArtists[i].topTracks({
            country: country
          }).then(function (tracks) {
            if (tracks.length) {
              for (var e = tracks.length - 1; e >= 0; e--) {
                Spotify.trackList.push(tracks[e]);

                if (e === 0) {
                  total -= 1;

                  if (total === 0) {
                    callback((0, _Magic.magic)(Spotify.trackList, track.popularity), track);
                  }
                }
              }

              ;
            } else {
              total -= 1;
            }
          })["catch"](fail);
        }

        ;
      } else {
        callback([]);
      }
    })["catch"](fail);
  },
  login: function login() {
    return new Promise(function (resolve, reject) {
      client.login(function (url) {
        window.open(url, '_self', 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=400,height=500', false);
        window.addEventListener('storage', function (data) {
          if (data.key === 'magic_token') {
            resolve(data.newValue);
          }
        });
      });
    });
  },
  getUser: function getUser() {
    client.token = localStorage.magic_token;

    if (client.token) {
      return new Promise(function (resolve, reject) {
        user.me().then(function (userEntity) {
          localStorage.magic_user = JSON.stringify(userEntity);
          resolve(userEntity);
        })["catch"](function (error) {
          reject(error);
        });
      });
    }
  },
  savePlaylist: function savePlaylist(userId, name, isPublic, tracks) {
    client.token = localStorage.magic_token;
    return new Promise(function (resolve, reject) {
      playlist.create(userId, name + ' by magicplaylist.co', isPublic).then(function (myPlaylist) {
        myPlaylist.addTrack(tracks).then(function (snapshot) {
          resolve(myPlaylist);
        });
      })["catch"](function (error) {
        reject(error);
      });
    });
  }
};
var _default = Spotify;
exports["default"] = _default;