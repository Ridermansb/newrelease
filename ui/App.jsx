import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import 'semantic-ui-css';
import 'assets/style.css';
import HomePage from './pages/HomePage';
import CallbackPage from './pages/CallbackPage';
import auth from './auth';
import store from './store';

const handleAuthentication = (nextState) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
};

const App = withRouter(({ location }) => (
  <Switch location={location}>
    <Route
      exact
      path="/"
      render={(props) => {
        if (store.isAuthenticated) {
          return <HomePage {...props} />;
        } else if (!store.isAuthenticating) {
          auth.login();
        }
        return null;
      }}
    />
    <Route
      exact
      path="/callback"
      render={(props) => {
        handleAuthentication(props);
        return <CallbackPage {...props} />;
      }}
    />

  </Switch>));

export default App;
