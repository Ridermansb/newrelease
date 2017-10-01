import React from 'react';
import PropTypes from 'prop-types';

const RepositoriesList = ({ repository }) => (
  <a className="ui card" href={repository.html_url} target="_blank">
    <div className="content">
      <i className="right floated star icon" />
      <div className="header">
        {repository.full_name}
      </div>
      <div className="meta">
        {repository.description}
      </div>
      <div className="description">
          Elliot requested permission to view your contact details
      </div>
    </div>
    {repository.owner &&
      <div className="extra content">
        <span className="left floated like">
          <i className="tag icon" /> v1.2.3
        </span>
        <div className="right floated author">
          <img
            className="ui avatar image"
            alt={repository.owner.login}
            src={repository.owner.avatar_url}
          /> {repository.owner.login}
        </div>
      </div>
    }
  </a>
);

RepositoriesList.propTypes = {
  repository: PropTypes.shape({
    full_name: PropTypes.string.isRequired,
    login: PropTypes.string.isRequired,
    avatar_url: PropTypes.string.isRequired,
  }).isRequired,
};

export default RepositoriesList;
