import React from 'react';
import PropTypes from 'prop-types';
import marked from 'marked';

const Markdown = ({ className, text }) => {
  const htmlMarkdown = marked(text);
  // eslint-disable-next-line react/no-danger
  return <div className={className} dangerouslySetInnerHTML={{ __html: htmlMarkdown }} />;
};

Markdown.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
};
Markdown.defaultProps = {
  className: '',
};

export default Markdown;
