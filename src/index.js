import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import './media-player.scss';
import App from './pages/App';
import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
const rootElement = document.getElementById("root");

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrate(<App />, rootElement);
} else {
  ReactDOM.render(<App />, rootElement);
}
serviceWorker.unregister();