import { observable, action, computed } from 'mobx';

export default class UiStore {
  @observable isAddingRepository = false;

  @observable currentUser = false;
  @observable expiresAt = new Date().getTime();
  @observable isAuthenticating = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.expiresAt = localStorage.getItem('expires_at') || new Date().getTime();
    const storedProfile = localStorage.getItem('profile');
    this.currentUser = storedProfile
      ? JSON.parse(storedProfile)
      : false;
  }

  @computed get isAuthenticated() {
    return this.currentUser && new Date().getTime() < this.expiresAt;
  }

  @action clearCurrentUser() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    this.currentUser = false;
    this.expiresAt = new Date().getTime();
  }

  @action setLogin({
    accessToken, idToken, expiresAt, profile,
  }) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('id_token', idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('profile', JSON.stringify(profile));
    this.currentUser = profile;
    this.expiresAt = expiresAt;
    this.isAuthenticating = false;
  }
}
