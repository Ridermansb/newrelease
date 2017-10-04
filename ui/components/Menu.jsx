import React from 'react';
import PropTypes from 'prop-types';
import auth from '../auth';
import logo from '../../favicon.png';
import store from '../store';

export default class extends React.PureComponent {
  static displaName = 'Menu';

  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  /*  componentDidMount() {
    this.$dropDownUser
      .dropdown();
  } */

  // eslint-disable-next-line class-methods-use-this
  logoutClick() {
    auth.logout();
  }

  render() {
    const { className } = this.props;
    const { currentUser } = store;

    return (<div className={`ui borderless ${className} attached stackable menu`}>
      <div className="ui container">
        <a href="/" className="header item">
          <img src={logo} alt="Logo" className="ui avatar image" /> New Release
        </a>
        <div className="item">
          <div className="ui category small search">
            <div className="ui left icon input">
              <i className="github icon" />
              <input className="prompt" type="text" placeholder="Search repository..." />
            </div>
            <div className="results" />
          </div>
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
