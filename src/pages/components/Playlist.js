import React, { Component, useState, useEffect } from 'react';
import axios from 'axios';
import Track from './Track';
import * as PlaylistActions from '../actions/PlaylistActions';
import { open } from '../actions/ModalActions';
import ReactGA from 'react-ga';

const Playlist = ({ mainTrack, tracks, isSearch }) => {

  const [selectedSong, setSelectedSong] = useState(mainTrack);
  const [duration, setDuration] = useState(0);
  const [isWrapped, setIsWrapped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [loop, setLoop] = useState();
  const [process, setProcess] = useState(0);
  const [played, setPlayed] = useState(0);
  useEffect(() => {
    tracks.length > 0 &&
      getDeviceID();
  }, [tracks]);

  const getDeviceID = () => {
    const spotifyPlayer = document.createElement('script');
    spotifyPlayer.src = "https://sdk.scdn.co/spotify-player.js";
    spotifyPlayer.async = true;
    document.body.appendChild(spotifyPlayer);

    const scriptTag = document.createElement('script');
    const scriptStr = `
      window.onSpotifyWebPlaybackSDKReady = () => {
        const token = '${localStorage.getItem('magic_token')}';
        const player = new Spotify.Player({
          name: 'Web Playback SDK Quick Start Player',
          getOAuthToken: cb => { cb(token); }
        });
      
        player.connect();
      };
    `;
    scriptTag.append(scriptStr);
    scriptTag.async = true;
    document.body.appendChild(scriptTag);
  }

  useEffect(() => {
    setDuration(selectedSong ? (selectedSong.duration_ms / 1000).toFixed(0) * 1 : 0);
    setStep(selectedSong ? (100000 / selectedSong.duration_ms).toFixed(3) * 1 : 0);
    setIsPlaying(false);
    setPlayed(0);
    setProcess(0);
    clearInterval(loop);
    tracks.length > 0 && audioPause();
  }, [selectedSong]);

  const backSong = () => {
    if (index > 0) {
      setSelectedSong(tracks[index - 1]);
      setIndex(index - 1);
    }
  }

  const nextSong = () => {
    if (index < tracks.length - 1) {
      setSelectedSong(tracks[index + 1]);
      setIndex(index + 1);
    }
  }

  const audioPlay = (
    callback = null,
    token = localStorage.getItem('magic_token'),
    deviceID = localStorage.getItem('_spharmony_device_id'),
    songInfo = selectedSong
  ) => {
    axios({
      method: 'GET',
      url: `https://api.spotify.com/v1/me/player/currently-playing?device_id=${deviceID}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then(response => {
      if (response.data === '') {
        axios({
          method: 'PUT',
          url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`,
          data: {
            uris: [songInfo.uri]
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.log(error);
        });
      } else {
        axios({
          method: 'PUT',
          url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.log(error);
        });
      }
    }).catch(error => {
      console.log(error);
    });
  }

  const audioPause = (
    callback = null,
    token = localStorage.getItem('magic_token'),
    deviceID = localStorage.getItem('_spharmony_device_id')
  ) => {
    axios({
      method: 'GET',
      url: `https://api.spotify.com/v1/me/player/currently-playing?device_id=${deviceID}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then(response => {
      if (response.data !== '') {
        axios({
          method: 'PUT',
          url: `https://api.spotify.com/v1/me/player/pause?device_id=${deviceID}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then(() => {
          setIsPlaying(false);
        });
      }
    });
  }

  const audioSeek = (
    position,
    token = localStorage.getItem('magic_token'),
    deviceID = localStorage.getItem('_spharmony_device_id')
  ) => {
    axios({
      method: 'PUT',
      url: `https://api.spotify.com/v1/me/player/seek?device_id=${deviceID}&position_ms=${position}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  }


  const handleChange = (event) => {
    const cloneEventValue = event.target.value * 1;
    audioSeek(Math.floor(cloneEventValue * 10 * duration));
    setPlayed(cloneEventValue / 100 * duration);
    setProcess(cloneEventValue);
  }

  const handleWrapped = () => {
    setIsWrapped(!isWrapped);
  }


  const calcMainTrackIndex = (trackID) => {
    console.log(trackID, selectedSong.id);
    if (trackID === selectedSong.id) {
      setSelectedSong(tracks[0]);
      setIndex(0);
    }
  }

  const handleRemove = (ind, trackID) => {
    PlaylistActions.removeTrack(ind);
    ReactGA.ga('send', 'event', 'button', 'click', 'playlist-remove-track');
    calcMainTrackIndex(trackID);
  }

  const handleSave = () => {
    open();
    ReactGA.ga('send', 'event', 'button', 'click', 'open-modal-save-playlist');
  }

  useEffect(() => {
    if (played > duration) {
      setIsPlaying(false);
      setPlayed(0);
      setProcess(0);
      clearInterval(loop);
    }
  }, [played]);

  const togglePlay = () => {
    isPlaying ? audioPause() : audioPlay();
  }

  useEffect(() => {
    if (isPlaying) {
      audioPlay();
      setLoop(setInterval(function () {
        setProcess(process => process + step);
        setPlayed(played => played + 1);
      }, 1000));
    } else {
      tracks.length > 0 && audioPause();
      clearInterval(loop);
    }
  }, [isPlaying]);

  useEffect(() => {
    setSelectedSong(mainTrack);
  }, [mainTrack]);

  useEffect(() => {
    tracks.forEach((x, ind) => {
      if (x.uri === mainTrack.uri) {
        setIndex(ind);
      }
    });
  }, [tracks]);

  const tableRowSelect = (ind) => {
    setSelectedSong(tracks[ind]);
    setIndex(ind);
  }

  return (
    <div className='playlist'>
      <div className='info'>
        {
          tracks.length > 0
            ? (
              selectedSong &&
              <>
                <div onClick={handleSave} className="save-playlist">Save playlist on Spotify</div>
                <div className="music_player">
                  <div className="artist_img" src="">
                    <img src={selectedSong.album.images[0].url} />
                  </div>
                  <div className="time_slider">
                    <span className="runing_time">{played ? `${Math.floor(played / 60)}:${Math.floor(played % 60)}` : `0:00`}</span>
                    <input type="range" value={process || 0} onChange={handleChange} />
                    <span className="song_long">{duration ? `${Math.floor(duration / 60)}:${duration % 60}` : `0:00`}</span>
                  </div>
                  <div className="now_playing">
                    <i className="fa fa-refresh" aria-hidden="true"></i>

                    <p> now playing </p>
                    <i className="fa fa-heart" aria-hidden="true"></i>
                  </div>
                  <div className="music_info">
                    <h2>{selectedSong.name}</h2>
                    <p className="date">{selectedSong.album.release_date}</p>
                    <fieldset className="rating">
                      <input type="radio" id="star5" name="rating" value="5" />
                      <label className="full" htmlFor="star5" title="Awesome - 5 stars"></label>
                      <input type="radio" id="star4half" name="rating" value="4 and a half" />
                      <label className="half" htmlFor="star4half" title="Pretty good - 4.5 stars"></label>
                      <input type="radio" id="star4" name="rating" value="4" />
                      <label className="full" htmlFor="star4" title="Pretty good - 4 stars"></label>
                      <input type="radio" id="star3half" name="rating" value="3 and a half" />
                      <label className="half" htmlFor="star3half" title="Meh - 3.5 stars"></label>
                      <input type="radio" id="star3" name="rating" value="3" />
                      <label className="full" htmlFor="star3" title="Meh - 3 stars"></label>
                      <input type="radio" id="star2half" name="rating" value="2 and a half" />
                      <label className="half" htmlFor="star2half" title="Kinda bad - 2.5 stars"></label>
                      <input type="radio" id="star2" name="rating" value="2" />
                      <label className="full" htmlFor="star2" title="Kinda bad - 2 stars"></label>
                      <input type="radio" id="star1half" name="rating" value="1 and a half" />
                      <label className="half" htmlFor="star1half" title="Meh - 1.5 stars"></label>
                      <input type="radio" id="star1" name="rating" value="1" />
                      <label className="full" htmlFor="star1" title="Sucks big time - 1 star"></label>
                      <input type="radio" id="starhalf" name="rating" value="half" />
                      <label className="half" htmlFor="starhalf" title="Sucks big time - 0.5 stars"></label>
                    </fieldset>
                  </div>
                  <div className="controllers">
                    <a onClick={handleWrapped}><i className="fa fa-music" aria-hidden="true" title="Playlist Wrap"></i></a>
                    <a onClick={backSong}><i className="fa fa-fast-backward" aria-hidden="true" title="Back"></i></a>
                    <a onClick={togglePlay} title={isPlaying ? 'Stop' : 'Play'}>
                      {
                        isPlaying
                          ? <i className="fa fa-pause"></i>
                          : <i className="fa fa-play"></i>
                      }
                    </a>
                    <a onClick={nextSong}><i className="fa fa-fast-forward" aria-hidden="true" title="Next"></i></a>
                    <a onClick={handleSave}><i className="fa fa-save" aria-hidden="true" title="Save playlist on Spotify"></i></a>
                  </div>
                </div>
                <div className="song_list" style={isWrapped ? { height: '0px' } : { height: '320px' }}>
                  <table>
                    <tbody>
                      {
                        tracks.map((track, index) => {
                          const artists = [];
                          track.artists.forEach((item) => {
                            artists.push(item.name);
                          });
                          return (
                            <tr key={index} className={index % 2 === 0 ? 'dark' : ''}>
                              <td style={{ width: '20%' }} onClick={() => tableRowSelect(index)}><img src={track.album.images[2].url} /></td>
                              <td style={{ width: '40%' }} onClick={() => tableRowSelect(index)}>{track.name}</td>
                              <td style={{ width: '30%' }} onClick={() => tableRowSelect(index)}>{artists.join(', ')}</td>
                              <td style={{ width: '10%' }} onClick={() => handleRemove(index, track.id)}>
                                <a><i className="fa fa-close"></i></a>
                              </td>
                            </tr>
                          );
                        })
                      }
                      <tr></tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (isSearch && <div className='track-name'>Hey! The track doesn't exist! :(</div>)

        }
      </div>
    </div>
  )
}

export default Playlist;
