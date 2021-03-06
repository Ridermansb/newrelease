import { observable, action } from 'mobx';
import { fetchRepositoriesSubscribed } from 'api';

export default class DomainStore {
  @observable repositories = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action async fetchRepositories() {
    const repositories = await fetchRepositoriesSubscribed();
    this.repositories.replace(repositories);
  }
}
