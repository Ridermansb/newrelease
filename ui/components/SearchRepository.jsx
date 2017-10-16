import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';

export default class extends PureComponent {
  static propTypes = {
    onRepositorySelected: PropTypes.func,
  };

  static defaultProps = {
    onRepositorySelected: undefined,
  };

  componentDidMount() {
    const { onRepositorySelected } = this.props;
    this.$searchField.search({
      // type: 'category',
      apiSettings: {
        action: 'search repositories',
        beforeXHR(xhr) {
          const token = localStorage.getItem('id_token');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Accept', 'application/json');
          return xhr;
        },
        onResponse(githubResponse) {
          if (!githubResponse || !githubResponse.items) {
            return;
          }

          const ownerAvatar = R.path(['owner', 'avatar_url']);
          const assosImage = R.assoc('image');
          const setImage = R.converge(assosImage, [ownerAvatar, R.identity]);

          const mapObject = R.pipe(setImage, R.pickAll([
            'id', 'owner', 'name', 'topics', 'language', 'full_name', 'image', 'description',
          ]));

          /*
          const setProps = R.pipe(setImage, R.pickAll(['image', 'id', 'name', 'owner']));
          /
          const ownerLogin = R.path(['owner', 'login']);
          const groupByLogin = R.groupBy(ownerLogin);
          const getResults = R.pipe(R.map(setProps), groupByLogin);
          const results = getResults(githubResponse.items);
          */

          // eslint-disable-next-line consistent-return
          return { results: R.map(mapObject, githubResponse.items) };
        },
      },
      onSelect: onRepositorySelected,
      fields: {
        title: 'full_name',
      },
      searchDelay: 500,
      hideDelay: 150,
      minCharacters: 3,
    });
  }

  componentWillUnmount() {
    this.$searchField.search('cancel query');
    this.$searchField.search('destroy');
  }

  render() {
    return (
      <div className="ui small search" ref={(el) => { this.$searchField = $(el); }}>
        <div className="ui left icon input">
          <i className="github icon" />
          <input className="prompt" type="text" placeholder="Repository name..." />
        </div>
        <div className="results" />
      </div>
    );
  }
}
