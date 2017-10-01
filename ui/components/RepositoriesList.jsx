import React, { PureComponent } from 'react';
import { getAllPublicRepositories } from 'api';
import RepositoryItem from './RepositoryItem';

const setRepositories = repositories => state => ({ ...state, repositories });

export default class extends PureComponent {
  state = {
    repositories: [],
  };

  componentWillMount() {
    getAllPublicRepositories().then((repos) => {
      this.setState(setRepositories(repos));
    });
  }

  render() {
    const { repositories } = this.state;

    return (<div className="ui stackable cards">
      {repositories && repositories.map(r => <RepositoryItem key={r.id} repository={r} />)}
    </div>);
  }
}
