import auth0 from 'auth0-js';
import { uiStore } from 'store';
import history from './history';

// eslint-disable-next-line prefer-destructuring
const AUTH0_CLIENTID = process.env.AUTH0_CLIENTID;
// eslint-disable-next-line prefer-destructuring
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
// eslint-disable-next-line prefer-destructuring
const BASE_URL = process.env.BASE_URL;

export class Auth {
  webAuth0 = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENTID,
    redirectUri: `${BASE_URL}/callback`,
    audience: `https://${AUTH0_DOMAIN}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid identities profile email read:user_idp_tokens',
    theme: {
      logo: 'https://cdn2.iconfinder.com/data/icons/snipicons/500/tag-64.png',
    },
  });

  login() {
    uiStore.isAuthenticating = true;
    this.webAuth0.authorize({
      connection: 'github',
    });
  }

  logout() {
    uiStore.clearCurrentUser();
    this.login();
  }

  handleAuthentication() {
    this.webAuth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        console.log(err);
      }
      history.replace('/');
    });
  }

  setSession(authResult) {
    this.webAuth0.client.userInfo(authResult.accessToken, (error, profile) => {
      if (error) {
        console.log(error);
        return;
      }
      uiStore.setLogin({
        accessToken: authResult.accessToken,
        idToken: authResult.idToken,
        expiresAt: (authResult.expiresIn * 1000) + new Date().getTime(),
        profile,
      });
      history.replace('/');
    });
  }
}

export default new Auth();
