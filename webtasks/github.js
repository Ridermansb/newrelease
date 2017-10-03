/* eslint-disable import/no-extraneous-dependencies */

/**
 * Make request to Github API to get all repositories
 * Headers: { Authorization: Bearer  <AUTH0 USER API TOKEN> }
 *
 * On WebTask
 * Secrets required:
 * 1. auth0_domain - Auth0 Client Domain
 * 2. client_id
 * 3. client_secret
 * 4. auth0_audience - Auth0 Client Audience
 * 5. gh_client_id - Github App Client ID
 * 6. gh_client_secret - Github App Client Secret
 *
 * @todo Use Storage to store Github AccessToken for user
 * @type {request}
 */

const request = require('request');
const ManagementClient = require('auth0').ManagementClient;
const express = require('express');
const Webtask = require('webtask-tools');
const bodyParser = require('body-parser');
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');
const boom = require('express-boom');

const app = express();

const GITHUB_URL = 'https://api.github.com';

function Management(secrets) {
  return new ManagementClient({
    domain: secrets.auth0_domain,
    clientId: secrets.client_id,
    clientSecret: secrets.client_secret,
    audience: secrets.auth0_audience,
    scope: 'read:users read:user_idp_tokens',
  });
}

/**
 * Validate request against Auth0 JWT well-known
 */
function requireAuth(req, res, next) {
  const issuer = `https://${req.webtaskContext.secrets.auth0_domain}/`;
  jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}.well-known/jwks.json`,
    }),
    // audience: req.webtaskContext.secrets.auth0_audience,
    issuer,
    algorithms: ['RS256'],
  }).unless({
    path: [
      { url: '/newrelease', methods: ['POST'] },
      { url: '/github/newrelease', methods: ['POST'] },
    ],
  })(req, res, next);
}

/**
 * Express middleware that inject user and githubIdp on locals
 */
function authUser(req, res, next) {
  const managementClient = new Management(req.webtaskContext.secrets);
  managementClient.getUser({ access_token: req.webtaskContext.token }, (err, users) => {
    if (err) {
      return res.boom.badImplementation('Error when try to get user info', err);
    }
    res.locals.user = users[0];
    res.locals.githubIdp = res.locals.user
      .identities
      .filter(it => it.provider === 'github')[0];

    return next();
  });
}

app.use(boom());
app.use(requireAuth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(authUser);

function requestFromGithubAPI(method, req, res, route, body, cb) {
  // eslint-disable-next-line no-param-reassign
  cb = cb || body;
  const json = method !== 'GET' ? body : true;

  const routes = route.trim().split('?');
  const params = routes.length > 1 ? routes[1] : '';
  const url = `${GITHUB_URL}/${routes[0]}?client_id=${req.webtaskContext.secrets.gh_client_id}&client_secret=${req.webtaskContext.secrets.gh_client_secret}&${params}`;
  request({
    url,
    method,
    json,
    headers: {
      Authorization: `token ${res.locals.githubIdp.access_token}`,
      Accept: 'application/vnd.github.mercy-preview+json',
      'Content-Type': 'application/json',
      'User-Agent': req.headers['user-agent'],
    },
  }, (error, response, jsonResp) => {
    if (error) throw new Error(error);
    if (jsonResp.message === 'Not Found') {
      return res.boom.notFound();
    } else if (jsonResp.documentation_url) {
      return res.boom.badRequest("Validation didn't suceed", jsonResp);
    }
    return cb(response, jsonResp);
  });
}

app.get('/user/repos', (req, res) => {
  requestFromGithubAPI('GET', req, res, 'user/repos?affiliation=owner,organization_member&sort=updated',
    (response, body) => res.json(body));
});

app.get('/repos/:owner/:repo/releases/latest', (req, res) => {
  requestFromGithubAPI('GET', req, res, `repos/${req.params.owner}/${req.params.repo}/releases/latest`,
    (response, body) => res.json(body));
});

app.post('/repos/:owner/:repo/hooks', (req, res) => {
  const HOOK_URL = 'https://wt-ridermansb-gmail_com-0.run.webtask.io/github/newrelease';
  requestFromGithubAPI('POST', req, res, `repos/${req.params.owner}/${req.params.repo}/hooks`, {
    name: 'web',
    events: ['release'],
    active: true,
    config: {
      url: HOOK_URL,
      content_type: 'json',
      secret: req.webtaskContext.secrets.gh_hook_secret,
    },
  }, (response, body) => res.json(body));
});

app.post('/newrelease', (req, res) => {
  console.log(req);
  res.json({ isOk: true });
});

module.exports = Webtask.fromExpress(app);
