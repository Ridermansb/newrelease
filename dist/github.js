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

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request');
var ManagementClient = require('auth0').ManagementClient;
var express = require('express');
var Webtask = require('webtask-tools');
var bodyParser = require('body-parser');
var jwksRsa = require('jwks-rsa');
var jwt = require('express-jwt');
var boom = require('express-boom');
var mcache = require('memory-cache');
var webPush = require('web-push');

var app = express();

webPush.setVapidDetails('mailto:ridermansb@gmail.com', 'BPyFTYiI7KYLxwnUtrS_suhTPgU4oMTRPbNsYlXe70cJolJRqAq0KOPEKh3i-D5oMrPYQYaPgcVZ9e3iw4MHeTw', '4unozboIyQUI0h6Z0TEQJfyJpAcqm75MY6uBsLI5HWE');

var GITHUB_URL = 'https://api.github.com';
var defaultStorage = { users: [], repos: [], suggestions: [] };

function Management(secrets) {
  return new ManagementClient({
    domain: secrets.auth0_domain,
    clientId: secrets.client_id,
    clientSecret: secrets.client_secret,
    audience: secrets.auth0_audience,
    scope: 'read:users read:user_idp_tokens'
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
  return function (req, res, next) {
    var key = '__express__' + req.originalUrl || req.url;
    var cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
    } else {
      res.sendResponse = res.send;
      res.send = function (body) {
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
  var issuer = 'https://' + req.webtaskContext.secrets.auth0_domain + '/';
  jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: issuer + '.well-known/jwks.json'
    }),
    // audience: req.webtaskContext.secrets.auth0_audience,
    issuer: issuer,
    algorithms: ['RS256']
  }).unless({
    path: [{ url: '/newrelease', methods: ['POST'] }, { url: '/github/newrelease', methods: ['POST'] }]
  })(req, res, next);
}

/**
 * Express middleware that inject user and githubIdp on locals
 */
function authUser(req, res, next) {
  var managementClient = new Management(req.webtaskContext.secrets);
  managementClient.getUser({ access_token: req.webtaskContext.token }, function (err, users) {
    if (err) {
      return res.boom.badImplementation('Error when try to get user info', err);
    }
    res.locals.user = users[0];
    res.locals.githubIdp = res.locals.user.identities.filter(function (it) {
      return it.provider === 'github';
    })[0];

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
  var secrets = req.webtaskContext.secrets;

  if (req.body.hook.config.secret === secrets.gh_hook_secret) {
    return next();
  }
  return res.boom.unauthorized('Invalid token');
}

app.use(boom());
app.use(requireAuth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(authUser);

// endregion

// region Helpers functions

function requestFromGithubAPI(method, req, res, route, body) {
  var json = method !== 'GET' ? body : true;
  var routes = route.trim().split('?');
  var params = routes.length > 1 ? '&' + routes[1] : '';
  var url = GITHUB_URL + '/' + routes[0] + '?client_id=' + req.webtaskContext.secrets.gh_client_id + '&client_secret=' + req.webtaskContext.secrets.gh_client_secret + params;

  return new _promise2.default(function (resolve, reject) {
    request({ url: url,
      method: method,
      json: json,
      headers: {
        Authorization: 'token ' + res.locals.githubIdp.access_token,
        Accept: 'application/vnd.github.mercy-preview+json',
        'Content-Type': 'application/json',
        'User-Agent': req.headers['user-agent']
      }
    }, function (error, response, jsonResp) {
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
  storage.get(function (error, data) {
    if (error) {
      throw error;
    }

    var newData = data || defaultStorage;
    if (!newData[propName]) {
      newData[propName] = [];
    }
    var userData = newData[propName].find(function (u) {
      return u.id === id;
    });
    if (!userData) {
      newData[propName].push((0, _extends3.default)({ id: id }, defaultData));
      userData = newData[propName].find(function (u) {
        return u.id === id;
      });
    }
    storage.set(newData, function (errorSet) {
      if (errorSet) {
        throw errorSet;
      }
      cb(userData, newData);
    });
  });
}

// endregion

// region Github API Proxy

app.get('/user/repos', cache(120), function (req, res) {
  requestFromGithubAPI('GET', req, res, 'user/repos?affiliation=owner,organization_member&sort=updated').then(function (resp) {
    return res.json(resp);
  });
});

app.get('/repos/:owner/:repo/releases/latest', cache(120), function (req, res) {
  requestFromGithubAPI('GET', req, res, 'repos/' + req.params.owner + '/' + req.params.repo + '/releases/latest').then(function (resp) {
    return res.json(resp);
  });
});

/**
 * Create new Hook on repository and save repo and hook to storage
 */
app.post('/repos/:owner/:repo/hooks', function (req, res) {
  var _req$params = req.params,
      owner = _req$params.owner,
      repo = _req$params.repo;
  var _req$webtaskContext = req.webtaskContext,
      storage = _req$webtaskContext.storage,
      secrets = _req$webtaskContext.secrets;
  var id = req.body.id;


  function saveHookAndRepo(body) {
    try {
      ensureData(storage, 'repos', id, { hook: false }, function (repositoryData, allData) {
        (0, _assign2.default)(repositoryData, { hook: body.id, owner: owner, repo: repo });
        storage.set(allData, function () {
          return res.json(body);
        });
      });
    } catch (e) {
      console.error('Ops', e);
      res.boom.badImplementation(e);
    }
  }

  requestFromGithubAPI('POST', req, res, 'repos/' + owner + '/' + repo + '/hooks', {
    name: 'web',
    events: ['release'],
    active: true,
    config: {
      url: secrets.hook_url,
      content_type: 'json',
      secret: secrets.gh_hook_secret
    }
  }).then(saveHookAndRepo);
});

app.get('/search/repositories', cache(120), function (req, res) {
  var query = (0, _keys2.default)(req.query).map(function (key) {
    return key + '=' + req.query[key];
  });

  requestFromGithubAPI('GET', req, res, 'search/repositories?' + query.join('&')).then(function (resp) {
    return res.json(resp);
  });
});

app.get('/repos/:owner/:repo/hook', cache(120), function (req, res) {
  var _req$params2 = req.params,
      owner = _req$params2.owner,
      repo = _req$params2.repo;
  var secrets = req.webtaskContext.secrets;


  requestFromGithubAPI('GET', req, res, 'repos/' + owner + '/' + repo + '/hooks').then(function (body) {
    var hook = body.find(function (h) {
      return h.name === 'web' && h.config && h.config.url.startsWith(secrets.hook_url);
    });
    if (hook) {
      res.json(hook);
    } else {
      res.boom.notFound();
    }
  });
});

// endregion

// region New Release API

app.post('/repos/:owner/:repo/issues', function (req, res) {
  var id = req.body.id;
  var _req$params3 = req.params,
      owner = _req$params3.owner,
      repo = _req$params3.repo;
  var storage = req.webtaskContext.storage;
  var user_id = res.locals.user.user_id;


  function saveSuggestion(body) {
    try {
      ensureData(storage, 'suggestions', id, { users: [], issues: [] }, function (repoSuggestions, allData) {
        repoSuggestions.users.push(user_id);
        repoSuggestions.issues.push(body.id);
        storage.set(allData, function () {
          return res.json(body);
        });
      });
    } catch (e) {
      console.error('Ops', e);
      res.boom.badImplementation(e);
    }
  }

  requestFromGithubAPI('POST', req, res, 'repos/' + owner + '/' + repo + '/issues', {
    title: 'Integrate suggestion to increase engagement',
    body: 'Hi ' + owner + '.\n\nI\'m using a web app that allows me to be notified of every new release.\nWill be cool if you enable this feature for then **' + repo + '**.\nIt is very simple, \n      \n1. Go to [New Release website (newrelease.ridermansb.me) ](http://newrelease.ridermansb.me) \n2. Log in with your Github account \n3. Search your repository on searchbox  and select it\n      \nDone :)'
  }).then(saveSuggestion);
});

app.post('/subscribe/:repoId(\\d+)', function (req, res) {
  var storage = req.webtaskContext.storage;
  var repoId = req.params.repoId;
  var user_id = res.locals.user.user_id;


  function saveData(dataToSave) {
    storage.set(dataToSave, function (errorSet) {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }
      return res.status(201).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, function (userData, allData) {
      if (userData.subscriptions.find(function (s) {
        return s === parseInt(repoId, 10);
      })) {
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

app.get('/subscribed', function (req, res) {
  var storage = req.webtaskContext.storage;
  var user_id = res.locals.user.user_id;


  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, function (userData, allData) {
      var fetchAllRepos = userData.subscriptions.reduce(function (acc, s) {
        var repo = allData.repos.find(function (r) {
          return r.id === s;
        });
        if (repo) {
          acc.push(requestFromGithubAPI('GET', req, res, 'repos/' + repo.owner + '/' + repo.repo).then(function (r) {
            return (0, _extends3.default)({ newrelease: { hook: !!repo.hook } }, r);
          }));
        }
        // TODO if is in subscribed and not in repo, sometimg is wrong.. add into warnign list
        return acc;
      }, []);
      _promise2.default.all(fetchAllRepos).then(function (resp) {
        return res.json(resp);
      }).catch(function (e) {
        return res.boom.badImplementation(e);
      });
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.delete('/subscribe/:repoId(\\d+)', function (req, res) {
  var storage = req.webtaskContext.storage;
  var repoId = req.params.repoId;
  var user_id = res.locals.user.user_id;


  function saveData(dataToSave) {
    storage.set(dataToSave, function (errorSet) {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }
      return res.status(200).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, function (userData, allData) {
      userData.subscriptions = userData.subscriptions.filter(function (s) {
        return s !== parseInt(repoId, 10);
      });
      return saveData(allData);
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.post('/newrelease', function (req, res) {
  var storage = req.webtaskContext.storage;
  var repository = req.body.repository;


  storage.get(function (error, data) {
    if (error) {
      throw error;
    }

    var payload = (0, _stringify2.default)({
      title: repository.full_name + ' release available',
      body: repository.description,
      icon: repository.owner.avatar_url,
      data: {
        html_url: repository.html_url,
        updated_at: repository.updated_at
      }
      // tag: repository.id,
    });
    var options = { TTL: 3600 /* 1sec * 60 * 60 = 1h */ };
    var usersSubscribed = data.users.filter(function (u) {
      return u.subscriptions.find(function (s) {
        return s === repository.id;
      });
    });
    var pushingPromises = usersSubscribed.map(function (user) {
      return webPush.sendNotification(user.subscriptionKeys, payload, options);
    });
    _promise2.default.all(pushingPromises).then(function (resp) {
      return res.json(resp);
    }).catch(function (e) {
      return res.boom.badImplementation(e);
    });
  });
});

app.post('/push/subscribe', function (req, res) {
  var storage = req.webtaskContext.storage;
  var user_id = res.locals.user.user_id;


  var subscription = {
    endpoint: req.body.endpoint,
    keys: {
      p256dh: req.body.keys.p256dh,
      auth: req.body.keys.auth
    }
  };

  function saveData(dataToSave) {
    storage.set(dataToSave, function (errorSet) {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }

      // Send thanks
      var payload = (0, _stringify2.default)({
        title: 'Welcome',
        body: 'Thank you for enabling push notifications'
      });
      var options = { TTL: 3600 /* 1sec * 60 * 60 = 1h */ };
      webPush.sendNotification(subscription, payload, options).then(function () {
        res.status(200).json({ ok: true });
      }).catch(function (err) {
        return res.boom.badImplementation('Unable to send welcome push notification', err);
      });

      // Return request
      return res.status(200).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, function (userData, allData) {
      userData.subscriptionKeys = subscription;
      return saveData(allData);
    });
  } catch (e) {
    console.error('Ops', e);
    res.boom.badImplementation(e);
  }
});

app.delete('/push/subscribe', function (req, res) {
  var storage = req.webtaskContext.storage;
  var user_id = res.locals.user.user_id;


  function saveData(dataToSave) {
    storage.set(dataToSave, function (errorSet) {
      if (errorSet) {
        return res.boom.badImplementation(errorSet);
      }
      return res.status(200).json({ ok: true });
    });
  }

  try {
    ensureData(storage, 'users', user_id, { subscriptions: [] }, function (userData, allData) {
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

