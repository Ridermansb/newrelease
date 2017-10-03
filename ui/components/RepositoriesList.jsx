import React, { PureComponent } from 'react';
import { getUserRepositories } from 'api';
import RepositoryItem from './RepositoryItem';

const setRepositories = repositories => state => ({ ...state, repositories });
const setIsLoadingRepositories = isLoadingRepositories =>
  state => ({ ...state, isLoadingRepositories });

export default class extends PureComponent {
  state = {
    repositories: [],
    isLoadingRepositories: true,
  };

  componentWillMount() {
    getUserRepositories()
      .then((repos) => {
        this.setState(setRepositories(repos));
      })
      .finally(() => {
        this.setState(setIsLoadingRepositories(false));
      });
  }

  render() {
    const { repositories, isLoadingRepositories } = this.state;

    return (<div className="ui feed">
      {isLoadingRepositories && <div className="ui active inverted dimmer">
        <div className="ui text loader">Loading repositories</div>
      </div>}
      {repositories && repositories.map(r => <RepositoryItem key={r.id} repository={r} />)}
    </div>);
  }
}
