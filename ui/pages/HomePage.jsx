import React from 'react';
import Menu from 'components/Menu';
import RepositoriesList from 'components/RepositoriesList';

const styles = {
  page: {
    marginTop: 10,
  },
};

const HomePage = () => (<div>
  <Menu className="top fix" />
  <div className="ui container" style={styles.page}>
    <RepositoriesList />
  </div>
</div>);

HomePage.displayName = 'HomePage';

export default HomePage;
