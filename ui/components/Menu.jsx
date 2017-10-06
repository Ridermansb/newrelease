import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { addHookToRepository, getHook, subscribe, createSuggestionIssue } from 'api';
import { uiStore, domainStore } from 'store';
import auth from '../auth';
import logo from '../../favicon.png';
import SearchRepository from './SearchRepository';


export default class extends React.PureComponent {
  static displaName = 'Menu';

  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  componentDidMount() {
    // this.$dropDownUser.dropdown();
  }

  // eslint-disable-next-line class-methods-use-this
  logoutClick() {
    auth.logout();
  }

  @autobind
  // eslint-disable-next-line class-methods-use-this
  async repositorySelected(repository) {
    const { currentUser } = uiStore;
    const { name, owner, id } = repository;

    try {
      uiStore.isAddingRepository = true;
      await getHook(owner.login, name);
      if (!domainStore.repositories.find(r => r.id === id)) {
        domainStore.repositories.push(repository);
      }
      subscribe(id);
    } catch (e) {
      if (e.response.status === 404) {
        const repositoryIsMine = currentUser.nickname === repository.owner.login;
        if (repositoryIsMine) {
          addHookToRepository(id, owner.login, name);
          this.$askSubscription
            .modal({
              closable: false,
              onDeny() { return false; },
              onApprove() {
                domainStore.repositories.push(repository);
                subscribe(id);
              },
            }).modal('show');
        } else {
          this.askToSuggestIntegration(repository);
        }
      }
    } finally {
      uiStore.isAddingRepository = false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  askToSuggestIntegration(repository) {
    const { name, owner, id } = repository;
    this.$suggestIntegration
      .modal({
        closable: false,
        onDeny() { return false; },
        onApprove() { createSuggestionIssue(id, owner.login, name); },
      }).modal('show');
  }

  render() {
    const { className } = this.props;
    const { currentUser } = uiStore;

    return (<div className={`ui borderless ${className} attached stackable menu`}>

      <div className="ui modal" ref={(el) => { this.$askSubscription = $(el); }}>
        <div className="header">Repository add successfully</div>
        <div className="content">
          You want to subscribe on any new release?
        </div>
        <div className="actions">
          <div className="ui deny button">No</div>
          <div className="ui positive button">Yes</div>
        </div>
      </div>
      <div className="ui modal" ref={(el) => { this.$suggestIntegration = $(el); }}>
        <div className="header">Repository not ready</div>
        <div className="content">
          The owner of this repository does not configure yet, do you want to suggest him?
        </div>
        <div className="actions">
          <div className="ui deny button">Not now</div>
          <div className="ui positive button">Yes, send suggestion</div>
        </div>
      </div>

      <div className="ui container">
        <a href="/" className="header item">
          <img src={logo} alt="Logo" className="ui avatar image" /> New Release
        </a>
        <div className="item">
          <SearchRepository onRepositorySelected={this.repositorySelected} />
        </div>
        <div className="right menu">
          <div className="item">
            <img className="ui avatar image" src={currentUser.picture} alt="User avatar" />
          </div>
          <button className="ui button item" onClick={this.logoutClick} >
            <i className="icon sign out" />
          </button>
          {/*
          <div
            className="ui item inline dropdown"
          >
            <i className="ui avatar user icon" />
            <i className="dropdown icon" />
            <div className="menu">
              <button className="item" ref={((el) => { this.$dropDownUser = el; })}
               onClick={this.logoutClick}>
                Logout
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>);
  }
}
