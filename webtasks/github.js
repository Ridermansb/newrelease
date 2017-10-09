/* eslint-disable import/no-extraneous-dependencies,no-param-reassign,strict */

'use strict';

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
const mcache = require('memory-cache');
const webPush = require('web-push');

const app = express();

webPush.setVapidDetails(
  'mailto:ridermansb@gmail.com',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE,
);

const GITHUB_URL = 'https://api.github.com';
const defaultStorage = { users: [], repos: [], suggestions: [] };

function Management(secrets) {
  return new ManagementClient({
    domain: secrets.auth0_domain,
    clientId: secrets.client_id,
    clientSecret: secrets.client_secret,
    audience: secrets.auth0_audience,
    scope: 'read:users read:user_idp_tokens',
  });
}

// region Express middles

/**
 * Cache the request using memory-cache
 * @see https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
 * @param {!number} duration - Duration in seconds that will be expired
 * @returns {function(*, *, *)}
 */
function cache(duration) {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl}` || req.url;
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
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

/**
 * Check if hook has a valid secret
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function validateSecret(req, res, next) {
  const { secrets } = req.webtaskContext;
  if (req.body.hook.config.secret === secrets.gh_hook_secret) {
    return next();
  }
  return res.boom.unauthorized('Invalid token');
}

app.use(boom());
app.use(requireAuth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(authUser);

// endregion

// region Helpers functions

function requestFromGithubAPI(method, req, res, route, body) {
  const json = method !== 'GET' ? body : true;
  const routes = route.trim().split('?');
  const params = routes.length > 1 ? `&${routes[1]}` : '';
  const url = `${GITHUB_URL}/${routes[0]}?client_id=${req.webtaskContext.secrets.gh_client_id}&client_secret=${req.webtaskContext.secrets.gh_client_secret}${params}`;

  return new Promise((resolve, reject) => {
    request({ url,
      method,
      json,
      headers: {
        Authorization: `token ${res.locals.githubIdp.access_token}`,
        Accept: 'application/vnd.github.mercy-preview+json',
        'Content-Type': 'application/json',
        'User-Agent': req.headers['user-agent'],
      },
    }, (error, response, jsonResp) => {
      if (error) {
        res.boom.badRequest('Ops, are you there GitHub?', error);
        return reject(error);
      }
      if (jsonResp.message === 'Not Found') {
        res.boom.notFound();
        return reject(jsonResp);
      } else if (jsonResp.documentation_url) {
        res.boom.badRequest("Validation didn't suceed", jsonResp);
        return reject(jsonResp);
      }

      return resolve(jsonResp);
    });
  });
}

/**
 * Lookup or create data in storage and return it
 * @param storage
 * @param {!string} propName - Key name in storage
 * @param id - The id of the data
 * @param defaultData - Default data if not found
 * @param cb
 */
function ensureData(storage, propName, id, defaultData, cb) {
  storage.get((error, data) => {
    if (error) {
      throw error;
    }

    const newData = data || defaultStorage;
    if (!newData[propName]) {
      newData[propName] = [];
    }
    let userData = newData[propName].find(u => u.id === id);
    if (!userData) {
      newData[propName].push({ id, ...defaultData });
      userData = newData[propName].find(u => u.id === id);
    }
    storage.set(newData, (errorSet) => {
      if (errorSet) {
        throw errorSet;
      }
      cb(userData, newData);
    });
  });
}

// endregion

// region Github API Proxy

app.get('/user/repos', cache(120), (req, res) => {
  requestFromGithubAPI('GET', req, res, 'user/repos?affiliation=owner,organization_member&sort=updated')
    .then(resp => res.json(resp));
});

app.get('/repos/:owner/:repo/releases/latest', cache(120), (req, res) => {
  requestFromGithubAPI('GET', req, res, `repos/${req.params.owner}/${req.params.repo}/releases/latest`)
    .then(resp => res.json(resp));
});

/**
 * Create new Hook on repository and save repo and hook to storage
 */
app.post('/repos/:owner/:repo/hooks', (req, res) => {
  const { owner, repo } = req.params;
  const { storage, secrets } = req.webtaskContext;
  const { id } = req.body;

  function saveHookAndRepo(body) {
    try {
      ensureData(storage, 'repos', id, { hook: false }, (repositoryData, allData) => {
        Object.assign(repositoryData, { hook: body.id, owner, repo });
        storage.set(allData, () => res.json(body));
      });
    } catch (e) {
      console.error('Ops', e);
      res.boom.badImplementation(e);
    }
  }

  requestFromGithubAPI('POST', req, res, `repos/${owner}/${repo}/hooks`, {
    name: 'web',
    events: ['release'],
    active: true,
    config: {
      url: secrets.hook_url,
      content_type: 'json',
      secret: secrets.gh_hook_secret,
    },
  }).then(saveHookAndRepo);
});

app.get('/search/repositories', cache(120), (req, res) => {
  const query = Object
    .keys(req.query)
    .map(key => `${key}=${req.query[key]}`);

  requestFromGithubAPI('GET', req, res, `search/repositories?${query.join('&')}`)
    .then(resp => res.json(resp));
});

app.get('/repos/:owner/:repo/hook', cache(120), (req, res) => {
  const { owner, repo } = req.params;
  const { secrets } = req.webtaskContext;

  requestFromGithubAPI('GET', req, res, `repos/${owner}/${repo}/hooks`)
    .then((body) => {
      const hook = body.find(h => h.name === 'web' && h.config && h.config.url.startsWith(secrets.hook_url));
      if (hook) {
        res.json(hook);
      } else {
        res.boom.notFound();
      }
    });
});

// endregion

// region New Release API

app.post('/repos/:owner/:repo/issues', (req, res) => {
  const { id } = req.body;
  const { owner, repo } = req.params;
  const { storage } = req.webtaskContext;
  const { user_id } = res.locals.user;

  function saveSuggestion(body) {
    try {
      ensureData(storage, 'suggestions', id, { users: [], issues: [] }, (repoSuggestions, allData) => {
        repoSuggestions.users.push(user_id);
        repoSuggestions.issues.push(body.id);
        storage.set(allData, () => res.json(body));
      });
    } catch (e) {
      console.error('Ops', e);
      res.boom.badImplementation(e);
    }
  }

  requestFromGithubAPI('POST', req, res, `repos/${owner}/${repo}/issues`, {
    title: 'Integrate suggestion to increase engagement',
    body: `Hi ${owner}.

I'm using a web app that allows me to be notified of every new release.
Will be cool if you enable this feature for then **${repo}**.
It is very simple, 
      
1. Go to [New Release website (newrelease.ridermansb.me) ](http://newrelease.ridermansb.me) 
2. Log in with your Github account 
3. Search your repository on searchbox  and select it
      
Done :)`,
  }).then(saveSuggestion);
});

app.post('/subscribe/:repoId(\\d+)', (req, res) => {
  const { storage } = req.webtaskContext;
  const { repoId } = req.params;
  const { user_id } = res.locals.user;

  function saveData(dataToSave) {
    storage.set(dataToSave, (errorSet) => {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }
      return res.status(201).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, (userData, allData) => {
      if (userData.subscriptions.find(s => s === parseInt(repoId, 10))) {
        return res.status(201).json({ ok: true });
      }
      userData.subscriptions.push(parseInt(repoId, 10));
      return saveData(allData);
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.get('/subscribed', (req, res) => {
  const { storage } = req.webtaskContext;
  const { user_id } = res.locals.user;

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, (userData, allData) => {
      const fetchAllRepos = userData.subscriptions.reduce((acc, s) => {
        const repo = allData.repos.find(r => r.id === s);
        if (repo) {
          acc.push(requestFromGithubAPI('GET', req, res, `repos/${repo.owner}/${repo.repo}`)
            .then(r => ({ newrelease: { hook: !!repo.hook }, ...r })));
        }
        // TODO if is in subscribed and not in repo, sometimg is wrong.. add into warnign list
        return acc;
      }, []);
      Promise.all(fetchAllRepos)
        .then(resp => res.json(resp))
        .catch(e => res.boom.badImplementation(e));
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.delete('/subscribe/:repoId(\\d+)', (req, res) => {
  const { storage } = req.webtaskContext;
  const { repoId } = req.params;
  const { user_id } = res.locals.user;

  function saveData(dataToSave) {
    storage.set(dataToSave, (errorSet) => {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }
      return res.status(200).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, (userData, allData) => {
      userData.subscriptions = userData.subscriptions.filter(s => s !== parseInt(repoId, 10));
      return saveData(allData);
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.post('/newrelease', (req, res) => {
  const { storage } = req.webtaskContext;

  const { repository } = req.body;

  storage.get((error, data) => {
    if (error) {
      throw error;
    }

    const payload = JSON.stringify({
      title: `New version of ${repository.full_name} available`,
      body: repository.description,
      icon: repository.owner.avatar_url,
      // url: repository.html_url
    });
    const options = { TTL: 3600 /* 1sec * 60 * 60 = 1h */ };
    const usersSubscribed = data.users.filter(u => u.subscriptions.includes(repository.id));
    console.log('Launching push ', usersSubscribed);
    const pushingPromises = usersSubscribed
      .map(user => webPush.sendNotification(user.subscriptionKeys, payload, options));
    Promise.all(pushingPromises)
      .then(resp => res.json(resp))
      .catch(e => res.boom.badImplementation(e));
  });

  // TODO find all users that subscribe for this repository
  // Fire push notification for everyone

  res.json({ isOk: true });
});

app.post('/push/subscribe', (req, res) => {
  const { storage } = req.webtaskContext;
  const { user_id } = res.locals.user;

  const subscription = {
    endpoint: req.body.endpoint,
    keys: {
      p256dh: req.body.keys.p256dh,
      auth: req.body.keys.auth,
    },
  };

  function saveData(dataToSave) {
    storage.set(dataToSave, (errorSet) => {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }

      // Send thanks
      const payload = JSON.stringify({
        title: 'Welcome',
        body: 'Thank you for enabling push notifications',
      });
      const options = { TTL: 3600 /* 1sec * 60 * 60 = 1h */ };
      webPush.sendNotification(subscription, payload, options)
        .then(() => { res.status(200).json({ ok: true }); })
        .catch(err => res.boom.badImplementation('Unable to send welcome push notification', err));

      // Return request
      return res.status(200).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, (userData, allData) => {
      userData.subscriptionKeys = subscription;
      return saveData(allData);
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.delete('/push/subscribe', (req, res) => {
  const { storage } = req.webtaskContext;
  const { user_id } = res.locals.user;

  function saveData(dataToSave) {
    storage.set(dataToSave, (errorSet) => {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }
      return res.status(200).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, (userData, allData) => {
      delete userData.subscriptionKeys;
      return saveData(allData);
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

// endregion

module.exports = Webtask.fromExpress(app);
