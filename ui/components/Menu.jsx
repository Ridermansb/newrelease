import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../favicon.png';

export default class extends React.PureComponent {
  static displaName = 'Menu';

  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  render() {
    const { className } = this.props;
    return (<div className={`ui borderless ${className} attached stackable menu`}>
      <div className="ui container">
        <a href="/" className="header item">
          <img src={logo} alt="Logo" className="ui avatar image" />
        </a>
        <div className="item">
          <div className="ui category small search">
            <div className="ui left icon input">
              <i className="github icon" />
              <input className="prompt" type="text" placeholder="Add an repository..." />
            </div>
            <div className="results" />
          </div>
        </div>
        <div className="right menu">
          <div className="ui item inline dropdown">
            <i className="ui avatar user icon" />
            <i className="dropdown icon" />
            <div className="menu">
              <div className="item">
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}
