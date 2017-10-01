import React from 'react';
import PropTypes from 'prop-types';
import Menu from 'components/Menu';

const styles = {
  page: {
    marginTop: 10,
  },
};

const RootContainer = ({ children }) => (<div>
  <Menu className="top pointing fix" />
  <div className="ui container" style={styles.page}>
    {children}
  </div>
</div>);

RootContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.arrayOf(PropTypes.node),
  ]).isRequired,
};

RootContainer.displayName = 'RootContainer';

export default RootContainer;
