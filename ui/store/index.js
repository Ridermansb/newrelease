import UiStore from './UiStore';
import DomainStore from './DomainStore';

export class RootStore {
  constructor() {
    this.uiStore = new UiStore(this);
    this.domainStore = new DomainStore(this);
  }
}

const singleton = new RootStore();
const uiStore = singleton.uiStore;
const domainStore = singleton.domainStore;

export { uiStore, domainStore };

export default singleton;
