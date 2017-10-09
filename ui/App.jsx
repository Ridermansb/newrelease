import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import 'semantic-ui-css';
import 'assets/style.css';
import { uiStore } from 'store';
import HomePage from './pages/HomePage';
import CallbackPage from './pages/CallbackPage';
import auth from './auth';

const handleAuthentication = (nextState) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
};

// Create Semantic API
$.fn.api.settings.api = {
  'search repositories': '/api/search/repositories?q={query}',
};

// Register Service worker
// https://justmarkup.com/log/2017/02/implementing-push-notifications/
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: '/' });
} else {
  console.warn('Not supported by browser');
}

const App = withRouter(({ location }) => (
  <Switch location={location}>
    <Route
      exact
      path="/"
      render={(props) => {
        if (uiStore.isAuthenticated && !uiStore.isAuthenticating) {
          return <HomePage {...props} />;
        } else if (!uiStore.isAuthenticating) {
          auth.login();
        }
        return null;
      }}
    />
    <Route
      path="/callback"
      render={(props) => {
        uiStore.isAuthenticating = true;
        handleAuthentication(props);
        return <CallbackPage {...props} />;
      }}
    />

  </Switch>));

export default App;
