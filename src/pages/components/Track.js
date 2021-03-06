import React, { Component } from 'react';
import { removeTrack, search } from '../actions/PlaylistActions';
import Player from './Player';
import ReactGA from 'react-ga';

class Track extends Component {

  constructor(props) {
    super(props);
  }

  _remove() {
    removeTrack(this.props.index);
    ReactGA.ga('send', 'event', 'button', 'click', 'playlist-remove-track');
  }

  _handleReSearch() {
    search(this.props.track, this.props.country);
    ReactGA.ga('send', 'event', 'event', 'new-re-search', this.props.track.name);
  }

  render() {
    let track = this.props.track;
    return <li>
      <div className='track-name'>{track.name}, {track.artists.first().name}</div>
      <div
        className='remove tooltip center'
        onClick={this._remove.bind(this)}
        data-tooltip='Remove this track'
      >
        <img src='img/remove.svg' />
      </div>
      <div className='play tooltip center' data-tooltip='Preview this track'>
        <Player
          source={track.preview_url}
          ptag={this.props.ptag.bind(this)}
          stopAll={this.props.stopAll.bind(this)} />
      </div>
      <div
        className='re-search tooltip center'
        onClick={this._handleReSearch.bind(this)}
        data-tooltip='Make a new playlist!'
      >
        <img src='img/reload.svg' />
      </div>
    </li>;
  }
}

export default Track;
