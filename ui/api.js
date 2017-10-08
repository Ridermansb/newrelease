
const GITHUB_API_URI = process.env.GITHUB_API_URI;

const fetchHeaders = {
  'Content-Type': 'application/json',
};

const getWebtaskHeaders = () => {
  const token = localStorage.getItem('id_token');
  return Object.assign({}, fetchHeaders, {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

async function parseJSON(response) {
  const jsonObj = await response.json();
  return jsonObj;
}

export function getPublicRepositories() {
  const headers = Object.assign({}, fetchHeaders, {
    Accept: 'application/vnd.github.mercy-preview+json',
  });
  return fetch(`${GITHUB_API_URI}/repositories`, {
    method: 'GET',
    headers,
  }).then(checkStatus).then(parseJSON);
}
export function getUserRepositories() {
  return fetch('/api/user/repos', {
    method: 'GET',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function getLatestReleaseRepository(owner, repo) {
  return fetch(`/api/repos/${owner}/${repo}/releases/latest`, {
    method: 'GET',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function addHookToRepository(id, owner, repo) {
  return fetch(`/api/repos/${owner}/${repo}/hooks`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function getHook(owner, repo) {
  return fetch(`/api/repos/${owner}/${repo}/hook`, {
    method: 'GET',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function subscribe(repoId) {
  return fetch(`/api/subscribe/${repoId}`, {
    method: 'POST',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function unsubscribe(repoId) {
  return fetch(`/api/subscribe/${repoId}`, {
    method: 'DELETE',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function createSuggestionIssue(id, owner, repo) {
  return fetch(`/api/repos/${owner}/${repo}/issues/`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function fetchRepositoriesSubscribed() {
  return fetch('/api/subscribed', {
    method: 'GET',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function subscribeToPushNotification(subscription) {
  return fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}

export function unsubscribeToPushNotification() {
  return fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: getWebtaskHeaders(),
  }).then(checkStatus).then(parseJSON);
}
