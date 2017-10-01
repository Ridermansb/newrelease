
const GITHUB_API_URI = process.env.GITHUB_API_URI;

const fetchGithubHeaders = {
  Accept: 'application/vnd.github.mercy-preview+json',
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

export function getAllPublicRepositories() {
  return fetch(`${GITHUB_API_URI}/repositories`, {
    method: 'GET',
    headers: fetchGithubHeaders,
  }).then(checkStatus).then(parseJSON);
}
export function getRepositories(query) {
  return fetch(`${GITHUB_API_URI}/search/repositories?q=${query}`, {
    method: 'GET',
    headers: fetchGithubHeaders,
  }).then(checkStatus).then(parseJSON);
}
