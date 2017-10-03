import React, { PureComponent } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getLatestReleaseRepository } from 'api';
import Markdown from './Markdown';

const setVersionInfo = version => state => ({ ...state, version });
const setIsLoadingRelease = isLoadingRelease => state => ({ ...state, isLoadingRelease });
const setReleaseLoaded = releaseLoaded => state => ({ ...state, releaseLoaded });

export default class extends PureComponent {
  static propTypes = {
    repository: PropTypes.shape({
      name: PropTypes.string.isRequired,
      full_name: PropTypes.string.isRequired,
      login: PropTypes.string,
      avatar_url: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    login: 'unknown',
    avatar_url: '',
  };

  state = {
    releaseLoaded: false,
    isLoadingRelease: false,
  };

  componentDidMount() {
    const self = this;
    this.$accordion
      .accordion({
        onOpening() {
          const { releaseLoaded } = self.state;
          if (!releaseLoaded) {
            self.loadRelease();
          }
        },
      });
  }

  @autobind
  loadRelease() {
    const { repository } = this.props;
    const { name, owner } = repository;

    this.setState(setIsLoadingRelease(true));
    getLatestReleaseRepository(owner.login, name)
      .then((version) => {
        this.setState(setVersionInfo(version));
      })
      .finally(() => {
        this.setState(setIsLoadingRelease(false));
        this.setState(setReleaseLoaded(true));
      });
  }

  render() {
    const { repository } = this.props;
    const { version, isLoadingRelease } = this.state;

    const versionInfo = version ? (<span className="date">
      <i className="tag icon" /> {version.name} at {moment(version.published_at).fromNow()}
    </span>) : null;
    const versionDescription = version
      ? (<Markdown text={version.body} />)
      : null;

    return (
      <div href={`#${repository.full_name}`} className="event">
        <div className="label">
          <img alt={repository.owner.login} src={repository.owner.avatar_url} />
        </div>
        <div className="content">
          <div className="summary">
            <a href={repository.owner.html_url} target="_blank">{repository.owner.login}</a> &nbsp;/&nbsp;
            <a href={repository.html_url} target="_blank">{repository.name}</a>
            <div className="date">
              {moment(repository.pushed_at).fromNow()}
            </div>
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
          <div className="meta">
            <span className="ui yellow empty circular label" /> {repository.language}
          </div>
        </div>
      </div>
    );
  }
}
