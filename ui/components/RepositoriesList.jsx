import React, { PureComponent } from 'react';
import { domainStore } from 'store';
import RepositoryItem from './RepositoryItem';

/*
const setRepositories = repositories => state => ({ ...state, repositories });
*/
const setIsLoadingRepositories = isLoadingRepositories =>
  state => ({ ...state, isLoadingRepositories });

export default class extends PureComponent {
  async componentWillMount() {
    this.setState(setIsLoadingRepositories(true));
    try {
      await domainStore.fetchRepositories();
    } catch (e) {
      console.error(e);
    } finally {
      this.setState(setIsLoadingRepositories(false));
    }
  }

  render() {
    const { isLoadingRepositories } = this.state;
    // const { repositories } = domainStore;
    const repositories = [];

    return (<div className="ui small feed">
      {isLoadingRepositories && <div className="ui active inverted dimmer">
        <div className="ui text loader">Loading repositories</div>
      </div>}
      {repositories && repositories.map(r => <RepositoryItem key={r.id} repository={r} />)}
    </div>);
  }
}
