import React from 'react';
import RepositoriesList from 'components/RepositoriesList';
import RootContainer from '../containers/RootContainer';

const HomePage = () => (<RootContainer>
  <RepositoriesList />
</RootContainer>);

HomePage.displayName = 'HomePage';

export default HomePage;
