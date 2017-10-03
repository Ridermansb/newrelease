
const GITHUB_API_URI = process.env.GITHUB_API_URI;

const fetchHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
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
  const token = localStorage.getItem('id_token');
  const headers = Object.assign({}, fetchHeaders, {
    Authorization: `Bearer ${token}`,
  });
  return fetch('/api/user/repos', {
    method: 'GET',
    headers,
  }).then(checkStatus).then(parseJSON);
}

export function getLatestReleaseRepository(owner, repo) {
  const token = localStorage.getItem('id_token');
  const headers = Object.assign({}, fetchHeaders, {
    Authorization: `Bearer ${token}`,
  });
  return fetch(`/api/repos/${owner}/${repo}/releases/latest`, {
    method: 'GET',
    headers,
  }).then(checkStatus).then(parseJSON);
}
