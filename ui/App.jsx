import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import 'assets/style.css';
import HomePage from './pages/HomePage';

const App = withRouter(({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={HomePage} />
  </Switch>));

export default App;
