import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import App from './App';

const rootEl = document.getElementById('root');
render((
  <Router><App /></Router>
), rootEl);

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const NewRoot = require('./App').default;
    render((<Router><NewRoot /></Router>), rootEl);
  });
}
