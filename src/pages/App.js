import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

import SearchBox from './components/SearchBox';
import Playlist from './components/Playlist';
import Top from './components/Top';
import Title from './components/Title';
import Modal from './components/Modal';
import Loading from './components/Loading';
import Alert from './components/Alert';
import Tip from './components/Tip';

import SearchStore from './stores/SearchStore';
import PlaylistStore from './stores/PlaylistStore';
import ModalStore from './stores/ModalStore';
import UserStore from './stores/UserStore';
import AlertStore from './stores/AlertStore';

import { getCountry, getUser } from './actions/UserActions';

let getAppState = () => {
  return {
    text: SearchStore.getSearch(),
    tracks: PlaylistStore.getTracks(),
    mainTrack: PlaylistStore.getMainTrack(),
    searching: SearchStore.getSearch() !== '',
    loading: PlaylistStore.getLoading(),
    user: UserStore.getUser(),
    token: UserStore.getToken(),
    modalOpen: ModalStore.isOpen(),
    alertOpen: AlertStore.isOpen(),
    alert: AlertStore.status(),
    country: UserStore.getCountry(),
    lastPlaylist: PlaylistStore.getLastPlaylist()
  };
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = getAppState();
  }

  getToken() {
    let hashStr = window.location.hash;
    hashStr !== '' &&
      window.localStorage.setItem('magic_token', hashStr.split('&')[0].split('=')[1]);
  }

  componentDidMount() {
    localStorage.clear();
    this.getToken();
    getCountry();
    getUser();
    SearchStore.addChangeListener(this._onChange.bind(this));
    PlaylistStore.addChangeListener(this._onChange.bind(this));
    ModalStore.addChangeListener(this._onChange.bind(this));
    UserStore.addChangeListener(this._onChange.bind(this));
    AlertStore.addChangeListener(this._onChange.bind(this));
  }

  componentWillUnmount() {
    SearchStore.removeChangeListener(this._onChange.bind(this));
    ModalStore.removeChangeListener(this._onChange.bind(this));
    UserStore.removeChangeListener(this._onChange.bind(this));
    AlertStore.removeChangeListener(this._onChange.bind(this));
  }

  _onChange() {
    this.setState(getAppState());
  }

  render() {
    return <div className='container'>
      <CSSTransitionGroup transitionEnterTimeout={500} transitionLeaveTimeout={300} transitionName='fade'>
        {this.renderTop()}
      </CSSTransitionGroup>
      <CSSTransitionGroup transitionEnterTimeout={500} transitionLeaveTimeout={300} transitionName='fadeOut'>
        {!this.state.searching ? this.renderWelcome() : null}
      </CSSTransitionGroup>
      <CSSTransitionGroup transitionEnterTimeout={500} transitionLeaveTimeout={300} transitionName='fade'>
        {this.renderPlaylist()}
      </CSSTransitionGroup>
      <CSSTransitionGroup transitionEnterTimeout={500} transitionLeaveTimeout={300} transitionName='fade'>
        {this.state.loading ? <Loading /> : null}
      </CSSTransitionGroup>
      <CSSTransitionGroup transitionEnterTimeout={500} transitionLeaveTimeout={300} transitionName='fade'>
        {this.state.modalOpen ? this.renderModal() : null}
      </CSSTransitionGroup>
      <CSSTransitionGroup transitionEnterTimeout={500} transitionLeaveTimeout={300} transitionName='fade' >
        {this.state.alertOpen ? this.renderAlert() : null}
      </CSSTransitionGroup>
    </div>;
  }

  renderTop() {
    return <Top search={this.state.text} list={this.state.tracks} country={this.state.country} />;
  }

  renderWelcome() {
    return (
      <div className='search-container'>
        <Title />
        <Tip />
      </div>
    )
  }

  renderSearch() {
    return (
      <div className='search-container'>
        <Title />
        <SearchBox
          value={this.state.text}
          list={this.state.tracks}
          country={this.state.country} />
        <Tip />
      </div>
    );
  }

  renderPlaylist() {
    return <Playlist
      mainTrack={this.state.mainTrack}
      tracks={this.state.tracks}
      country={this.state.country}
      isSearch={this.state.searching}
    />;
  }

  renderModal() {
    return <Modal user={this.state.user} token={this.state.token} />;
  }

  renderAlert() {
    return <Alert
      username={this.state.user ? this.state.user._display_name : null}
      status={this.state.alert}
      lastPlaylist={this.state.lastPlaylist}
    />;
  }
}

export default App;