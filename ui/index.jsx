import React from 'react';
import { Router } from 'react-router-dom';
import { render } from 'react-dom';
import history from './history';
import App from './App';

const rootEl = document.getElementById('root');

render((
  <Router history={history}><App /></Router>
), rootEl);

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const NewRoot = require('./App').default;
    render((<Router history={history}><NewRoot /></Router>), rootEl);
  });
}
