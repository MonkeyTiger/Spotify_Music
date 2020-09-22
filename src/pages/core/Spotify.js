import {
  Client,
  TrackHandler,
  PlaylistHandler,
  UserHandler
} from 'spotify-sdk';
import { magic } from './Magic';
let client = Client.instance;

client.settings = {
  clientId: 'Your ClientID',
  secretId: 'Your SecretID',
  scopes: 'Scope(Optional)',
  redirect_uri: 'Your Redirect URI',
};

let settings = {
  tracks: 20,
  artists: 20
};
let track = new TrackHandler();
let user = new UserHandler();
let playlist = new PlaylistHandler();
let total = 0;
let Spotify = {
  trackList: [],

  autocomplete: (text, country) => {
    return track.search(text, { limit: 5, market: country });
  },

  search: (text, country, callback, fail) => {
    if (!client.token) {
      Spotify.getUser();
    } else {
      if (text.id) {
        return Spotify.getTracks(text, country, callback, fail);
      } else {
        if (localStorage.magic_token) {
          track.search(text.value, { limit: 1, market: country }).then((trackCollection) => {
            if (trackCollection.length) {
              Spotify.getTracks(trackCollection.first(), country, callback, fail);
            } else {
              callback([]);
            }
          }).catch(fail);
        }
      }
    }
  },

  getTracks: (track, country, callback, fail) => {
    Spotify.trackList = [];
    track.artists.first().relatedArtists().then((relatedArtists) => {
      relatedArtists = relatedArtists.slice(0, settings.artists - 1);
      if (relatedArtists.length) {
        relatedArtists.push(track.artists.first());
        for (var i = relatedArtists.length - 1; i >= 0; i--) {
          total = relatedArtists.length - 1;
          relatedArtists[i].topTracks({ country: country }).then((tracks) => {
            if (tracks.length) {
              for (var e = tracks.length - 1; e >= 0; e--) {
                Spotify.trackList.push(tracks[e]);
                if (e === 0) {
                  total -= 1;
                  if (total === 0) {
                    callback(
                      magic(
                        Spotify.trackList,
                        track.popularity
                      ), track
                    );
                  }
                }
              };
            } else {
              total -= 1;
            }
          }).catch(fail);
        };
      } else {
        callback([]);
      }
    }).catch(fail);
  },

  login: () => {
    return new Promise((resolve, reject) => {
      client.login((url) => {
        window.open(
          url,
          '_self',
          'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=400,height=500',
          false
        );
        window.addEventListener('storage', (data) => {
          if (data.key === 'magic_token') {
            resolve(data.newValue);
          }
        });
      });
    });
  },

  getUser: () => {
    client.token = localStorage.magic_token;
    if (client.token) {
      return new Promise((resolve, reject) => {
        user.me().then((userEntity) => {
          localStorage.magic_user = JSON.stringify(userEntity);
          resolve(userEntity);
        }).catch((error) => {
          reject(error);
        });
      });
    }
  },

  savePlaylist: (userId, name, isPublic, tracks) => {
    client.token = localStorage.magic_token;
    return new Promise((resolve, reject) => {
      playlist.create(userId, name + ' by magicplaylist.co', isPublic).then((myPlaylist) => {
        myPlaylist.addTrack(tracks).then((snapshot) => {
          resolve(myPlaylist);
        });
      }).catch((error) => {
        reject(error);
      });
    });
  }
};

export default Spotify;
