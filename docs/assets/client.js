const state = {
  configPromise: null,
};

function trimTrailingSlash(url = '') {
  return url.replace(/\/+$/, '');
}

export async function loadConfig() {
  if (!state.configPromise) {
    state.configPromise = fetch('config.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load config.json');
        }
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  return state.configPromise;
}

export async function getApiBaseUrl() {
  const config = await loadConfig();
  const baseUrl = config?.apiBase;
  if (!baseUrl) {
    throw new Error('Missing apiBase in config.json');
  }
  return trimTrailingSlash(baseUrl);
}

export async function resolveApiUrl(path = '/') {
  const base = await getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function apiFetch(path, options = {}) {
  const url = await resolveApiUrl(path);
  const mergedOptions = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  };

  const response = await fetch(url, mergedOptions);
  if (!response.ok) {
    const errorBody = await safeJson(response);
    const message = errorBody?.detail || errorBody?.message || response.statusText;
    throw new Error(message || 'Request failed');
  }
  return response.json();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}
