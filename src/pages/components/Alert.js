import React, { Component } from 'react';
import { close } from '../actions/AlertActions';
import { login } from '../actions/UserActions';
import ReactGA from 'react-ga';

class Alert extends Component {

  constructor(props) {
    super(props);
    if (this.props.status.fail) {
      setTimeout(() => {
        close();
      }, 3000);
    }
  }

  _handleDone() {
    close();
    ReactGA.ga('send', 'event', 'button', 'click', 'alert-close');
  }

  _handleLogin() {
    login();
    close();
  }

  _hanbleShareFB() {
    let url = `http://facebook.com/sharer.php?s=100&p[url]=http://www.magicplaylist.co`;
    window.open(
      url,
      'fbshare',
      'height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0'
    );
    ReactGA.ga('send', 'event', 'button', 'click', 'share-fb');
  }

  _hanbleShareTW() {
    let url = `https://twitter.com/intent/tweet?text=Checkout my new playlist on Spotify!
    ${this.props.lastPlaylist}. Create yours on http://www.magicplaylist.co&hashtags=MagicPlaylist`;
    window.open(
      url,
      'tshare',
      'height=400,width=550,resizable=1,toolbar=0,menubar=0,status=0,location=0'
    );
    ReactGA.ga('send', 'event', 'button', 'click', 'share-tw');
  }

  render() {
    return <div className='alert-shadow'>
      <div className='alert-modal'>
        {this.props.status.loading ? this.renderLoading() : null}
        {this.props.status.fail ? this.renderFail() : null}
        {this.props.status.share ? this.renderShare() : null}
        {this.props.status.limit ? this.renderLimit() : null}
      </div>
    </div>;
  }

  renderShare() {
    return <div className='alert-share'>
      <span className='share-title'>High five {this.props.username}!</span>
      <span className='share-subtitle'>Your playlist is now on Spotify.</span>
      <span className='share-cta'>
        Go to your playlists lists or <a
          href={this.props.lastPlaylist}
          target='_blank'
          rel="noopener noreferrer"
        >play it online</a>.
            </span>
      <span className='share-message'>Share it with your friends</span>
      <div className='share'>
        <div className='facebook source' onClick={this._hanbleShareFB.bind(this)}>
          <img src='img/facebook.svg' alt="" />
        </div>
        <div className='twitter source' onClick={this._hanbleShareTW.bind(this)}>
          <img src='img/twitter.svg' alt="" />
        </div>
      </div>
      <div className='btn-done' onClick={this._handleDone}>Close window</div>
    </div>;
  }

  renderLimit() {
    return <div className='alert-limit'>
      <span className='limit-title'>Ohh to many people here!</span>
      <span className='limit-subtitle'>
        Try again in a seconds or login for ensure your search.
            </span>
      <div className='btn-close' onClick={this._handleDone}>Close</div>
      <div className='btn-done' onClick={this._handleLogin}>Login</div>
      {/* <div className='btn-done' onClick={this._handleLogin}>
        <SpotifyAuth
          redirectUri='http://localhost:3000/callback'
          noLogo={true}
          clientID='1a70ba777fec4ffd9633c0c418bdcf39'
          title="Login"
          scopes={[Scopes.userReadPrivate, 'user-read-email']} // either style will work
        />
      </div> */}
    </div>;
  }

  renderFail() {
    return <div className='alert-fail'>
      <span>Huston, we have a problem here! :(</span>
      <img src='img/fail.svg' alt="" />
    </div>;
  }

  renderLoading() {
    return <div className='alert-loading'><img src='img/audio.svg' alt="" /></div>;
  }

}

export default Alert;
