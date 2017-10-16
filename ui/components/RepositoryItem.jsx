/* eslint-disable jsx-a11y/label-has-for */

import React, { PureComponent } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import moment from 'moment';
import { domainStore } from 'store';
import { getLatestReleaseRepository, unsubscribe } from 'api';
import Markdown from './Markdown';

const setVersionInfo = version => state => ({ ...state, version });
const setIsLoadingRelease = isLoadingRelease => state => ({ ...state, isLoadingRelease });
const setIsRemoving = isRemoving => state => ({ ...state, isRemoving });

export default class extends PureComponent {
  static propTypes = {
    repository: PropTypes.shape({
      name: PropTypes.string.isRequired,
      full_name: PropTypes.string.isRequired,
      owner: PropTypes.shape({
        login: PropTypes.string,
      }),
      avatar_url: PropTypes.string,
    }).isRequired,
  };

  state = {
    isRemoving: false,
    isLoadingRelease: false,
  };

  componentDidMount() {
    const self = this;
    this.$accordion.accordion({
      onOpening() {
        if (!self.releaseLoaded) {
          self.loadRelease();
        }
      },
    });
  }

  @autobind
  async loadRelease() {
    const { repository } = this.props;
    const { name, owner } = repository;

    try {
      this.setState(setIsLoadingRelease(true));
      const version = await getLatestReleaseRepository(owner.login, name);
      this.setState(setVersionInfo(version));
    } finally {
      this.setState(setIsLoadingRelease(false));
      this.releaseLoaded = true;
    }
  }

  @autobind
  async removeRepository() {
    const { repository } = this.props;
    try {
      this.setState(setIsRemoving(true));
      await unsubscribe(repository.id);
      const repositories = domainStore.repositories.filter(r => r.id !== repository.id);
      this.setState(setIsRemoving(false));
      domainStore.repositories.replace(repositories);
    } catch (e) {
      this.setState(setIsRemoving(false));
      throw e;
    }
  }

  render() {
    const { repository } = this.props;
    const { version, isLoadingRelease, isRemoving } = this.state;

    const versionInfo = version ? (
      <span className="date">
        <i className="tag icon" /> {version.name} at {moment(version.published_at).fromNow()}
      </span>) : null;
    const versionDescription = version
      ? (<Markdown text={version.body} />)
      : null;

    const close = isRemoving
      ? <div className="ui active inline mini loader" />
      : <i role="presentation" className="close link icon" onKeyPress={this.removeRepository} onClick={this.removeRepository} />;

    return (
      <div href={`#${repository.full_name}`} className="event">
        <div className="label">
          <img alt={repository.owner.login} src={repository.owner.avatar_url} />
        </div>
        <div className="content">
          <div className="summary">
            <a href={repository.owner.html_url} target="_blank">{repository.owner.login}</a> &nbsp;/&nbsp;
            <a href={repository.html_url} target="_blank">{repository.name}</a>
            <span className="date">{moment(repository.pushed_at).fromNow()}</span>
            <span className="date">{close}</span>
          </div>
          <div className="extra text">
            {repository.description}
          </div>
          <div className="extra text">
            <div className="ui horizontal small labels">
              {repository.topics.map(t => <div className="ui label" key={t}>{t}</div>)}
            </div>
          </div>
          <div className="extra text">
            <div className="ui accordion" ref={(el) => { this.$accordion = $(el); }}>
              <div className="title">
                <i className="dropdown icon" /> Last version {versionInfo}
              </div>
              <div className="content">
                {isLoadingRelease && <div className="ui active mini inline loader" />}
                {versionDescription}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
