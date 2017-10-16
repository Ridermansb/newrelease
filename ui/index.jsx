import React from 'react';
import { Router } from 'react-router-dom';
import { render } from 'react-dom';
import firebase from 'firebase';
import history from './history';
import App from './App';

const rootEl = document.getElementById('root');

const config = {
  apiKey: process.env.FIREBASE_WEBAPI_KEY,
  // authDomain: "${process.env.FIREBASE_WEBAPI_KEY}.firebaseapp.com",
  databaseURL: `https://${process.env.FIREBASE_WEBAPI_KEY}.firebaseio.com`,
  storageBucket: `${process.env.FIREBASE_WEBAPI_KEY}.appspot.com`,
};
firebase.initializeApp(config);

render((<Router history={history}><App /></Router>), rootEl);

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const NewRoot = require('./App').default;
    render((<Router history={history}><NewRoot /></Router>), rootEl);
  });
}
