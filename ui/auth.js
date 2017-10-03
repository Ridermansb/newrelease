import auth0 from 'auth0-js';
import store from './store';
import history from './history';

const CLIENTID = process.env.CLIENTID;
const DOMAIN = process.env.DOMAIN;

export class Auth {
  webAuth0 = new auth0.WebAuth({
    domain: DOMAIN,
    clientID: CLIENTID,
    redirectUri: 'http://localhost:3000/callback',
    audience: `https://${DOMAIN}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid identities profile email read:user_idp_tokens',
    theme: {
      logo: 'https://cdn2.iconfinder.com/data/icons/snipicons/500/tag-64.png',
    },
  });

  login() {
    store.isAuthenticating = true;
    this.webAuth0.authorize({
      connection: 'github',
    });
  }

  logout() {
    store.clearCurrentUser();
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
      store.setLogin({
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
