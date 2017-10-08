import React, { PureComponent } from 'react';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { subscribeToPushNotification } from 'api';
import RepositoriesList from 'components/RepositoriesList';
import demo from 'assets/images/enable-notification.png';
import RootContainer from '../containers/RootContainer';
import logo from '../../favicon.png';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC;

function urlB64ToUint8Array(base64String) {
  // eslint-disable-next-line no-mixed-operators
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const setSubscription = subscription => state => ({ ...state, subscription });
const setIsEnablingNotification = isEnablingNotification =>
  state => ({ ...state, isEnablingNotification });
const setIsWaitingToAllowNotifications = isWaitingToAllowNotifications =>
  state => ({ ...state, isWaitingToAllowNotifications });

export default class extends PureComponent {
  static displayName = 'HomePage';

  state = {
    subscription: false,
    hasSupport: false,
  };

  async componentWillMount() {
    // Are Notifications supported in the service worker?
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      console.warn('Notifications aren\'t supported.');
      return;
    }

    // Check the current Notification permission.
    if (Notification.permission === 'denied') {
      console.warn('The user has blocked notifications.');
      return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      console.warn('Push messaging isn\'t supported.');
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      this.setState(setSubscription(subscription));
    } catch (e) {
      console.warn('Error during mount()', e);
    }
  }

  @autobind
  async enablePushNotification(event) {
    event.preventDefault();
    try {
      this.setState(setIsWaitingToAllowNotifications(true));
      const status = await Notification.requestPermission();
      this.setState(setIsWaitingToAllowNotifications(false));
      if (status === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        this.updateSubscriptionOnServer(reg);
      }
    } catch (error) {
      console.log('Error enabling not', error);
    } finally {
      this.setState(setIsWaitingToAllowNotifications(false));
    }
  }

  @autobind
  async updateSubscriptionOnServer(reg) {
    try {
      this.setState(setIsEnablingNotification(true));
      const newSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC),
      });

      this.setState(setSubscription(newSubscription));
      await subscribeToPushNotification(newSubscription);
    } catch (e) {
      console.error('Ops', e);
    } finally {
      this.setState(setIsEnablingNotification(false));
    }
  }

  render() {
    const { subscription,
      isEnablingNotification,
      isWaitingToAllowNotifications } = this.state;

    const enableNotificationsButton = cx('ui primary', {
      loading: isEnablingNotification,
    }, 'button');

    return (<RootContainer>
      {!subscription && <h2 className="ui center aligned icon header">
        <img src={logo} className="ui image" alt="Logo" />
        <div className="content">
          Enable push notification on your browser
          <div className="sub header">To be able notify you, we need be able to send notifications over chrome.</div>
          {isWaitingToAllowNotifications &&
            <img src={demo} className="ui bordered rounded centered image" alt="Demo how to enable notification" />
          }
          <button className={enableNotificationsButton} onClick={this.enablePushNotification}>
            Enable notifications
          </button>
        </div>
      </h2>}
      {subscription && <RepositoriesList />}
    </RootContainer>);
  }
}
